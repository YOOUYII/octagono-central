const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');

const rpName = 'Octágono Central';
const rpID = process.env.RP_ID || 'localhost'; 
const expectedOrigin = process.env.FRONTEND_URL || 'http://localhost:4200';

console.log(`[BiometricService] rpID: ${rpID}, expectedOrigin: ${expectedOrigin}`);

const generateRegOptions = async (user, excludeCredentials = []) => {
    return generateRegistrationOptions({
        rpName,
        rpID,
        userID: user.id,
        userName: user.email,
        excludeCredentials: excludeCredentials.map(c => ({
            id: c.credential_id,
            type: 'public-key',
        })),
        authenticatorSelection: {
            userVerification: 'preferred',
        },
    });
};

const verifyRegResponse = async (body, expectedChallenge) => {
    return verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin,
        expectedRPID: rpID,
    });
};

const generateAuthOptions = async (allowCredentials = []) => {
    return generateAuthenticationOptions({
        rpID,
        allowCredentials: allowCredentials.map(c => ({
            id: c.credential_id,
            type: 'public-key',
        })),
        userVerification: 'preferred',
    });
};

const verifyAuthResponse = async (body, expectedChallenge, authenticator) => {
    return verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin,
        expectedRPID: rpID,
        authenticator: {
            credentialPublicKey: Buffer.from(authenticator.public_key, 'base64'),
            credentialID: authenticator.credential_id,
            counter: 0, // Simplified for now
        },
    });
};

module.exports = {
    generateRegOptions,
    verifyRegResponse,
    generateAuthOptions,
    verifyAuthResponse
};
