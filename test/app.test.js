const server_modules = require('../server')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const {describe} = require('mocha');
const {expect} = require('chai');


describe('GET /', () => {
    it("homepage", async () => {

        const response = await request.get("/")
        expect(response.statusCode).to.equal(200)
    })
})


