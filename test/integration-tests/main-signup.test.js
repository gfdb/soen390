// const server_modules = require('../../server')
// const supertest = require("supertest")
// const request = supertest(server_modules.app)
// const { describe } = require('mocha');
// const { expect } = require('chai');


// describe('Integration main to login', () => {
//     it('will get main then login', async() => {
//         const response = await request.get("/")
//         expect(response.statusCode).to.equal(200)

//         const response = await request.post("/signup")
//             .send({
//                 name: 'test',
//                 lastname: 'user',
//                 pwd: '1234',
//                 email: 'test@user.com',
//                 city: 'TestCity',
//                 province: 'TestProvince',
//                 zip: '123 ABC'
//             })
//             .set("Content-Type", "application/x-www-form-urlencoded")
//             .type("form")
//         expect(response.statusCode).to.equal(302)
//     })
// })