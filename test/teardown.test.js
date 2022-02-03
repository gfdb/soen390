const sever_modules = require('../server')
const supertest = require("supertest")
// const request = supertest(sever_modules.app)
// const {describe} = require('mocha');
// const {expect} = require('chai');


after(function() {
    sever_modules.app_server.close();
});