module.exports = class Users {
    constructor(name, lastname, password, email, address, address2, city, province, zip) {
        this.name = name;
        this.lastname = lastname
        this.password = password
        this.email = email
        this.address = address
        this.address2 = address2
        this.city = city
        this.province = province
        this.zip = zip
    }
    constructor() {
        this.name = ''
        this.lastname = ''
        this.password = ''
        this.email = ''
        this.address = ''
        this.address2 = ''
        this.city = ''
        this.province = ''
        this.zip = ''
    }

}