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

//TODO: DLETE This path
router.get("/rollcall", (req, res)=>{
    return User.find()
    .then(response => {
        return res.send(response);
    })
    .catch(err => console.error(err));
})



///Account Creation, Editing, and Deletion//////////////////////


const zodiacFinder = (dateArray) => {
  console.log('zodiacFinder running');
  switch(dateArray[0]) {
    case 1:
      if(dateArray[1] >= 1 && dateArray[1] <= 20) {
        console.log('CAPRICORN');
        return {
          "zodiacSign":"CAPRICORN",
          "catType":"Tabby"
        };
      } else if(dateArray[1] >= 21 && dateArray[1] <= 31) {
        console.log('AQUARIUS');
        return {
          "zodiacSign":"AQUARIUS",
          "catType":"Manx"
        };
      }
    break;
    case 2:
    if(dateArray[1] >= 1 && dateArray[1] <= 18) {
      console.log('AQUARIUS');
      return {
        "zodiacSign":"AQUARIUS",
        "catType":"Manx"
      };
    } else if(dateArray[1] >= 19 && dateArray[1] <= 29) {
      console.log('PISCES');
      return {
        "zodiacSign":"PISCES",
        "catType":"Exotic Shorthair"
      };
    }
    break;

    case 3:
    if(dateArray[1] >= 1 && dateArray[1] <= 20) {
      console.log("PISCES");
      return {
        "zodiacSign":"PISCES",
        "catType":"Exotic Shorthair"
      };
    } else if (dateArray[1] >= 21 && dateArray[1] <= 31) {
      console.log('ARIES')
      return {
        "zodiacSign":"ARIES",
        "catType":"Maine Coon"
      };
    }
    break;

    case 4:
    if(dateArray[1] >= 1 && dateArray[1] <= 19) {
      console.log("ARIES")
      return {
        "zodiacSign":"ARIES",
        "catType":"Maine Coon"
      };
    } else if(dateArray[1] >= 20 && dateArray[1] <= 30) {
      console.log('TAURUS');
      return {
        "zodiacSign":"TAURUS",
        "catType":"Persian"
      };
    }
    break;

    case 5:
    if(dateArray[1] >= 1 && dateArray[1] <= 20 ) {
      console.log("TARUS");
      return {
        "zodiacSign":"TAURUS",
        "catType":"Persian"
      };
    } else if(dateArray[1] >= 21 && dateArray[1] <= 31 ) {
      console.log('GEMINI')
      return {
          "zodiacSign":"GEMINI",
          "catType":"Calico"
      };
    }
    break;

    case 6:
    if(dateArray[1] >= 1 && dateArray[1] <= 20 ) {
      console.log("GEMINI")
      return {
          "zodiacSign":"GEMINI",
          "catType":"Calico"
      };
    } else if(dateArray[1] >= 21 && dateArray[1] <= 30 ) {
      console.log("CANCER");
      return {
        "zodiacSign":"CANCER",
        "catType":"Ragdoll"
      };
    }
    break;

    case 7:
    if(dateArray[1] >= 1 && dateArray[1] <= 22){
      console.log("CANCER");
      return {
        "zodiacSign":"CANCER",
        "catType":"Ragdoll"
      };
    } else if(dateArray[1] >= 23 && dateArray[1] <= 31) {
      console.log("LEO")
      return {
        "zodiacSign":"LEO",
        "catType":"Siamese"
      };
    }
    break;

    case 8:
    if(dateArray[1] >= 1 && dateArray[1] <= 22) {
      console.log("LEO");
      return {
        "zodiacSign":"LEO",
        "catType":"Siamese"
      };
    } else if(dateArray[1] >= 23 && dateArray[1] <= 31) {
      console.log("VIRGO");
      return {
        "zodiacSign":"VIRGO",
        "catType":"American Shorthair"
      };
    }
    break;

    case 9:
    if(dateArray[1] >= 1 && dateArray[1] <= 22) {
      console.log("VIRGO");
      return {
        "zodiacSign":"VIRGO",
        "catType":"American Shorthair"
      };
    } else if(dateArray[1] >= 23 && dateArray[1] <= 30) {
      console.log('LIBRA');
      return {
        "zodiacSign":"LIBRA",
        "catType":"Tuxedo"
      };
    }
    break;

    case 10:
    if(dateArray[1] >= 1 && dateArray[1] <= 22 ){
      console.log("LIBRA");
      return {
        "zodiacSign":"LIBRA",
        "catType":"Tuxedo"
      };
    } else if(dateArray[1] >= 23 && dateArray[1] <= 31) {
      console.log("SCORPIO");
      return {
        "zodiacSign":"SCORPIO",
        "catType":"Sphynx / Hairless Cat"
      };
    }

    case 11:
    if(dateArray[1] >= 1 && dateArray[1] <= 21 ) {
      console.log("SCORPIO");
      return {
        "zodiacSign":"SCORPIO",
        "catType":"Sphynx / Hairless Cat"
      };
    } else if(dateArray[1] >= 22 && dateArray[1] <= 30 ) {
      console.log("SAGITTARIUS");
      return {
        "zodiacSign":"SAGITTARIUS",
        "catType":"Bengal"
      };
    }
    break;

    case 12:
    if(dateArray[1] >= 1 && dateArray[1] <= 21) {
      console.log("SAGITTARIUS");
      return  {
        "zodiacSign":"SAGITTARIUS",
        "catType":"Bengal"
      };
    } else if(dateArray[1] >=22 && dateArray[1] <= 31) {
      console.log("CAPRICORN");
      return  {
        "zodiacSign":"CAPRICORN",
        "catType":"Tabby"
      };
    }

    default:
      console.log('yappp');
    break;
  }
}


router.post('/signup', jsonParser, async (req,res)=>{

///Going to deal with Birthday stuff!
console.log('hoothoot');
console.log(req.body);

let zodiacCombo = await zodiacFinder([req.body.birthday.month, req.body.birthday.day]);

// console.log(zodiacCombo);





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
                cats,
                birthday: {
                  "month": req.body.birthday.month,
                  "day": req.body.birthday.day
                },
                zodiacCombo
            });
        })
        .then(user => {
          console.log('run run');
          console.log(user);
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if(err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal Server Error'});
        });
});


router.post('/changeAccountDetails', async (req,res)=>{
  console.log('changeAccountDteails running');
    console.log(req.body);
    let updatedUser;
    let  {firstName, lastName, birthday, username, password, confirm, zodiacCombo } = req.body;
    let newZodiacCombo = await zodiacFinder([req.body.birthday.month, req.body.birthday.day]);
    if(password !== confirm) {
        console.log('nd')
        return res.send({code:401});
    }


    //need to check to see if password is the same as what we have in the account





        return User.findOne({username: username})
        .then(_user => {
            updatedUser = _user
            return updatedUser.password
        })
        .then(async hash => {
            result = await bcrypt.compare(password, hash);
            if(!result) {
                console.log('oh noes');
                return res.send({
                    code: 422,
                    reason: 'AuthenticationError',
                    message: "Game recognize game, and right now you looking pretty unfamiliar"
                });
            } else {
                    firstName !== "" && firstName !==updatedUser.firstName ? updatedUser.firstName = firstName : '';
                    lastName !== "" && lastName !== updatedUser.lastName ? updatedUser.lastName = lastName : '';
                    birthday !== "" && birthday !== updatedUser.birthday ? updatedUser.birthday = birthday : '';
                    newZodiacCombo ? updatedUser.zodiacCombo = newZodiacCombo : updatedUser.zodiacCombo = zodiacCombo;



                    console.log(updatedUser);
                    updatedUser.save();
                    return res.send({code: 201, user: updatedUser});
            }
           })


        // .then( () => {
        //     updatedUser;
        //     firstName !== "" && firstName !==updatedUser.firstName ? updatedUser.firstName = firstName : '';
        //     lastName !== "" && lastName !== updatedUser.lastName ? updatedUser.lastName = lastName : '';
        //     birthday !== "" && birthday !== updatedUser.birthday ? updatedUser.birthday = birthday : '';

        //     return updatedUser

        // })
        // .then(user => {
        //     console.log('bodyblows');
        //     console.log(updatedUser);
        //     user.save();
        //     return res.send({code: 201, user: updatedUser});
        // })
        .catch(err => {
            console.error(err);
        });

});

//Need to include changing acccount details as well.
router.post('/changePassword', (req,res) => {
    console.log('changePassword running');
    console.log(req.body);
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
            console.log('zelda fn');
            return res.send({
                code: 422,
                reason: 'AuthenticationError',
                message: "Game recognize game, and right now you looking pretty unfamiliar"
            });

        } else {
            console.log('we got the else block');
            newHash = hashIt(newPW);
            user.password = newHash;
            user.save();
            return res.send({
                code:201
            });
        }

    })
    // .then(newHash => {
    //     // user.password = newHash;
    //     // user.save();
    //     // return res.send({
    //     //     code:201
    //     // });
    // })
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
    console.log('addcat running');
    console.log(req.body.cat);
    let {age, breeds, coat, colors, description, gender, id, location, name, photos, size, status} = req.body.cat;
    let username = req.body.username;
    let user;
    return User.find({username})
    .then(_user => {
        user = _user[0];
        return Cat.create({
            age,
            breeds,
            coat,
            colors,
            description,
            gender,
            id,
            location,
            name,
            photos,
            size,
            status
        });


    })
    .then(newCat => {
        user.cats.push(newCat);
        user.save();
        console.log('behold the user');
        console.log(user);
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
        console.log('pizzatime');
        console.log(user.cats);
        console.log(newCatArray);
        user.cats = newCatArray;
        user.save();


        return res.send(user);
    })
    .catch(err => console.error(err));


})

router.post('/refreshStateWithToken', (req,res) => {
    console.log('refreshStateWithToken running');
    console.log(req.body);
    let token = req.body.token;
    let userVar;
    var decodedToken = jwt.verify(token, JWT_SECRET, (err, decoded) =>{

        return decoded.user;
    } );

    console.log(decodedToken);

    User.findOne({"username": decodedToken})
    .then(user => {
        userVar = user.serialize();
        res.status(201).send(userVar);
    })
    .catch(err => {
        console.error(err);
    });
});



module.exports = {router};
