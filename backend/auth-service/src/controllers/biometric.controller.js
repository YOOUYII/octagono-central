const supabase = require('../db/supabase');
const jwt = require('jsonwebtoken');
const biometricService = require('../services/biometric.service');

// Store challenges in memory (En prod: usar Redis o DB)
const challengeStore = new Map();

const registerChallenge = async (req, res) => {
    try {
        const { data: credentials } = await supabase.from('biometric_credentials').select('credential_id').eq('user_id', req.user.id);
        const options = await biometricService.generateRegOptions(req.user, credentials || []);
        
        challengeStore.set(`reg_${req.user.id}`, options.challenge);
        res.status(200).json(options);
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

            // Guardar credential_id como base64url string para que coincida con lo que envía el browser al hacer login
            const credential_id = req.body.id; // base64url string que el browser ya envió
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
        const { email } = req.query; // Pide el email para saber qué credenciales permitir, o generar genéricas si Discoverable Credentials
        const options = await biometricService.generateAuthOptions([]); // Dejamos vacío para Discoverable Credentials
        challengeStore.set(`auth_session_id`, options.challenge); // TODO: Manage proper sessions/ids
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
        console.log('Login attempt with credential body id:', body.id);
        const credential_id = body.id; // base64url string

        const { data: credential } = await supabase
            .from('biometric_credentials')
            .select('*, users!inner(id, email, role, status, name)')
            .eq('credential_id', credential_id)
            .single();

        if (!credential || credential.users.status === 0) {
            return res.status(401).json({ error: 'Credencial desconocida o usuario inactivo' });
        }

        // Pasar credentialID como Buffer al verificador
        const credentialWithBuffer = {
            ...credential,
            credential_id: Buffer.from(credential_id.replace(/-/g, '+').replace(/_/g, '/'), 'base64'),
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
            // Actualizar last_used_at
            await supabase.from('biometric_credentials').update({ last_used_at: new Date().toISOString() }).eq('credential_id', credential_id);
            return res.status(200).json({ message: 'Login biométrico exitoso', token, user: { id: user.id, name: user.name, role: user.role } });
        }
        res.status(401).json({ error: 'Firma biométrica inválida' });
    } catch (err) {
        res.status(500).json({ error: 'Error procesando login', details: err.message });
    }
};

module.exports = { registerChallenge, register, loginChallenge, login };
