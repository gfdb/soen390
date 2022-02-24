module.exports = class Address {
    constructor(uuid, street_number, street_name, apartment_number, city, province, zip) {
        this.uuid = uuid;
        this.street_number = street_number
        this.street_name = street_name
        this.apartment_number = apartment_number
        this.city = city
        this.province = province
        this.zip = zip
    }
}