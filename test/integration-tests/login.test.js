const server_modules = require('../../server')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');


describe('Integration main to login', () => {
    context('happy path', () => {
        context("given valid email and password", () => {
            it('valid login', async() => {
                const response = await request.get("/")
                expect(response.statusCode).to.equal(200)

                // const login = await request.post('/login')
                //     .send({
                //         email: 'test@user.com',
                //         password: 'poop'
                //     })
                //     .set("Content-Type", "application/x-www-form-urlencoded")
                //     .type("form")
                // expect(login.statusCode).to.equal(302)
            })
        })
    })

    context("error path", () => {
        context('302 ', () => {
            it('request with invalid credentials', () => {
                // const login = await request.post('/login')
                //     .send({
                //         email: 'test@user.com',
                //         password: 'poop'
                //     })
                //     .set("Content-Type", "application/x-www-form-urlencoded")
                //     .type("form")
                // expect(login.statusCode).to.equal(302)
            })
        })
    })

})