function previewFile(input){
    
    var file = $("input[type=file]").get(0).files[0];

    if(file){
        var reader = new FileReader();

        reader.onload = function(){
            $("#previewImg").attr("src", reader.result);
        }

        reader.readAsDataURL(file);
    }
}

function today() {
    let d = new Date();
    let currDate = d.getDate();
    let currMonth = d.getMonth()+1;
    let currYear = d.getFullYear()-80;
    return currYear + "-" + ((currMonth<10) ? '0'+currMonth : currMonth )+ "-" + ((currDate<10) ? '0'+currDate : currDate );
}

function getNanoSecTime() {
    var hrTime = process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1];
}

$(document).ready(function() {

    function BadEggs(message_status){
        $('#msg-body').html(message_status);
        $('#msg-bad').click();
    }

    function GoodEggs(message_status){
        $('#msg-body-good').html(message_status);
        $('#msg-good').click();
    }

    $('#user_dob').val(today());
    $('#user_dob').attr('min', today());

    var id = window.performance.timing.navigationStart + window.performance.now();

    ip_address = 'http://127.0.0.1:5008';

    $("#create-user").bind('submit', function(e) {
        e.preventDefault();
        if($('#user_first_name').val() != '' && $('#user_last_name').val() != '' && $('#user_email').val() != '' && $('#user_dob').val() != '' && $('#user_telephone').val() !='' && $('#user_password').val() != ''){
            if($('#confirm_user_password').val()==$('#user_password').val()){
                var reader                     = new FileReader();
                var form_data                  = $('#file').get(0);
                var input_file                 = form_data.files[0];
                if(input_file === undefined ){
                    BadEggs('PROFILE IMAGE NOT UPLOADED');
                }else{
                    var first_name                 = $('#user_first_name').val();
                    var last_name                  = $('#user_last_name').val();
                    var email                      = $('#user_email').val();
                    var dob                        = $('#user_dob').val();
                    var telephone                  = $('#user_telephone').val();
                    var password                   = $('#user_password').val();
                    var gender                     = $('select[name=user_gender] option').filter(':selected').val();
                    var extension                  = input_file.name.split('.').pop().toLowerCase();
                    reader.readAsDataURL(input_file);
                    document.getElementById('register-lde').style.display = 'block';
                    $(reader).on('load', function(e){
                        data_line = e.target.result
                        const base64String = data_line
                            .replace('data:', '')
                            .replace(/^.+,/, '');
                        $.ajax({
                            method: "POST",
                            url: ip_address+'/api/profile/create',
                            contentType: 'application/json;charset=UTF-8',
                            data: JSON.stringify({'file': base64String ,'extension': extension ,'first_name':first_name , 'last_name':last_name , 'email':email , 'telephone':telephone ,'dob':dob , 'gender':gender ,'role':'client' , 'password':password ,'status':'active' , 'id':id , 'agency':'tangazo'}),
                            dataType: "json",
                            cache: false,
                            processData: false,
                            success: function(data) {
                                if (data.status==200){
                                    GoodEggs('SUCCESS');
                                    $('#create-user')[0].reset();
                                    $.ajax({
                                        method: "POST",
                                        url: ip_address+'/api/auth/profile',
                                        contentType: 'application/json;charset=UTF-8',
                                        data: JSON.stringify({'username':  data.agent, 'password': data.key}),
                                        dataType: "json",
                                        success: function(data) {
                                            if (data.status==200){
                                                //window.sessionStorage.removeItem('content');
                                                sessionStorage.clear();
                                                window.sessionStorage.setItem('content', data.id);
                                                window.location = data.uri;
                                                $('#register-lde').css({"display": "none"});
                                            }
                                           
                                            if (data.status==301 || data.status==302 || data.status==303 || data.status==304 || data.status==305){
                                                BadEggs(data.msg);
                                                $('#register-lde').css({"display": "none"});
                                            }
                                        },
                                        statusCode: {
                                            400: function(data) {
                                                BadEggs(data.msg);
                                                $('#register-lde').css({"display": "none"});
                                            }
                                        },
                                        error: function(err) {
                                            $('#register-lde').css({"display": "none"});
                                        }
                                    });
                                }
                                if (data.status==201){
                                    BadEggs(data.msg);
                                    document.getElementById('register-lde').style.display = 'none';
                                }
                            },
                            statusCode: {
                                400: function(data) {
                                    console.log(data.status);
                                }
                            },
                            error: function(err) {
                                console.log(err);
                            }
                        });
                    });
                }
            }
    
            if($('#confirm_user_password').val()!= $('#user_password').val()){
                 BadEggs('PASSWORDS DO NOT MATCH ');
            }
        }
    });
});