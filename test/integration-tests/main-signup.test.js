const server_modules = require('../../app')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');
const { response } = require('../../routes/signup');

//integration test for signup page
//happy path
describe('Integration main to signup', () => {
    context('happy path', () => {
            context('given valid signup credentials', () => {
                it('expect 200, 302,', async() => { //location:../profile 
                    //makes request to signup page expects response of 200 OK!
                    await request.get("/signup").expect(200)
                        // makes a request to Signup page 
                    await request.post("/signup")
                        .send({
                            //specify query data
                            name: 'David',
                            lastName: 'Lemme',
                            password: 'd',
                            email: 'david@example.com',
                            permissionLevel: 'patient'
                        })
                        //setting data type and content
                        .set("Content-Type", "application/x-www-form-urlencoded")
                        .type("form")
                        .expect(200) //.expect('Location', '../profile') //expects 302 and the redirect location to be ../profile

                })
            })

        })
        // test for email already exits error path
    context('error path', () => {
        context('given email already exists', () => {
            it('expect 200', () => {
                request.get("/signup").expect(200)

                request.post("/signup")
                    .send({
                        name: 'test',
                        lastname: 'user',
                        password: '1234',
                        email: '1@1.com',
                        permissionLevel: 'patient'
                    })
                    .set("Content-Type", "application/x-www-form-urlencoded")
                    .type("form")
                    .expect(200)

            })
        })
    })

})