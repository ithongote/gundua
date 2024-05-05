$(document).ready(function() {
    function BadEggs(message_status){
        $('#msg-body').html(message_status);
        $('#msg-status').click();
    }
    ip_address = 'http://127.0.0.1:5008';

    $("#loginForm").bind('submit', function(e) {
        e.preventDefault();
        if($('#logInPassword').val()!='' && $('#logInEmail').val()!=''){
            $('#login-lde').css({"display": "block"});
            $.ajax({
                method: "POST",
                url: ip_address+'/api/auth/profile',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'username':  $('#logInEmail').val(), 'password': $('#logInPassword').val()}),
                dataType: "json",
                success: function(data) {
                    if (data.status==200){
                        //window.sessionStorage.removeItem('content');
                        sessionStorage.clear();
                        window.sessionStorage.setItem('content', data.id);
                        window.location = data.uri;
                        $('#login-lde').css({"display": "none"});
                    }
                   
                    if (data.status==301 || data.status==302 || data.status==303 || data.status==304 || data.status==305){
                        BadEggs(data.msg);
                        $('#login-lde').css({"display": "none"});
                    }
                },
                statusCode: {
                    400: function(data) {
                        BadEggs(data.msg);
                        $('#login-lde').css({"display": "none"});
                    }
                },
                error: function(err) {
                    $('#login-lde').css({"display": "none"});
                }
            });
        }
    });
});
