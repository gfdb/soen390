const app = require('../server')
const supertest = require("supertest")
const request = supertest(app)
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

// describe('GET /', () => {
//     it("signup get test", async () => {

//         const response = await request.get("/signup")
//         expect(response.statusCode).to.equal(200)
//     })
// })