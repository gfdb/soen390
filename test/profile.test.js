const sever_modules = require('../server')
const supertest = require("supertest")
const request = supertest(sever_modules.app)
const {describe} = require('mocha');
const {expect} = require('chai');

describe('GET /profile/*', () => {
    it("/", async() => {
        const response = await request.get("/profile")
        expect(response.statusCode).to.equal(200)
    })
    it("/edit", async() => {
        const response = await request.get("/profile/edit")
        expect(response.statusCode).to.equal(200)
    })

})