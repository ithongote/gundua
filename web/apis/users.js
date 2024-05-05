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

$(document).ready(function() {

    ip_address = 'http://127.0.0.1:5008';

    var uid = window.sessionStorage.getItem('content');

    if(uid == null){
        window.location = 'http://127.0.0.1/';
    }

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

    $.ajax({
        method: "POST",
        url: ip_address+'/api/profile/query',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'query': uid , 'limit': '1'}),
        dataType: "json",
        success: function(data) {
            if (data.status==200){
                agency();
                if(data.msg[0].user_id == uid){
                    $('#admin-email').html(data.msg[0].user_email);
                    $('#admin-profile-image').attr({src: data.msg[0].user_image});
                    $('#admin-creation-date').html(data.msg[0].user_registration_date);
                    $('#admin-usernames').html(data.msg[0].first_name + " " + data.msg[0].last_name);
                }
            }
            if (data.status!=200){
                BadEggs('ERROR');
            }
        },
        statusCode: {
            400: function(data) {
                BadEggs('ERROR');
            }
        },
        error: function(err) {
            console.log(err);
        }
    });

    function agency(){
        $('#divisiondrp').html('');
        document.getElementById('u-loader').style.display = 'block';
        $.ajax({
            method: "POST",
            url: ip_address+'/api/agency/query',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'query': uid , 'limit': '1'}),
            dataType: "json",
            success: function(data) {
                if (data.status==200){ 
                    var inputElement = '<select id="user_agency" name="user_agency" class="col-md-12">';  
                    for(var i = 0; i < data.name.length; i++){
                        inputElement += '<option value="' + data.id[i] + '">' + data.name[i] + '</option>';
                    }
                    inputElement += '</select>';  
                    $('#divisiondrp').append(inputElement);

                    $("#user_agency").each(function () {  
                        $('option', this).each(function () {  
          
                            if ($(this).text() == 'Select') {  
                                $(this).attr('selected', 'selected')  
                            };  
                        });  
                    });
                    
                    document.getElementById('u-loader').style.display = 'none';
                }
                if (data.status!=200){
                    BadEggs('ERROR');
                    document.getElementById('u-loader').style.display = 'none';
                }
            },
            statusCode: {
                400: function(data) {
                    BadEggs('ERROR');
                }
            },
            error: function(err) {
                console.log(err);
            }
        });
    }

    $("#admin-autocomplete").keyup(function(e) {
        e.preventDefault();
        
        var result = '';
        var query = this.value;
        $('#admin-autocomplete-results').html('');
        
        $.ajax({
            method: "POST",
            url: ip_address+'/api/billboard/query/autocomplete',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'query': query , 'limit': '10'}),
            dataType: "json",
            success: function(data) {
                console.log(data.msg);
                if (data.status==200){
                    for(i in data.msg){
                        result +='<li><a href="#"><div class="item">'+data.msg[i].names+'</div></a></li>';
                        $('#admin-autocomplete-results').html(result);
                    }
                }
                if (data.status!=200){
                    console.log(data.msg);
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
   
    $("#create-user").bind('submit', function(e) {
        e.preventDefault();
        var reader                     = new FileReader();
        var form_data                  = $('#file').get(0);
        var input_file                 = form_data.files[0];
        var first_name                 = $('#user_first_name').val();
        var last_name                  = $('#user_last_name').val();
        var email                      = $('#user_email').val();
        var dob                        = $('#user_dob').val();
        var telephone                  = $('#user_telephone').val();
        var password                   = $('#user_password').val();
        var gender                     = $('select[name=user_gender] option').filter(':selected').val();
        var role                       = $('select[name=user_role] option').filter(':selected').val();
        var status                     = $('select[name=user_status] option').filter(':selected').val();
        var id                         = $('select[name=user_agency] option').filter(':selected').val();
        var agency                     = $('select[name=user_agency] option').filter(':selected').text();
        var extension                  = input_file.name.split('.').pop().toLowerCase();
      
        reader.readAsDataURL(input_file);
        document.getElementById('user-lde').style.display = 'block';
        $(reader).on('load', function(e){
            data_line = e.target.result
            const base64String = data_line
                .replace('data:', '')
                .replace(/^.+,/, '');
            $.ajax({
                method: "POST",
                url: ip_address+'/api/profile/create',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'file': base64String ,'extension': extension ,'first_name':first_name , 'last_name':last_name , 'email':email , 'telephone':telephone ,'dob':dob , 'gender':gender ,'role':role , 'password':password ,'status':status , 'id':id , 'agency':agency}),
                dataType: "json",
                cache: false,
                processData: false,
                success: function(data) {
                    if (data.status==200){
                        GoodEggs('SUCCESS');
                        $('#create-user')[0].reset();
                        document.getElementById('user-lde').style.display = 'none';
                    }
                    if (data.status!=200){
                        BadEggs('ERROR');
                        document.getElementById('user-lde').style.display = 'none';
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
    });

    $("#user-logout").bind('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location = 'http://127.0.0.1/';
    });
});     
