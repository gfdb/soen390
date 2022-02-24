const sever_modules = require('../server')
const supertest = require("supertest")
const request = supertest(sever_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');

describe('GET /signup/*', () => {
    it("/", async() => {

        const response = await request.get("/signup")
        expect(response.statusCode).to.equal(200)
    })

})

describe('POST /signup/*', () => {
    it("/signup", async() => {

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
        expect(response.statusCode).to.equal(200)
    })
})