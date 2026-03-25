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

module.exports = { sendVerificationEmail };
