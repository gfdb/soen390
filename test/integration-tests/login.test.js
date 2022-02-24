const server_modules = require('../../server')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');


describe('Integration main to login', () => {
    context('happy path', () => {
        context("given valid email and password", () => {
            it('valid login', async() => {
                const response = await request.get("/login")
                expect(response.statusCode).to.equal(200)

                const login = await request.post('/login')
                    .send({
                        email: 'second@user.com',
                        password: 'second'
                    })
                    .set("Content-Type", "application/x-www-form-urlencoded")
                    .type("form")
                expect(login.statusCode).to.equal(302)
            })
        })
    })

    context("error path", () => {
        context('error 302 redirect to /login', () => {
            it('request with invalid credentials', async() => {
                const login = await request.post('/login')
                    .send({
                        email: 'second@user.com',
                        password: 'invalidCredentials'
                    })
                    .set("Content-Type", "application/x-www-form-urlencoded")
                    .type("form")
                    // console.log(login.res, 'AAAAAAA')
                expect(login.statusCode).to.equal(302)
                expect('Location', '/login', () => {
                    request.get('/login').expect(200)
                })

            })
        })
    })

})