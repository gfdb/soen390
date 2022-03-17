const sever_modules = require('../app')
const supertest = require("supertest")
const request = supertest(sever_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');

describe('GET /profile/*', () => {

    it("/edit", async() => {

        // make get request to the edit profile page
        const response = await request.get("/profile/edit")

        .send({
                firstName: 'David',
                lastName: 'Lemme',
                email: 'david@example.com',
                address: '12334',
                appartment: '#2',
                city: 'montreal',
                province: 'YT',
                zip: 'dddddd'

            })
            .set("Content-Type", "application/x-www-form-urlencoded")
            .type("form")
        expect(response.statusCode).to.equal(302)
    })

})