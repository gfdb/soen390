const sever_modules = require('../app')
const supertest = require("supertest")
const request = supertest(sever_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');

describe('GET /login', () => {
    context('testing login path', () => {
        it('should return 200', async() => {

            // make a get request to the login page

            const response = await request.get("/login")
                .send({
                    email: 'david@example.com',
                    password: 'd'
                })
                .set("Content-Type", "application/x-www-form-urlencoded")
                .type("form")
            expect(response.statusCode).to.equal(200)
        })
    })


})