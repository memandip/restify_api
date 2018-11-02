const errors = require('restify-errors');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { authenticate } = require('../auth');

module.exports = server => {

    server.post('/register', (req, res, next) => {
        const { email, password } = req.body;
        const user = new User({
            email,
            password
        });
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, async (err, hash) => {
                user.password = hash;
                try{
                    await user.save();
                    res.send(201);
                    next();
                }   catch(err){
                    return next(new errors.InternalError(err))
                }
            });
        });
    });


    // Auth user
    server.post('/auth', async (req, res, next) => {
        const { email, password } = req.body;
        try{
            // Authticate user
            const user = await authenticate(email, password);
            
            // Create JWT
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });

            const { iat, exp } = jwt.decode(token);
            
            // Respond with token
            res.send({ iat, exp, token });
            next();
        }   catch(err){
            return next(new errors.UnauthorizedError(err));
        }
    });

}