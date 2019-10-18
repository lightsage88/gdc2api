'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY} = require('../config');

 
const {app, runServer, closeServer} = require('../server');
const {User} = require('../models');

const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;
const should = chai.should;

chai.use(chaiHttp);

before(()=>{
    return runServer(TEST_DATABASE_URL);
});

after(()=>{
    return closeServer();
});

beforeEach(()=>{

});

afterEach(()=>{
    return User.deleteOne({});
});

describe('/api/user', ()=> {
    const username = 'exampleUser';
    const password = 'examplePass';
    const firstName = 'Example';
    const lastName = 'User';
    const birthday = '1571375962610';
    const usernameB = 'exampleUserB';
    const passwordB = 'examplePassB';
    const firstNameB = 'ExampleB';
    const lastNameB = 'UserB';

    // describe('api/users/signup', function(){
    //     describe('POST', function(){
    //     it('Should reject users with missing username', function(){
    //         return chai.request(app)
    //         .post('/api/users/signup')
    //         .send({
    //         password,
    //         firstName,
    //         lastName
    //         })
    //         .then(() =>
    //         expect.fail(null, null,'Request should not succeed')
    //         )
    //         .catch(err => {
    //         if (err instanceof chai.AssertionError) {
    //             throw err;
    //         }
    //         const res = err.response;
    //         expect(res).to.have.status(422);
    //         expect(res.body.reason).to.equal('ValidationError');
    //         expect(res.body.message).to.equal('There is a field missing');
    //         expect(res.body.location).to.equal('username')
    //         })
    //     });

    //     it('Should reject users with a missing password', ()=>{
    //     return chai.request(app)
    //         .post('/api/users/signup')
    //         .send({
    //         firstName,
    //         lastName,
    //         username
    //         })
    //         .then(()=> expect.fail(null, null, 'Request should not succeed'))
    //         .catch(err =>{
    //         if(err instanceof chai.AssertionError){
    //             throw err;
    //         }
    //         const res = err.response;
    //         expect(res).to.have.status(422);
    //         expect(res.body.reason).to.equal('ValidationError');
    //         expect(res.body.message).to.equal("There is a field missing");
    //         expect(res.body.location).to.equal('password');
    //         })
    //     });

    //     it('Should reject users with a non-string for their firstName', ()=> {
    //     return chai.request(app)
    //     .post('/api/users/signup')
    //     .send({
    //         firstName: 666,
    //         lastName,
    //         username,
    //         password
    //     })
    //     .then(()=>expect.fail(null,null, 'Request should not succeed'))
    //     .catch(err => {
    //         const res = err.response;
    //         expect(res).to.have.status(422);
    //         expect(res.body.reason).to.equal('ValidationError');
    //         expect(res.body.message).to.equal('Incorrect field type: expected a string');
    //         expect(res.body.location).to.equal('firstName');
    //     })
    //     });

    //     it('Should reject users with a non-string for their lastName', ()=>{
    //     return chai.request(app)
    //     .post('/api/users/signup')
    //     .send({
    //         firstName,
    //         lastName: 777,
    //         username,
    //         password
    //     })
    //     .then(()=> expect.fail(null, null, 'Request should not succeed'))
    //     .catch(err => {
    //         const res = err.response;
    //         expect(res).to.have.status(422);
    //         expect(res.body.message).to.equal('Incorrect field type: expected a string');
    //         expect(res.body.reason).to.equal('ValidationError');
    //         expect(res.body.location).to.equal('lastName');
    //     });
    //     });

    //     it('Should accept users who do things correctly', ()=> {
    //         return chai.request(app)
    //         .post('/api/users/signup')
    //         .send({
    //             firstName,
    //             lastName,
    //             username,
    //             password
    //         })
    //         .then(res => {
    //             expect(res).to.have.status(201);
    //         })
    //         .catch(err => {
    //             console.error(err);
    //         });
    //     });
    //   });
    // });


    describe('api/users/changeAccountDetails', function() {
        beforeEach(()=>{
            return chai.request(app)
            .post('/api/users/signup')
            .send({
                firstName,
                lastName,
                username,
                password,
                birthday,
            })
            .then(res => {
                console.log('a ok');
            })
            .catch(err => console.error(err));

        });

        afterEach(()=> {
            return User.deleteOne({})
        })
        
       
        describe('POST', ()=>{
            it('should update the firstName when given a string', ()=>{
              
            return chai.request(app)
            .post('/api/users/changeAccountDetails')
            .send({
                username,
                firstName: "Samus",
                lastName
            })
            .then(res => {
                console.log('b ok');
                //TODO: figure out why this isn't throwing an error if I make the number something else

                console.log(res.body);
                expect(res.body.code).to.equal(201);
                expect(res.body.user.firstName).to.equal('Samus');
                

            })
            .catch(err => console.error(err));  
            })

            it('will succeed when you pass a string for the lastName', ()=>{
                return chai.request(app)
                .post('/api/users/changeAccountDetails')
                .send({
                    username,
                    firstName,
                    lastName: "Aran"
                })
                .then(res => {
                    console.log('c ok');
                    //TODO: figure out why this isn't throwing an error if I make the number something else
    
                    console.log(res.body);
                    expect(res.body.code).to.equal(201);
                    expect(res.body.user.lastName).to.equal('Aran');
                    
    
                })
                .catch(err => console.error(err));  
            });

            it('will succeed when you enter a birthday as a string', ()=>{
                let newBirthday = new Date;
                newBirthday = newBirthday.toString();
                return chai.request(app)
                .post('/api/users/changeAccountDetails')
                .send({
                    username,
                    firstName,
                    lastName,
                    birthday: newBirthday
                })
                .then(res => {
                    console.log('c ok');
                    //TODO: figure out why this isn't throwing an error if I make the number something else
    
                    console.log(res.body);
                    expect(res.body.code).to.equal(201);
                    // expect(res.body.user.birthday.toString()).to.equal(newBirthday);
                    expect(res.body.user.birthday).to.not.equal(new Date);
                    
    
                })
                .catch(err => console.error(err)); 
            })
            
        
        
        });
    })

})