const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const PublicKey = require('../models/PublicKey');
const PrivateKey = require('../models/PrivateKey');
const { generateKeyPairSync } = require('crypto'); // Import crypto module
const { encrypt } = require('../utils/encryption');

// Google Strategy
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value
            });
            await user.save();

            // Generate a new RSA key pair
            const { publicKey, privateKey } = generateKeyPairSync('rsa', {
                modulusLength: 2048,
            });

            // console.log({privateKey,publicKey});
            // Convert keys to PEM format
            const publicKeyPEM = publicKey.export({
                type: 'pkcs1',
                format: 'pem',
            }).toString();

            const privateKeyPEM = privateKey.export({
                type: 'pkcs1',
                format: 'pem',
            }).toString();

            // Encrypt keys before saving to the database
            const encryptedUserId = encrypt(user._id.toString());
            const encryptedPrivateKey = encrypt(privateKeyPEM);
            // console.log(encryptedUserId);
            // console.log(encryptedPrivateKey)
            // Save keys in respective models
            const publicKeyDoc = new PublicKey({ userId: encryptedUserId, publicKey: publicKeyPEM });
            const privateKeyDoc = new PrivateKey({ userId: encryptedUserId, privateKey: encryptedPrivateKey });

            await publicKeyDoc.save();
            await privateKeyDoc.save();
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

module.exports = passport;
