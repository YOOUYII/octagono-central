const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../db/supabase');
const { sendVerificationEmail, sendOTPEmail } = require('../services/email.service');

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
        if (existingUser) return res.status(400).json({ error: 'El email ya está registrado' });

        const password_hash = await bcrypt.hash(password, 10);
        const email_verification_token = crypto.randomUUID();
        const token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { data: newUser, error } = await supabase.from('users').insert([{
            email, password_hash, name, status: 0, email_verified: false,
            email_verification_token, token_expires_at,
            created_at: new Date().toISOString()
        }]).select().single();

        if (error) throw error;

        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${email_verification_token}`;
        
        // No bloqueamos el response si el email falla, lo enviamos asíncronamente
        sendVerificationEmail(email, name, verificationLink).catch(err => console.error('Error enviando email', err));

        res.status(201).json({ message: 'Usuario registrado. Revisa tu correo para confirmar.', userId: newUser.id });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token requerido' });

        const { data: user } = await supabase.from('users')
            .select('*').eq('email_verification_token', token).single();

        if (!user || new Date() > new Date(user.token_expires_at)) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        const { error } = await supabase.from('users').update({
            status: 1, email_verified: true, email_verification_token: null, token_expires_at: null
        }).eq('id', user.id);

        if (error) throw error;
        res.status(200).json({ message: 'Correo verificado con éxito. Ya puedes iniciar sesión.' });
    } catch (err) {
        res.status(500).json({ error: 'Error interno', details: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle();

        if (!user) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
        if (user.status === 0) {
            return res.status(401).json({ error: 'Cuenta inactiva. Verifica tu correo electrónico.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

        // Generar OTP de 4 dígitos
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        // Guardar OTP en BD
        const { error: updateError } = await supabase.from('users').update({
            otp_code: otpCode,
            otp_expires_at: otpExpiresAt
        }).eq('id', user.id);

        if (updateError) throw updateError;

        // Enviar correo de manera asíncrona
        sendOTPEmail(user.email, user.name, otpCode).catch(err => console.error('Error enviando OTP', err));

        res.status(200).json({ 
            message: 'Código enviado. Por favor verifica tu correo.', 
            requireOtp: true, 
            email: user.email 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error de login', details: err.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ error: 'Email y código son requeridos' });

        const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        if (user.otp_code !== code) {
            return res.status(401).json({ error: 'Código inválido' });
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            return res.status(401).json({ error: 'El código ha expirado' });
        }

        // Limpiar OTP
        await supabase.from('users').update({ otp_code: null, otp_expires_at: null }).eq('id', user.id);

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, status: user.status },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ message: 'Login exitoso', token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: 'Error verificando OTP', details: err.message });
    }
};

const resendVerification = async (req, res) => {
    // Para simplificar
    res.status(200).json({ message: 'Funcionalidad de reenvío pendiente de implementar' });
};

module.exports = { register, verifyEmail, login, verifyOtp, resendVerification };
