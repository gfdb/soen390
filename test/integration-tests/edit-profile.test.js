const server_modules = require('../../app')
const supertest = require("supertest")
const request = supertest(server_modules.app)
const { describe } = require('mocha');
const { expect } = require('chai');
const Address = require('../../models/address');

describe('Integration login to edit profile', () => {
    context("edit profile", () => {
        it('update Name', async() => {
            // make post request to login page with known 
            // valid user credentials
            const login = await request.post('/login')
                .send({
                    email: 'david@example.com',
                    password: 'd'
                })
                .set("Content-Type", "application/x-www-form-urlencoded")
                .type("form")
                // expect to be redirected to profile
            expect(login.statusCode).to.equal(302)
                //edititng profile 
            const editName = await request.post('/profile/edit')
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
            expect(editName.statusCode).to.equals(302)

        })
    })
})