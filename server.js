'use strict'
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const {router: usersRouter} = require('./users-routing');
const {router: catRouter} = require('./cats-routing');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth-routing');
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
const { PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRY, PETFINDER_CLIENT_ID, PETFINDER_CLIENT_SECRET} = require('./config');
const app = express();
app.use(express.json());
app.use(cors());
// app.use(function(req, res, next){
// 	res.header('Access-Control-Allow-Origin', '*');
// 	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// 	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
// 	if (req.method === 'OPTIONS') {
// 		return res.send(204);
// 	}
// 	next();
// });


app.use(express.static('public'));
passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(morgan('common'));

// app.use(multer({dest:'./uploads/'}).single('photo'));
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/cats', catRouter);
const logErrors = (err, req, res, next) => {
    console.error(err);
    return res.status(500).json({Error: 'Something went awry'});

}




app.use(logErrors);

// let token;

// const generatePetFinderToken = () => {
//     //we need to run
//             // xios({
//             //     url: `${mAPI}/characters?nameStartsWith=${query}`,
//             //     method: "GET",
//             //     params:{
//             //         "apikey": `${mPublicKey}`,
//             //         "ts": `${timeStamp}`,
//             //         "hash": `${hash}`
//             //     },
//             //     headers: {
//             //         "accept": "application/json",
//             //     }
//     //$ curl -d "grant_type=client_credentials&client_id=XgCPNJwDy9c4aedC6NO3bR3f7FaZJyjxkWFc7dp4Mcl4wwj2Rs&client_secret=sITbiLaXhFikNjnjW8QNJAgBWjMp6C09OksmLDqj" https://api.petfinder.com/v2/oauth2/token
//     return axios({
//         url: 'https://api.petfinder.com/v2/oauth2/token',
//         method: 'POST',
//         data: {
//             "grant_type":"client_credentials",
//             "client_id": PETFINDER_CLIENT_ID,
//             "client_secret": PETFINDER_CLIENT_SECRET
//         },
//         headers: {
//             "accept": "application/json"
//         }


//     })
//     .then( (response) =>{
//         console.log('////////////////////////////////////////////////////');
//         console.log(response);
//         // process.env.PETFINDER_TOKEN = response.access_token;
//         token =  response.access_token
        
//     })
//     .catch(err => {
//         console.error(err);
//     });
// }

let server;


function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject)=> {
        mongoose.connect(
            databaseUrl,
            {useNewUrlParser: true},
            err => {
                if(err) {
                    return reject(err);
                }
                server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
            }
        );
    });
}

function closeServer() {
    return mongoose.disconnect().then(()=> {
        return new Promise((resolve, reject) => {
            console.log('closing the server');
            server.close(err => {
                if(err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}



if(require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}



module.exports = {app, runServer, closeServer};