const sever_modules = require('../server')
const supertest = require("supertest")
const request = supertest(sever_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');

describe('GET /signup/*', () => {
    it("/", async() => {

        // make a get request to the sign up page
        const response = await request.get("/signup")

        // expect the response status code 
        // to be 200 (OK)
        expect(response.statusCode).to.equal(200)
    })

})

describe('POST /signup/*', () => {
    it("/signup", async() => {

        // make a post request to the signup 
        // page with valid user data
        const response = await request.post("/signup")
            .send({
                name: 'test',
                lastname: 'user',
                password: '1234',
                email: 'test@user.com',
                permissionLevel: 'patient'
            })
            .set("Content-Type", "application/x-www-form-urlencoded")
            .type("form")
            // expect the response status code to be
            // 302, since the user will be redirected
            // to the login page upon successful registration
        expect(response.statusCode).to.equal(302)


    })
})