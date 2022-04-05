function reload(element_id, new_data) {
    
    var container = document.getElementById(element_id);
    
    container.innerHTML= new_data;
        
}

function check_if_available(doctor_uuid) {
    // $(document).ready(function() {
        
    // })
    // console.log(document.getElementById('AppointmentDatepicker').innerHTML);
    let date_time = document.getElementById('AppointmentDatepicker').value
    let description = document.getElementById('description').value

    if (description === '') {
        description = "none"
    } else {
        description = description.replace(new RegExp(' ', 'g'), '-')
        console.log('date: ' + date_time)
    }
    
    if (date_time === '') {
        console.log('inside');
        reload("err-message", "This time is not available.")
        document.getElementById("err-message").style.removeProperty("display")
        return
    }
    let url = "/checkAvailability/" + doctor_uuid + "/" + date_time + "/" + description
    $.ajax({
        type: 'POST',
        url: url,
        //data: '{doctor_uuid: \''+doctor_uuid+'\', date_time: \''+date_time+'\'}',
        // processData: false,
        contentType: "application/json",
        success: function(data) {//here data is commented above
            if (data.message === "There is already an apointment at that time.") {
                reload("err-message", data.message)
                document.getElementById('err-message').style.removeProperty('display')
            } else {
                console.log("inside helpers");
                reload("err-message", "This time is available.")

                let message_container = document.getElementById("err-message")
                message_container.style.setProperty('color', 'green')
                message_container.style.removeProperty('display')

                let book_btn = document.getElementById("book-appointment")
                book_btn.style.removeProperty('display')
                book_btn.className = 'btn btn-outline-success btn-lg'

                let check_button = document.getElementById("check-availability")
                check_button.style.setProperty("display", "none")

                let date_time_input = document.getElementById("AppointmentDatepicker")
                date_time_input.setAttribute('readonly', 'readonly')

                let desc_input = document.getElementById("description")
                desc_input.setAttribute('readonly', 'readonly')

                document.getElementById("change").style.removeProperty('display')

            }
        },
        error: function(request,status,errorThrown) {
            reload("err-message", 'Unable to check availability.')
            console.log(errorThrown)
        }
    })
}
