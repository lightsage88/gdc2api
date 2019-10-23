const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY} = require("../config");
const {User, Cat} = require('../models');

const router = express.Router();

const jsonParser = bodyParser.json();

router.use(express.json());

///Account Creation, Editing, and Deletion//////////////////////

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

    let {username, password, firstName='', lastName='', cats} = req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();

    return User.find({username})
        .countDocuments()
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
                lastName,
                cats
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
    let {firstName, lastName, birthday, username} = req.body;
    
    return User.findOne({username: username})
        .then(_user => {
            updatedUser = _user;
            firstName !== "" && firstName !==updatedUser.firstName ? updatedUser.firstName = firstName : '';
            lastName !== "" && lastName !== updatedUser.lastName ? updatedUser.lastName = lastName : '';
            birthday !== "" && birthday !== updatedUser.birthday ? updatedUser.birthday = birthday : '';
            
            return updatedUser

        })
        .then(updatedUser => {
            updatedUser.save();
            return res.send({code: 201, user: updatedUser});
        })
        .catch(err => {
            console.error(err);
        });
});

//Need to include changing acccount details as well.
router.post('/changePassword', (req,res) => {

    let user;
    let newHash;
   
    const hashIt = (pwString) => {
        return bcrypt.hash(pwString, 10);
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
        user = _user
        

        return user.password;
    })
    .then(async hash => {
        result = await bcrypt.compare(req.body.oldPW, hash);
        if(!result) {
            return res.send({
                code: 422,
                reason: 'AuthenticationError',
                message: "Game recognize game, and right now you looking pretty unfamiliar"
            });
        } else {
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

});

/////////Deleting Account////////////
router.post('/deleteAccount', (req,res) => {
    let {username, clientPasswordInput} = req.body;

    return User.findOne({username})
    .then(_user => {
        user = _user
        

        return user.password;
    })
    .then(async hash => {
        result = await bcrypt.compare(clientPasswordInput, hash);
        if(!result) {
            return res.send({
                code: 422,
                reason: 'AuthenticationError',
                message: "Game recognize game, and right now you looking pretty unfamiliar"
            });
        } else {
            return User.deleteOne({username})
            .then(response => {
                console.log(response.body);
                return res.status(202).json({message: "Account Deleted"});
            })
            .catch(err => console.error(err));          
        }
    })
    .catch(err => {
        console.error(err);
    })


})


/////////////////Adding/Removing Cats///////////////////////

router.post('/addCat', (req,res) => {
    let {age, breed, coat, color, description, id, image, location, name, size, status, username } = req.body;
    let user;
    return User.find({username})
    .then(_user => {
        user = _user[0];
        return Cat.create({
            age,
            breed,
            coat,
            color,
            description,
            id, 
            image, 
            location, 
            name, 
            size, 
            status
        });


    })
    .then(newCat => {
        user.cats.push(newCat);
        user.save();
        return res.status(201).json({message: "Cat added to kennel!", cat: newCat});
    })
    .catch(err => console.error(err));

});

router.post('/removeCat', (req,res) => {
    let user;
    let {catID, username} = req.body;
    return User.find({username})
    .then(_user => {
        user = _user[0]
        return user;
    })
    .then(user => {
        let newCatArray = user.cats.filter(object=>{
           return object.id !== catID
        })
        user.cats = newCatArray;
        return res.send(user);
    })
    .catch(err => console.error(err));


})



module.exports = {router};