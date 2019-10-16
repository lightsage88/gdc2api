'use strict'
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const {router: usersRouter} = require('./users-routing');
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
const { PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRY} = require('./config');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static('public'));

app.use(morgan('common'));

// app.use(multer({dest:'./uploads/'}).single('photo'));
app.use('/api/users', usersRouter);
const logErrors = (err, req, res, next) => {
    console.error(err);
    return res.status(500).json({Error: 'Something went awry'});

}

app.use(logErrors);


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