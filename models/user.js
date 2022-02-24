module.exports = class User {
    constructor(uuid, name, lastname, email, permissionLevel) {
        this.uuid = uuid
        this.name = name;
        this.lastname = lastname
        // this.address_uuid = address_uuid
        this.email = email
        this.permissionLevel = permissionLevel
    }
}