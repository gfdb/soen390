const app = require('../server')
const supertest = require("supertest")
const request = supertest(app)
const {describe} = require('mocha');
const {expect} = require('chai');


describe('GET /', () => {
    it("homepage get test", async () => {

        const response = await request.get("/")
        expect(response.statusCode).to.equal(200)
    })
})


