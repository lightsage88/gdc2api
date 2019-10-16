const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY} = require("../config");
const {User} = require('../models');

const router = express.Router();

const jsonParser = bodyParser.json();

router.use(express.json());



router.post('/signup', jsonParser, (req,res)=>{
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if(missingField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'There is a field missing',
            location: missingField
        });
    }

    const stringFields = ['username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if(nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: "Incorrect field type: expected a string",
            location: nonStringField
        });
    }

    //Now we explicitly reject non trimmed values for username or password
    const explicitlyTrimmedFields = ["username", "password"];
    const nonTrimmedField = explicitlyTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if(nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: "Cannot start or end with a whitespace",
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 10,
            max: 72
        }
    };

    const tooSmallField = Object.keys(sizedFields).find(
        field => 'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
    );

    const tooLargeField = Object.keys(sizedFields).find(
        field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
    );

    if(tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
                                : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let {username, password, firstName='', lastName=''} = req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();

    return User.find({username})
        .count()
        .then(count => {
            if(count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            }
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                username,
                password: hash,
                firstName,
                lastName
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if(err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal Server Error'});
        });
});


router.post('/changeAccountDetails', (req,res)=>{
    let updatedUser;
    console.log('asfsdf');
    let {firstName, lastName, birthday, username} = req.body;
    console.log(firstName, lastName, birthday, username);
    console.log(typeof(birthday));
    console.log(birthday === '');
    
    return User.findOne({username: username})
        .then(_user => {
            updatedUser = _user;
            firstName !== "" && firstName !==updatedUser.firstName ? updatedUser.firstName = firstName : '';
            lastName !== "" && lastName !== updatedUser.lastName ? updatedUser.lastName = lastName : '';
            birthday !== "" && birthday !== updatedUser.birthday ? updatedUser.birthday = birthday : '';
            
            // updatedUser.save();
            console.log(updatedUser);
            // res.send(updatedUser);
            return updatedUser

        })
        .then(updatedUser => {
            updatedUser.save();
            return res.send({code: 201})
        })
        .catch(err => {
            console.error(err);
        });
});

//Need to include changing acccount details as well.
router.post('/changePassword', (req,res) => {
    console.log(req.body);
    let user;
    let newHash;
    const hashIt = (pwString) => {
        console.log(pwString);
        return bcrypt.hash(pwString, 10);
    }
    const compare = (pwString, hash) => {
        return bcrypt.compare(pwString, hash)
    }
    let newPW = req.body.newPW;
    let result;
    if(newPW.trim() !== newPW) {
        return res.send({
            code: 422,
            reason: 'ValidationError',
            message: "Cannot start or end with a whitespace",
        });
    }

    return User.findOne({username: req.body.username})
    .then(_user => {
        user = _user;
        return user.password;
    })
    .then(hash => {
        result = compare(req.body.oldPW, hash);
        if(!result) {
            return res.send({
                code: 422,
                reason: 'AuthenticationError',
                message: "Game recognize game, and right now you looking pretty unfamiliar"
            });
        } else {
            console.log('yippee');
            newHash = hashIt(newPW);
            
            return newHash;
            
        }
        return newHash
    })
    .then(newHash => {
        user.password = newHash;
        user.save();
        return res.send({
            code:201
        });
    })
    .catch(err => {
        console.error(err);
    })

})



module.exports = {router};