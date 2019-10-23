'use strict';
const dotenv = require('dotenv');
require('dotenv').config();
// let { JWT_SECRET } = require('../config');
let JWT_SECRET = dotenv.config();

//the export of 'Strategy' from passport-local will be named LocalStrategy
const {Strategy: LocalStrategy} = require('passport-local');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');
const {User} = require('../models');
const localStrategy = new LocalStrategy((username, password, callback) => {
    let user;

    User.findOne({username: username})
    .then(foundUser => {
        user = foundUser;
        if(!user) {
            return Promise.reject({
                reason: 'LoginError',
                message: 'Incorrect username or password'
            });
        }
        return user.validatePassword(password);
    })
    .then(isValid => {
        if(!isValid) {
            return Promise.reject({
                reason: "LoginError",
                message: "Incorrect username or password"
            });
        }
        return callback(null, user)
    })
    .catch(err => {
        if(err.reason === 'LoginError') {
            
            return callback(null, false, err);
        }
        return callback(err, false)
    });
});

const jwtStrategy = new JwtStrategy(
    {
    secretOrKey: JWT_SECRET,
        //Get the jwt by extracting it from the header, using the scheme "Bearer"
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        //Only allow HS256 encrypted tokens, the same type we use
    algorithms: ['HS256']
    },
    (payload, done) => {
        done(null, payload.user);
    }
);


module.exports = {localStrategy, jwtStrategy};

