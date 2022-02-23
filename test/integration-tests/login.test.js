const server_modules = require('../server')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');

describe('home page to login attempt', () => {
    it('goes from login page to to login page then logs in', async() => {
        request(request).get('/').expect(200)

        // const response = await request.get("/")
        // expect(response.statusCode).to.equal(200)

    })

})