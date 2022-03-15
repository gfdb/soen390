module.exports = class Patient {
    constructor(uuid, covid, symptoms, doctor_uuid, diary) {
        this.uuid = uuid
        this.covid = covid
        this.symptoms = symptoms
        this.doctor_uuid = doctor_uuid
        // this.address_uuid = address_uuid
        
        this.diary = diary
    }
}