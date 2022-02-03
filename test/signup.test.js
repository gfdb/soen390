const sever_modules = require('../server')
const supertest = require("supertest")
const request = supertest(sever_modules.app)
const {describe} = require('mocha');
const {expect} = require('chai');

describe('GET /signup/*', () => {
    it("/", async () => {

        const response = await request.get("/signup")
        expect(response.statusCode).to.equal(200)
    })

    it("/patient", async () => {

        const response = await request.get("/signup/patient")
        expect(response.statusCode).to.equal(200)
    })

    it("/worker", async () => {

        const response = await request.get("/signup/worker")
        expect(response.statusCode).to.equal(200)
    })
})

describe('POST /signup/*', () => {
    it("/patient", async () => {

        const response = await request.post("/signup/patient")
        .send({
            name: 'test',
            lastname: 'user',
            pwd: '1234',
            email: 'test@user.com',
            address: '123 TestStreet',
            address2: 'none',
            city: 'TestCity',
            province: 'TestProvince',
            zip: '123 ABC'
        })
        .set("Content-Type", "application/x-www-form-urlencoded")
        .type("form")
        expect(response.statusCode).to.equal(302)
    })
})


// describe('GET /', () => {
//     it("signup get test", async () => {

//         const response = await request.get("/signup")
//         expect(response.statusCode).to.equal(200)
//     })
// })