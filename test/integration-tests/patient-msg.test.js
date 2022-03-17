const server_modules = require('../../server')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');
//integration test for login

// happy path
describe('Integration login send message', () => {
    context('patient send message', () => {
        it('send login', async() => {
            const test = await request.get('/login')
            expect(test.statusCode).to.equal(200)


            // make post request to login page with known 
            // valid user credentials
            const login = await request.post('/login')
                .send({
                    email: 'mm@ll.com',
                    password: 'second'
                })
                .set("Content-Type", "application/x-www-form-urlencoded")
                .type("form")
                // expect to be redirected to profile
            expect(login.statusCode).to.equal(302)

            const msg = await request.post('/patientMessaging')
                .send({
                    patientmessage: 'thisisatest',
                })
                .set("Content-Type", "application/x-www-form-urlencoded")
                .type("form")
                // expect to be redirected to profile
            expect(msg.statusCode).to.equal(302)

        })
    })
})