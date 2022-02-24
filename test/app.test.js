const server_modules = require('../server')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');


describe('GET /', () => {
    it("homepage", async() => {

        // make a get request to the homepage
        const response = await request.get("/")

        // expect the response's status code
        // to be 200 (OK)
        expect(response.statusCode).to.equal(200)
    })
})