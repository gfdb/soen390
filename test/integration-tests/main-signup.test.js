const server_modules = require('../../server')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');


describe('Integration main to signup', () => {
    it('will get main then login', async() => {
        await request.get("/signup").expect(200)

        const signup = await request.post("/signup")
            .send({
                name: 'test',
                lastname: 'user',
                password: '1234',
                email: 'test@user.com',
                permissionLevel: 'patient'
            })
            .set("Content-Type", "application/x-www-form-urlencoded")
            .type("form")
        expect(signup.statusCode).to.equal(302)
    })
})