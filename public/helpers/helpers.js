
// this function takes an html element_id, and replaces the
// inner html of that element with the passed new_data
function reload(element_id, new_data) {

    // get element using the id
    var container = document.getElementById(element_id);
    
    // replace inner html of the element
    container.innerHTML= new_data;
        
}

// given a doctor_uuid, this function checks if the
// the data the user entered on /patientApointment
// is valid and whether or not that doctor is 
// available for an apointment at that time
function check_if_available(doctor_uuid) {

    // get date and time from input field
    let date_time = document.getElementById('AppointmentDatepicker').value

    // get description from input field
    let description = document.getElementById('description').value

    // set default description if none
    if (description === '') {
        description = "none"
    } else {
        description = description.replace(new RegExp(' ', 'g'), '-')
        console.log('date: ' + date_time)
    }
    
    // if no date_time is given, display error
    if (date_time === '') {
        // display error message
        reload("err-message", "This time is not available.")

        // make the text of the err message visible
        document.getElementById("err-message").style.removeProperty("display")
        return
    }
    // decalre url for post request
    let url = "/checkAvailability/" + doctor_uuid + "/" + date_time + "/" + description

    // execute post request
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        success: function(data) {
            // if request returns an error
            if (data.message === "There is already an apointment at that time.") {
                // display error
                reload("err-message", data.message)
                // make error visible
                document.getElementById('err-message').style.removeProperty('display')
            } else {
                // display success message
                reload("err-message", "This time is available.")

                // get err message element
                let message_container = document.getElementById("err-message")
                // set it's text color to green
                message_container.style.setProperty('color', 'green')
                // make it visible
                message_container.style.removeProperty('display')

                // get book apointment button element
                let book_btn = document.getElementById("book-appointment")
                // make it visible by removing display property
                book_btn.style.removeProperty('display')
                // fix it's class to use bootstrap
                book_btn.className = 'btn btn-outline-success btn-lg'

                // get check availability button element
                let check_button = document.getElementById("check-availability")
                // make it invisible
                check_button.style.setProperty("display", "none")

                // get datatime input element
                let date_time_input = document.getElementById("AppointmentDatepicker")
                // make it read only so the user can't edit it
                date_time_input.setAttribute('readonly', 'readonly')

                // get description input element
                let desc_input = document.getElementById("description")
                // make it read only so the user can't edit it
                desc_input.setAttribute('readonly', 'readonly')

                // make the Change button visible
                document.getElementById("change").style.removeProperty('display')

            }
        },
        error: function(request,status,errorThrown) {
            // if post request fails, show error message
            reload("err-message", 'Unable to check availability.')
            console.log(errorThrown)
        }
    })
}
