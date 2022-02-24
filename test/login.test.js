const sever_modules = require('../server')
const supertest = require("supertest")
const request = supertest(sever_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');

describe('GET /login', () => {
    context('testing login path', () => {
        it('should return 200', async() => {

            const response = await request.get("/login")
            expect(response.statusCode).to.equal(200)
        })
    })


})