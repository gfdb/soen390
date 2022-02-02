const app = require('../server')
const supertest = require("supertest")
const request = supertest(app)
const {describe} = require('mocha');
const {expect} = require('chai');

describe('GET /login/*', () => {
    it("/", async () => {

        const response = await request.get("/login")
        expect(response.statusCode).to.equal(200)
    })

    it("/patient", async () => {

        const response = await request.get("/login/patient")
        expect(response.statusCode).to.equal(200)
    })

    it("/worker", async () => {

        const response = await request.get("/login/worker")
        expect(response.statusCode).to.equal(200)
    })
})