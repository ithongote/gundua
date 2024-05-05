//SLEEP FUNCTION
function sleepFor(sleepDuration){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ 
        /* Do nothing */ 
    }
}
//LOGIN
$(document).ready(function() {
    var WINDOW_URL = '';
    WINDOW_URL = window.location.href;
    var bid = WINDOW_URL.substring(WINDOW_URL.lastIndexOf('/') + 2);
    bid  = bid.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'');
    //QUERY BILLBOARD
    //alert(window.localStorage.getItem('content'));
    $.ajax({
        method: "POST",
        url: 'http://127.0.0.1:5008/api/billboard/select',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'query': bid , 'limit': '1'}),
        dataType: "json",
        success: function(data) {
            if (data.status==200){
                if(data.msg[0].billboard_id == bid){
                    $('#edge_status').html(data.msg[0].billboard_status);
                    $('#edge_availability').html(data.msg[0].billboard_availability);
                    $('#billboard-pic').attr({src: data.msg[0].billboard_image});
                    $('#edge_screen_count').html(data.msg[0].billboard_screen_count);
                    $('#edge_cpus').html(data.msg[0].billboard_vcpus);
                    $("#customRange1").attr("max", data.msg[0].billboard_vcpus);
                    $("#customRange2").attr("max", data.msg[0].billboard_vcpus);
                    
                    $("#name").attr("placeholder", data.msg[0].billboard_name);
                    $('#edge_ip_address').html(data.msg[0].billboard_ip_address);

                    var sp = $('#sign_placement');
                    sp.append('<option value="0">'+data.msg[0].billboard_sign_placement+'</option>');
                    $("select#sign_placement").val("0");

                    var td = $('#traffic_direction');
                    td.append('<option value="0">'+data.msg[0].billboard_traffic_direction+'</option>');
                    $("select#traffic_direction").val("0");

                    var av = $('#availability');
                    av.append('<option value="0">'+data.msg[0].billboard_availability+'</option>');
                    $("select#availability").val("0");

                    $("#dimension_width").attr("placeholder",  data.msg[0].billboard_width);
                    $("#dimension_height").attr("placeholder", data.msg[0].billboard_height);

                    var ct = $('#city');
                    ct.append('<option value="0">'+data.msg[0].billboard_city+'</option>');
                    $("select#city").val("0");

                    var st = $('#state');
                    st.append('<option value="0">'+data.msg[0].billboard_state+'</option>');
                    $("select#state").val("0");

                    var cty = $('#county');
                    cty.append('<option value="0">'+data.msg[0].billboard_county+'</option>');
                    $("select#county").val("0");

                    var zp = $('#zip');
                    zp.append('<option value="0">'+data.msg[0].billboard_zip+'</option>');
                    $("select#zip").val("0");
                   
                }
                //bid = '';
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
    //QUERY PROFILE
    $.ajax({
        method: "POST",
        url: 'http://127.0.0.1:5008/api/profile/query',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'query': window.localStorage.getItem('content') , 'limit': '1'}),
        dataType: "json",
        success: function(data) {
            if (data.status==200){
                if(data.msg[0].user_id == window.localStorage.getItem('content')){
                    $('#admin-email').html(data.msg[0].user_email);
                    $('#admin-profile-image').attr({src: data.msg[0].user_image});
                    $('#admin-creation-date').html(data.msg[0].user_registration_date);
                    $('#admin-usernames').html(data.msg[0].first_name + " " + data.msg[0].last_name);
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

    //AUTOCOMPLETE BILLBOARDS
    $("#admin-autocomplete").keyup(function(e) {
        // prevent page refresh
        e.preventDefault();
        
        var result = '';
        var query = this.value;
        $('#admin-autocomplete-results').html('');
        
        $.ajax({
            method: "POST",
            url: 'http://127.0.0.1:5008/api/billboard/query/autocomplete',
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
                    //$('#admin-autocomplete-results').html(result);
                }
                if (data.status!=200){
                    //$('#load-billboards-results').html(data.msg);
                    console.log(data.msg);
                }
            },
            statusCode: {
                400: function(data) {
                    //document.getElementById('logInmsg').style.display = 'block';
                    console.log(data.status);
                }
            },
            error: function(err) {
                console.log(err);
            }
        });
    });
    
    $('#customRange1').on('change', function(){
        //alert($(this).val());
        screen_count = $(this).val();
        $('#edge_cpus').html($(this).val());
    });

    $('#customRange2').on('change', function(){
        //alert($(this).val());
        screen_count = $(this).val();
        $('#edge_screen_count').html($(this).val());
    });
    
    //START / STOP BILLBOARDS
    $("#customSwitch-11").on('change', function(){
        var switchStatus = '';
        if ($(this).is(':checked')) {
            switchStatus = $(this).is(':checked');
            switchStatus = 'ON';
            document.getElementById('b-loader').style.display = 'block';
        }
        else {
           switchStatus = $(this).is(':checked');
           switchStatus = 'OFF';
           document.getElementById('b-loader').style.display = 'block';
        }
        if(switchStatus != ''){
            $.ajax({
                method: "POST",
                url: 'http://127.0.0.1:5008/api/billboard/controls/start',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'id': bid , 'status' : switchStatus ,'screen':$('#edge_screen_count').html()}),
                dataType: "json",
                success: function(data) {
                    if (data.status==200){
                        if(data.mode=='ON'){
                            $('#edge_status').html('ON');
                            $("#edge_status").attr("data-message", data.msg);
                            $('#edge_status').click();
                            document.getElementById('b-loader').style.display = 'none';
                        }
                        if(data.mode=='OFF'){
                            $('#edge_status').html('OFF');
                            $("#edge_status").attr("data-message", data.msg);
                            $('#edge_status').click();
                            document.getElementById('b-loader').style.display = 'none';
                        }
                    }
                    if (data.status!=200){
                        $("#edge_status").attr("data-message", data.msg);
                        $('#edge_status').click();
                        document.getElementById('b-loader').style.display = 'none';
                    }
                },
                statusCode: {
                    400: function(data) {
                        console.log(data.status);
                        document.getElementById('b-loader').style.display = 'none';
                    }
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }
    })
});     

