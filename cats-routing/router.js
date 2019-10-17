const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {PETFINDER_CLIENT_ID, PETFINDER_CLIENT_SECRET, PETFINDER_TOKEN, PETFINDER_API_URL} = require('../config');
const router = express.Router();
let token;
// 
const refreshPetFinderToken = () => {
    //we need to run
            // xios({
            //     url: `${mAPI}/characters?nameStartsWith=${query}`,
            //     method: "GET",
            //     params:{
            //         "apikey": `${mPublicKey}`,
            //         "ts": `${timeStamp}`,
            //         "hash": `${hash}`
            //     },
            //     headers: {
            //         "accept": "application/json",
            //     }
    //$ curl -d "grant_type=client_credentials&client_id=XgCPNJwDy9c4aedC6NO3bR3f7FaZJyjxkWFc7dp4Mcl4wwj2Rs&client_secret=sITbiLaXhFikNjnjW8QNJAgBWjMp6C09OksmLDqj" https://api.petfinder.com/v2/oauth2/token
    return axios({
        url: 'https://api.petfinder.com/v2/oauth2/token',
        method: 'POST',
        data: {
            "grant_type":"client_credentials",
            "client_id": PETFINDER_CLIENT_ID,
            "client_secret": PETFINDER_CLIENT_SECRET
        },
        headers: {
            "accept": "application/json"
        }


    })
    .then(response =>{
        console.log('////////////////////////////////////////////////////');
        // console.log(response);
        console.log(response.data);
        // process.env.PETFINDER_TOKEN = response.access_token;
        token = response.data.access_token;
        console.log(token);
        
        
    }) 
    .catch(err => {
        console.error(err);
    });
}

refreshPetFinderToken();

setInterval(()=>{
    token = refreshPetFinderToken();
}, 3500000);

router.use(express.json());

console.log('hotdog');
console.log(token);

router.post('/seekCats', (req,res) => {
    console.log('hamburger');
    console.log(token);
    //   let petFinderToken =  refreshPetFinderToken();
    
    axios({
        url: `${PETFINDER_API_URL}`,
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${token}`,
            "accept": "application/json"
        }
    })
    .then(response => {
        console.log('wolbocho');
        console.log(response.data);
        res.send(response.data);
    })
    .catch(err => {
        console.error(err);
    });

   
   

});




// const refreshPetFinderToken = () => {
//     console.log(PETFINDER_CLIENT_ID);
//     console.log(PETFINDER_CLIENT_SECRET);
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
//     axios({
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
//     .then(response =>{
//         console.log('////////////////////////////////////////////////////');
//         console.log(response);
//         petFinderToken = response.access_token;
//         return response.access_token
        
//     })
//     .catch(err => {
//         console.error(err);
//     });
// }

module.exports = {router};