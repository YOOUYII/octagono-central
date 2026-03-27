const axios = require('axios');

const sendVerificationEmail = async (toEmail, toName, verificationLink) => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { name: 'Octágono Central', email: process.env.BREVO_SENDER_EMAIL || 'no-reply@octagonocentral.com' },
                to: [{ email: toEmail, name: toName || 'Usuario' }],
                subject: 'Confirma tu correo electrónico - Octágono Central',
                htmlContent: `<p>Hola ${toName || 'Usuario'},</p>
                              <p>Gracias por registrarte. Haz clic en el siguiente enlace para confirmar tu cuenta y activarla:</p>
                              <a href="${verificationLink}">Confirmar mi cuenta</a>`
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error enviando email Brevo:', error.response?.data || error.message);
        throw error;
    }
};

const sendOTPEmail = async (toEmail, toName, otpCode) => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { name: 'Octágono Central', email: process.env.BREVO_SENDER_EMAIL || 'no-reply@octagonocentral.com' },
                to: [{ email: toEmail, name: toName || 'Usuario' }],
                subject: 'Tu código de inicio de sesión - Octágono Central',
                htmlContent: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                                <h2>Hola ${toName || 'Usuario'}</h2>
                                <p>Has intentado iniciar sesión en Octágono Central.</p>
                                <p>Tu código de seguridad temporal es:</p>
                                <h1 style="color: #ef4444; font-size: 36px; letter-spacing: 5px; margin: 20px 0;">${otpCode}</h1>
                                <p style="color: #666;">Este código expirará en 5 minutos. Si no fuiste tú, ignora este correo.</p>
                              </div>`
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error enviando OTP via Brevo:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = { sendVerificationEmail, sendOTPEmail };
