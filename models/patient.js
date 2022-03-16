module.exports = class Patient {
    /**
     * @param uuid {string} user id of patient
     * @param covid {integer} covid status of patient (1 = covid positive, 0 = negative)
     * @param symptoms {string} list of symptoms the patient has
     * @param diary {string} the activities the patient partook in that day
    */
    constructor(uuid, covid, symptoms, diary) {
        this.uuid = uuid
        this.covid = covid
        this.symptoms = symptoms
        this.diary = diary
    }
}