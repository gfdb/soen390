module.exports = class Patient {
    constructor(uuid, covid, symptoms, diary) {
        this.uuid = uuid
        this.covid = covid
        this.symptoms = symptoms
        
        // this.address_uuid = address_uuid
        
        this.diary = diary
    }
}