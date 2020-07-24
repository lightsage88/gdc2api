const express = require('express');
const cors = require('cors')
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
        console.log('///////////////////////WILLY NILLY/////////////////////////////');
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
}, 39000);

router.use(express.json());
router.use(cors())
router.options('*', cors())
//gender x (male, female) [multiple values can be set like so ==> gender=male,female]
        //gender can be set with radio buttons
//breed x (many to choose from) [multiple values can be set like so ===> breed=american shorthair, abyssinian]
    //have a checklist to click from...like a checkbox?

//size (small, medium, large, xlarge) [multiple values can be set like so===> size=large,xlarge,small]
        //size can be set with radio buttons

//age (baby, young, adult, senior) [multiple values can be set like so ==> age=baby,senior]
        //age can be set with radio buttons

//color
//coat (short, medium, long, hairless) [multiple values can be set like so ==> coat=short,medium]
        //coat can be set with radio buttons
//location ==== requires user to enter it
//distance ========requires location to be set, has a max of 500 for miles



router.post('/seekCats', (req,res) => {
    console.log('hamburger');
    console.log(req.body);
    console.log(token);
    let {breed, coat, color, gender, age} = req.body;
    console.log(breed, coat,color);
    //   let petFinderToken =  refreshPetFinderToken();
    //"https://api.petfinder.com/v2/animals?type=cat";
    
    axios({
        url: `${PETFINDER_API_URL}/animals?type=cat&breed=${breed}&coat=${coat}&color=${color}&gender=${gender}&age=${age}`,
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${token}`,
            "accept": "application/json"
        }
    })
    .then(response => {
        console.log('wolbocho');
        console.log(response.data);
        res.send(response.data.animals);
    })
    .catch(err => {
        console.error(err);
    });
});

router.get('/catBreeds', (req, res) => {
    axios({
        url: `${PETFINDER_API_URL}/types/cat/breeds`,
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`,
            "accept": "application/json"
        }
    })
    .then(response => {
        console.log(response.data);
        res.send(response.data);
    })
    .catch(err => {
        console.error(err);
    });
});

router.get('/catColorCoatSex', (req,res) => {
    axios({
        url: `${PETFINDER_API_URL}/types/cat`,
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        res.send(response.data.type);
    })
    .catch(err => {
        console.error(err);
    });
});




module.exports = {router};