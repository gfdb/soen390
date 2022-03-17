const server_modules = require('../../app')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');
//integration test for login

// happy path
describe('Integration login doctor send message', () => {
    context('doctor send message', () => {
        it('send login', async() => {
            const test = await request.get('/login')
            expect(test.statusCode).to.equal(200)


            // make post request to login page with known 
            // valid user credentials
            const login = await request.post('/login')
                .send({
                    email: 'm@e.com',
                    password: 'second'
                })
                .set("Content-Type", "application/x-www-form-urlencoded")
                .type("form")
                // expect to be redirected to profile
            expect(login.statusCode).to.equal(302)

            const msg = await request.post('/doctorMessaging/12728c1e-a40a-11ec-a042-0ee3f6edede7')
                .send({
                    doctormessage: 'thisisatest',
                })
                .set("Content-Type", "application/x-www-form-urlencoded")
                .type("form")
                // expect to be redirected to profile
            expect(msg.statusCode).to.equal(302)

        })
    })
})