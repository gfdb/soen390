module.exports = class Address {
    /**
     * @param uuid {string} user id of user
     * @param street_number {string} street number of users address
     * @param street_name {string} street name of user
     * @param apartment_number {string} apartment number of user
     * @param city {string} city that user lives in
     * @param province {string} province user lives in
     * @param zip {string} zipcode of the user
    */
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