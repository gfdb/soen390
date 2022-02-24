const server_modules = require('../../server')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');
//integration test for login

// happy path
describe('Integration main to login', () => {
    context('happy path', () => {
        context("given valid email and password", () => {
            it('valid login', async() => {
                // make request to login page
                const response = await request.get("/login")

                // expect that status code 200 is returned
                expect(response.statusCode).to.equal(200)

                // make post request to login page with known 
                // valid user credentials
                const login = await request.post('/login')
                    .send({
                        email: 'second@user.com',
                        password: 'second'
                    })
                    .set("Content-Type", "application/x-www-form-urlencoded")
                    .type("form")
                    // expect to be redirected to profile
                expect(login.statusCode).to.equal(302)
            })
        })
    })

    //error path
    context("error path", () => {
        context('error 302 redirect to /login', () => {
            it('request with invalid credentials', async() => {

                // make post request to login page with known
                // invalid user credentails
                const login = await request.post('/login')
                    .send({
                        email: 'second@user.com',
                        password: 'invalidCredentials'
                    })
                    .set("Content-Type", "application/x-www-form-urlencoded")
                    .type("form")
                    // expect to be redirected to the login page
                    // to try again
                expect(login.statusCode).to.equal(302)

            })

        })
    })
})