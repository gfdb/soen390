module.exports = class User {
    //user class, constructor takes in uuid, name, lastname, email and permission level
    /**
     * @param uuid {string} user id
     * @param name {string} name of user
     * @param lastname {string}  lastname of user
     * @param email {string} email of user
     * @param permissionLevel {string} permission level of user (doctor, patient, healthcare worker, ...)
    */
    constructor(uuid, name, lastname, email, permissionLevel) {
        this.uuid = uuid 
        this.name = name; 
        this.lastname = lastname 
        this.email = email 
        this.permissionLevel = permissionLevel 
    }
}