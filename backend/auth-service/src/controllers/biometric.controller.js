const supabase = require('../db/supabase');
const jwt = require('jsonwebtoken');
const biometricService = require('../services/biometric.service');

// Store challenges in memory (En prod: usar Redis o DB)
const challengeStore = new Map();

const registerChallenge = async (req, res) => {
    try {
        const { data: credentials } = await supabase.from('biometric_credentials').select('credential_id').eq('user_id', req.user.id);
        const options = await biometricService.generateRegOptions(req.user, credentials || []);
        
        // El challenge original se guarda para verificación
        challengeStore.set(`reg_${req.user.id}`, options.challenge);

        // Convertir Buffers a Base64URL para el frontend (@simplewebauthn/browser espera strings)
        const optionsJSON = {
            ...options,
            challenge: options.challenge, // generateRegistrationOptions de v9 ya devuelve string si se usa bien, pero aseguramos
            user: {
                ...options.user,
                id: Buffer.from(req.user.id).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
            },
            excludeCredentials: (options.excludeCredentials || []).map(c => ({
                ...c,
                id: c.id // ya es string/buffer? lo dejamos como está o aseguramos string
            }))
        };

        res.status(200).json(optionsJSON);
    } catch (err) {
        res.status(500).json({ error: 'Error generando challenge de registro', details: err.message });
    }
};

const register = async (req, res) => {
    try {
        const expectedChallenge = challengeStore.get(`reg_${req.user.id}`);
        if (!expectedChallenge) return res.status(400).json({ error: 'Challenge no encontrado o expirado' });
        
        const verification = await biometricService.verifyRegResponse(req.body, expectedChallenge);
        if (verification.verified) {
            const { registrationInfo } = verification;

            const credential_id = req.body.id; 
            const public_key = Buffer.from(registrationInfo.credentialPublicKey).toString('base64');
            
            await supabase.from('biometric_credentials').insert([{
                user_id: req.user.id,
                credential_id,
                public_key,
                device_name: 'AuthDevice',
                created_at: new Date().toISOString(),
                last_used_at: new Date().toISOString()
            }]);
            
            challengeStore.delete(`reg_${req.user.id}`);
            return res.status(200).json({ message: 'Huella registrada con éxito' });
        }
        res.status(400).json({ error: 'Verificación fallida' });
    } catch (err) {
        res.status(500).json({ error: 'Error en registro biométrico', details: err.message });
    }
};

const loginChallenge = async (req, res) => {
    try {
        const options = await biometricService.generateAuthOptions([]); 
        challengeStore.set(`auth_session_id`, options.challenge);
        res.status(200).json(options);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
};

const login = async (req, res) => {
    try {
        const expectedChallenge = challengeStore.get(`auth_session_id`);
        if (!expectedChallenge) return res.status(400).json({ error: 'Challenge inválido' });

        const body = req.body;
        const credential_id = body.id; 

        const { data: credential } = await supabase
            .from('biometric_credentials')
            .select('*, users!inner(id, email, role, status, name)')
            .eq('credential_id', credential_id)
            .single();

        if (!credential || credential.users.status === 0) {
            return res.status(401).json({ error: 'Credencial desconocida o usuario inactivo' });
        }

        const credentialWithBuffer = {
            ...credential,
            publicKey: Buffer.from(credential.public_key, 'base64'),
            credentialID: credential.credential_id,
            counter: 0
        };

        const verification = await biometricService.verifyAuthResponse(body, expectedChallenge, credentialWithBuffer);
        if (verification.verified) {
            const user = credential.users;
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, status: user.status },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            challengeStore.delete(`auth_session_id`);
            await supabase.from('biometric_credentials').update({ last_used_at: new Date().toISOString() }).eq('credential_id', credential_id);
            return res.status(200).json({ message: 'Login biométrico exitoso', token, user: { id: user.id, name: user.name, role: user.role } });
        }
        res.status(401).json({ error: 'Firma biométrica inválida' });
    } catch (err) {
        res.status(500).json({ error: 'Error procesando login', details: err.message });
    }
};

module.exports = { registerChallenge, register, loginChallenge, login };
