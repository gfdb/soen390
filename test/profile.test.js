const sever_modules = require('../server')
const supertest = require("supertest")
const request = supertest(sever_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');

describe('GET /profile/*', () => {
    it("/", async() => {

        // make get request to the profile page
        const response = await request.get("/profile")

        // expect the response status code
        // to be 302(Redirected) since we 
        // are not logged in, we will be redirected
        // to the login page
        expect(response.statusCode).to.equal(302)
    })
    it("/edit", async() => {

        // make get request to the edit profile page
        const response = await request.get("/profile/edit")

        // expect the response status code
        // to be 302(Redirected) since we 
        // are not logged in, we will be redirected
        // to the login page 
        expect(response.statusCode).to.equal(302)
    })

})