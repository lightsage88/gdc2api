"use strict"
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


mongoose.Promise = global.Promise;



const catSchema = mongoose.Schema({

    age: {
        type: String
    },
    breed: {
        type: String
    },
    coat: {
        type: String
    },
    color: {
        type: String
    },
    description: {
        type:String
    },
    id: {
        type: Number
    },
    image: { data: Buffer, contentType: String},
    location: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    status:{
        type: String
    },
    thumbnail: {
        type: Object
        //img file??
    }

});

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type:String, 
        required: true
    },
    authToken: {
        type: String
    },
    loggedIn: {
        type: Boolean
    },
    firstName: {
        type: String, 
        required: true,
        default: ''
    },
    lastName: {
        type: String, 
        required: true,
        default: ''
    },
    birthday: {
        type: Date,
        required: false
    },
    cats: [catSchema]

});


userSchema.methods.serialize = function() {
    return {
        username: this.username || '',
        firstName: this.firstName || '',
        lastName: this.lastName || '',
        birthday: this.birthday || '',
        cats: this.cats || []
    };
};

userSchema.methods.validatePassword = function(passwordStringBeingPassedIn){
    return bcrypt.compare(passwordStringBeingPassedIn, this.password);
};

userSchema.statics.hashPassword = function(passwordStringBeingPassedIn){
    return bcrypt.hash(passwordStringBeingPassedIn, 10);
}



userSchema.virtual("fullName").get(function(){
    return `${this.firstName} ${this.lastName}`.trim();
});



userSchema.virtual("mostRecentCharacter").get(function(){
    const characterObject =
        this.characterChoices.sort((a,b)=>{
            return b.date - a.date;
        })[0] || {};
    
    return characterObject;
});

// eventSchema.virtual("image").get(function(){
//     axios({
//         url: `${this.thumbnail.path}.${this.thumbnail.extension}`,
//         responseType: 'stream',
//     })
//     .then(response => {
//         return new Promise((resolve, reject) => {
//             let eventPicture = response.data.pipe(fs.createWriteStream('./uploads/eventImage.jpg'));
//             eventImage.on('error', reject).on('close', resolve);
//         })
//     })
//     .catch(err => {
//         console.error(err);
//     })
// })

const User = mongoose.model("User", userSchema);
const Cat = mongoose.model("Cat", catSchema);
module.exports = { User, Cat};

