'use strict';
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const {JWT_SECRET, JWT_EXPIRY} = require('../config');
const router = express.Router();
const createAuthToken = function(user) {
    return jwt.sign({user}, JWT_SECRET, {
        subject: String(user.username),
        expiresIn: JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());

//Human provides a username and password to log in
router.post('/login', localAuth, (req,res)=> {
    console.log(req.user.username);

    const user = req.user.serialize()
    const authToken = createAuthToken(String(req.user.username));
    console.log('goofy');
    console.log(authToken);
    res.json({authToken, user} || err);
});

const jwtAuth = passport.authenticate('jwt', {session:false});

//Human exchanges a valid JWT for a new one with a later expiry date

router.post('/refreshToken', jwtAuth, (req,res)=>{
    console.log('refreshToken running');
    console.log(req);
    //I can only surmise that we do not call req.user.serialize() because that version of 'user' had already been created
    //the first go around with /login
    const authToken = createAuthToken(req.user);
    res.json({authToken})
})





module.exports = {router};