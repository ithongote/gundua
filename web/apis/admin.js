function previewFile(input){
    var file = $("input[type=file]").get(0).files[0];

    var extension  = file.name.split('.').pop().toLowerCase();

    if(extension=='png'||extension=='jpg'||extension=='jpeg'){
        var reader = new FileReader();

        reader.onload = function(){
            $("#previewImg").attr("src", reader.result);
            document.getElementById('previewImg').style.display = 'block';
        }

        reader.readAsDataURL(file);
    }
}

function GoodEggs(message_status){
    $('#msg-body').html(message_status);
    $('#msg-status').click();
}

function BadEggs(message_status){
    $('#msg-body-error').html(message_status);
    $('#msg-status-error').click();
}

function EdgeStatus(message_status){
    $('#msg-body-edge').html(message_status);
    $('#msg-status-edge').click();
}

$("#dimension_width_height").change(function(){
    $("#dimension_width").html( $(this).find(':selected').text().split('x')[0]);
    $("#dimension_height").html( $(this).find(':selected').text().split('x')[1]);
});

$("#capacity").change(function(){
    $("#dimension_width").attr("placeholder", $(this).find(':selected').text().split('x')[0]);
    $("#dimension_height").attr("placeholder", $(this).find(':selected').text().split('x')[1]);
});

var ip_address    = 'http://127.0.0.1:5008';

function search(query){
    var result = '';
    $.ajax({
        method: "POST",
        url: ip_address+'/api/billboard/query/autocomplete',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'query': query , 'limit': '100'}),
        dataType: "json",
        success: function(data) {
            if (data.status==200){
                for(i in data.msg){
                    result +=''
                    +'<div class="col-xl-4 card p-2  border-none" >'
                    
                        +'<div class="row rounded p-2" style="background-color: whitesmoke;margin:5px;height:auto;">'
                        
                            +'<div class="col-xl-12" >'
                                +'<img id="'+data.msg[i].billboard_name+'" title="'+data.msg[i].billboard_owner_name+'" onclick="queryMap(this)" class="crm-profile-pic rounded" height="100%" width="100%" src="'+data.msg[i].billboard_image+'" >'
                                +'<path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clip-rule="evenodd" />'
                                +'</svg>'
                            +'</div>'
                    
                            +'<div class="col-xl-6" >'

                                +'<div class="col-xl-6" style="margin-left:-10px;">'
                                    +'<p style="inline-size: 330px;color:black;font-weight:bold;" >'+data.msg[i].billboard_name +'<p>'
                                    +'<p id="'+data.msg[i].billboard_id+'" class="loadEdge" onclick="loadEdge(this)"  style="inline-size: 200px;color:black;margin-top:-15px;font-size:14px;" >'+data.msg[i].billboard_owner_name +' '+'<i id="select_'+data.msg[i].billboard_id+'" class="fa fa-check-circle" style="font-size:18px;color:green;cursor:pointer;" title="Select Billboard" ></i> <p>'
                                +'</div>'

                                +'<div class="col-xl-6" style="color:black;margin-top:5px;">'

                                    +'<div class="iq-icon-box-2" style="margin-left:-10px;margin-top:-15px;" title="Daily Views">'
                                        +'<i class="las la-eye" style="font-size:24px;color:black;"></i>'
                                        +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.msg[i].billboard_daily_views+'</p>'
                                    +'</div>'

                                    +'<div class="iq-icon-box-2" style="margin-left:40px;margin-top:-55px;width:74px;" title="Billboard Size" >'
                                        +'<i class="las la-border-style" style="font-size:24px;"></i>'
                                        +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.msg[i].billboard_width+'x'+data.msg[i].billboard_height+'</p>'
                                    +'</div>'
                            
                                    +'<div class="iq-icon-box-2" style="margin-left:105px;margin-top:-57px;width:54px;" title="Traffic Direction" >'
                                        +'<i class="las la-compass" style="font-size:24px;"></i>'
                                        +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.msg[i].billboard_traffic_direction+'</p>'
                                    +'</div>'
                            
                                    +'<div class="iq-icon-box-2" style="margin-left:145px;margin-top:-57px;width:74px;" title="Status" >'
                                        +'<i class="las la-check-double" style="font-size:24px;"></i>'
                                        +'<p style="font-size:12px;margin-top:-5px;color:green;">'+data.msg[i].billboard_availability+'</p>'
                                    +'</div>'

                                    +'<div class="iq-icon-box-2" style="margin-left:199px;margin-top:-55px;width:74px;" id="switch_'+data.msg[i].billboard_id+'" >'
                                        +'<i class="las la-border-none" style="font-size:24px;color:black;cursor:pointer;font-weight:bolder;" title=" Billboard split '+data.msg[i].billboard_screen_count+'"></i>'
                                        +'<p style="font-size:12px;margin-top:-5px;color:black;margin-left:8px;">'+data.msg[i].billboard_screen_count+'</p>'
                                    +'</div>'

                                +'</div>'

                            +'</div>'

                        +'</div>'
                    +'</div>';
                }

                if(data.msg.length > 0){
                    $('#load-billboards-results').empty();
                    $('#load-billboards-results').html(result);
                    $(".loadEdge:first").click();
                }

                if(data.msg.length==0){
                    GoodEggs('RECORD NOT FOUND');
                    $("#load-edge-computers").click();
                    $('#search-bx').val('');
                    $('#search-lde').css({"display": "none"});
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
            
            BadEggs('ERROR');
        }
    });
}

$(document).ready(function() {
    var uid = window.sessionStorage.getItem('content');

    if(uid == null){
        window.location = 'http://127.0.0.1/';
    }

    $.ajax({
        method: "POST",
        url: ip_address+'/api/profile/query',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'query': uid , 'limit': '1'}),
        dataType: "json",
        success: function(data) {
            sessionStorage.setItem('loggedin', 1);
            if (data.status==200){
                if(data.msg[0].user_id==uid){
                    $('#admin-email').html(data.msg[0].user_email);
                    $('#admin-profile-image').attr({src: data.msg[0].user_image});
                    $('#admin-creation-date').html(data.msg[0].user_registration_date);
                    $('#admin-usernames').html(data.msg[0].first_name + " " + data.msg[0].last_name);
                    $("#load-edge-computers").click();
                    agency();
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
 
    $("#load-edge-computers").bind('click', function(e) {
        e.preventDefault();
        var result = '';
        $('#b-loader').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/billboard/query/all',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'query': 'all' , 'limit': '50'}),
            dataType: "json",
            success: function(data) {
                if (data.status==200){
                    for(i in data.msg){
                        result +=''
                        +'<div class="col-xl-4 card p-2  border-none" >'
                        
                            +'<div class="row rounded p-2" style="background-color: whitesmoke;margin:5px;height:auto;">'
                            
                                +'<div class="col-xl-12" >'
                                    +'<img id="'+data.msg[i].billboard_name+'" title="'+data.msg[i].billboard_owner_name+'" onclick="queryMap(this)" class="crm-profile-pic rounded" height="100%" width="100%" src="'+data.msg[i].billboard_image+'" >'
                                    +'<path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clip-rule="evenodd" />'
                                    +'</svg>'
                                +'</div>'
                        
                                +'<div class="col-xl-6" >'

                                    +'<div class="col-xl-6" style="margin-left:-10px;">'
                                        +'<p style="inline-size: 330px;color:black;font-weight:bold;" >'+data.msg[i].billboard_name +'<p>'
                                        +'<p id="'+data.msg[i].billboard_id+'" class="loadEdge" onclick="loadEdge(this)"  style="inline-size: 200px;color:black;margin-top:-15px;font-size:14px;" >'+data.msg[i].billboard_owner_name +' '+'<i id="select_'+data.msg[i].billboard_id+'" class="fa fa-check-circle" style="font-size:18px;color:green;cursor:pointer;" title="Select Billboard" ></i> <p>'
                                    +'</div>'

                                    +'<div class="col-xl-6" style="color:black;margin-top:5px;">'

                                        +'<div class="iq-icon-box-2" style="margin-left:-10px;margin-top:-15px;" title="Daily Views">'
                                            +'<i class="las la-eye" style="font-size:24px;color:black;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.msg[i].billboard_daily_views+'</p>'
                                        +'</div>'

                                        +'<div class="iq-icon-box-2" style="margin-left:40px;margin-top:-55px;width:74px;" title="Billboard Size" >'
                                            +'<i class="las la-border-style" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.msg[i].billboard_width+'x'+data.msg[i].billboard_height+'</p>'
                                        +'</div>'
                                
                                        +'<div class="iq-icon-box-2" style="margin-left:105px;margin-top:-57px;width:54px;" title="Traffic Direction" >'
                                            +'<i class="las la-compass" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.msg[i].billboard_traffic_direction+'</p>'
                                        +'</div>'
                                
                                        +'<div class="iq-icon-box-2" style="margin-left:145px;margin-top:-57px;width:74px;" title="Status" >'
                                            +'<i class="las la-check-double" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:green;">'+data.msg[i].billboard_availability+'</p>'
                                        +'</div>'

                                        +'<div class="iq-icon-box-2" style="margin-left:199px;margin-top:-55px;width:74px;" id="switch_'+data.msg[i].billboard_id+'" >'
                                            +'<i class="las la-border-none" style="font-size:24px;color:black;cursor:pointer;font-weight:bolder;" title=" Billboard split '+data.msg[i].billboard_screen_count+'"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;margin-left:8px;">'+data.msg[i].billboard_screen_count+'</p>'
                                        +'</div>'

                                    +'</div>'

                                +'</div>'

                            +'</div>'
                        +'</div>';
                    }
                    if(data.msg.length > 0){
                        $('#load-billboards-results').empty();
                        $('#load-billboards-results').html(result);
                        $(".loadEdge:first").click();
                        $('#b-loader').css({"display": "none"});
                    }

                    if(data.msg.length == 0){
                        $('#load-billboards').click();
                    }
                
                }
                if (data.status!=200){
                    $('#b-loader').css({"display": "none"});
                }
            },
            statusCode: {
                400: function(data) {
                    $('#b-loader').css({"display": "none"});
                }
            },
            error: function(err) {
                $('#b-loader').css({"display": "none"});
            }
        });
    });

    $("#search-bx").on('keypress',function(e) {

        if(e.which == 13) {
            var query =  $(this).val();

            if(query != ''){
                $('#search-lde').css({"display": "block"});
                search(query);
            }
    
            if(query == ''){
                BadEggs('ENTER QUERY');
            }
        }
    });

    $("#search-btn").bind('click', function(e) {
        e.preventDefault();

        var query =  $("#search-bx").val();

        if(query != ''){
            $('#search-lde').css({"display": "block"});
            search(query);
        }

        if(query == ''){
            BadEggs('ENTER QUERY');
        }
        
    });
    
    $('#customRange2').on('change', function(){
        screen_count = $(this).val();
        $('#edge_screen_count').html($(this).val());
        $.ajax({
            method: "POST",
            url: ip_address+'/api/billboard/device/status',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'bid':  window.sessionStorage.getItem('dvd') , 'baid' : uid ,'screen':$(this).val()}),
            dataType: "json",
            success: function(data) {
                if (data.status==200){
                  GoodEggs('Success');
                  $("#edge_screen_count").css({"border-color": "green","color":"white","font-weight":"bold"});
                }
            },
            statusCode: {
                400: function(data) {
                    BadEggs('Error');
                    $("#edge_screen_count").css({"border-color": "red"});
                }
            },
            error: function(err) {
                console.log(err);
            }
        });
        //UPDATE SCREEN COUNT
    });
    
    $("#customSwitch-11").on('change', function(){
        var result = '';
        var switchStatus = '';
        if ($(this).is(':checked')) {
            switchStatus = $(this).is(':checked');
            switchStatus = 'ON';
            $("#customSwitch-11" ).prop( "checked", true );
            
        }
        else {
           switchStatus = $(this).is(':checked');
           switchStatus = 'OFF';
           $("#customSwitch-11" ).prop( "checked", false);
           
        }
        if(switchStatus != ''){
            $.ajax({
                method: "POST",
                url: ip_address+'/api/billboard/controls/start',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'id':  window.sessionStorage.getItem('dvd') , 'status' : switchStatus ,'screen':$('#edge_screen_count').html()}),
                dataType: "json",
                success: function(data) {

                    if (data.status==200 || data.status!=200){

                        result       = '';
                        status_color = '';
                        status_label = '';
                        status_class = '';
                        
                        if(data.mode=='ON'){
                            status_label = "On";
                            status_color ="green";
                        }
    
                        if(data.mode=='OFF'){
                            status_label = "Off";
                            status_color = "red";
                        } 

                        if(data.status == 200){
                            status_class = 'las la-power-off';
                        }

                        if(data.status != 200){
                            status_label = "Error";
                            status_color = "red";
                            status_class = 'las la-exclamation-triangle';
                        } 

                        result +=''

                        +'<div class="col-xl-12 card p-2  border-none" style="background-color: whitesmoke;margin:5px;height:250px;">'
                        
                            +'<div class="row rounded" >'
                            
                                +'<div class="col-xl-12" >'
                                    +'<img id="'+data.banner[0].billboard_name+'" title="'+data.banner[0].billboard_owner_name+'" onclick="queryMap(this)" class="svg-icon" height="140" width="100%" src="'+data.banner[0].billboard_image+'" >'
                                    +'<path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clip-rule="evenodd" />'
                                    +'</svg>'
                                +'</div>'
                        
                                +'<div class="col-xl-12" style="margin-left:-10px;" >'
                        
                                    +'<div class="col-xl-7" >'
                                        +'<p style="inline-size: 330px;color:black;font-weight:bold;" >'+data.banner[0].billboard_name +'<p>'
                                        +'<p id="'+data.banner[0].billboard_id+'" class="loadEdge" onclick="loadEdge(this)"  style="inline-size: 200px;color:black;margin-top:-15px;font-size:14px;" >'+data.banner[0].billboard_owner_name +' '+'<i id="select_'+data.banner[0].billboard_id+'" class="fa fa-check-circle" style="font-size:18px;color:green;cursor:pointer;" title="Select Billboard" ></i> <p>'
                                    +'</div>'
                        
                                    +'<div class="col-xl-6" style="color:black;margin-top:5px;">'
                        
                                        +'<div class="iq-icon-box-2" style="margin-top:-15px;" title="Daily Views">'
                                            +'<i class="las la-eye" style="font-size:24px;color:black;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.banner[0].billboard_daily_views+'</p>'
                                        +'</div>'
                        
                                        +'<div class="iq-icon-box-2" style="margin-left:50px;margin-top:-55px;width:74px;" title="Billboard Size" >'
                                            +'<i class="las la-border-style" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.banner[0].billboard_width+'x'+data.banner[0].billboard_height+'</p>'
                                        +'</div>'
                                
                                        +'<div class="iq-icon-box-2" style="margin-left:115px;margin-top:-57px;width:54px;" title="Traffic Direction" >'
                                            +'<i class="las la-compass" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.banner[0].billboard_traffic_direction+'</p>'
                                        +'</div>'
                                
                                        +'<div class="iq-icon-box-2" style="margin-left:155px;margin-top:-57px;width:74px;" title="Status" >'
                                            +'<i class="las la-check-double" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;">'+data.banner[0].billboard_availability+'</p>'
                                        +'</div>'
                        
                                        +'<div class="iq-icon-box-2" style="margin-left:219px;margin-top:-55px;width:74px;" title="Screen" >'
                                            +'<i class="las la-border-none" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;margin-left:8px;">'+data.banner[0].billboard_screen_count+'</p>'
                                        +'</div>'
                        
                                        +'<div class="icon iq-icon-box-2" style="margin-left:275px;margin-top:-60px;" title="'+data.msg+'">'
                                            +'<i class="'+status_class+'" style="font-size:48px;color:'+status_color+';"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;">'+status_label+'</p>'
                                        +'</div>'

                                    +'</div>'
                        
                                +'</div>'
                        
                            +'</div>'
                        +'</div>';

                        EdgeStatus(result);

                        document.getElementById('b-loader').style.display = 'none';
                    }
                },
                statusCode: {
                    400: function(data) {
                        EdgeStatus(result);
                        document.getElementById('b-loader').style.display = 'none';
                    }
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }
    });

    $("#load_agency").bind('click', function(e) {
        e.preventDefault();
        window.location = "http://127.0.0.1/sws/admin/billboards/#agency";
    });

    $("#load-system").bind('click', function(e) {
        e.preventDefault();
        window.location = "http://127.0.0.1/sws/admin/billboards/#billboard";
    });

    $("#load_user").bind('click', function(e) {
        e.preventDefault();
        window.location = "http://127.0.0.1/sws/admin/users/";
    });

    function agency(){
        $('#divisiondrp').html('');
        document.getElementById('b-loader').style.display = 'block';
        $.ajax({
            method: "POST",
            url: ip_address+'/api/agency/query',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'query': uid , 'limit': '1'}),
            dataType: "json",
            success: function(data) {
                if (data.status==200){ 
                    console.log(data);
                    var inputElement = '<select id="design-dropdown" name="design-dropdown" class="col-md-12">';  
                    for(var i = 0; i < data.name.length; i++){
                        inputElement += '<option value="' + data.id[i] + '">' + data.name[i] + '</option>';
                    }
                    inputElement += '</select>';  
                    $('#divisiondrp').append(inputElement);

                    $("#design-dropdown").each(function () {  
                        $('option', this).each(function () {  
          
                            if ($(this).text() == 'Select') {  
                                $(this).attr('selected', 'selected')  
                            };  
                        });  
                    });
                    $("#load-edge-computers").click();
                    document.getElementById('b-loader').style.display = 'none';
                }
                if (data.status!=200){
                    BadEggs('ERROR');
                    document.getElementById('b-loader').style.display = 'none';
                }
            },
            statusCode: {
                400: function(data) {
                  BadEggs('ERROR');
                }
            },
            error: function(err) {
                BadEggs('ERROR');
            }
        });
    }

    $("#load-billboards").bind('click', function(e) {
        e.preventDefault();
        //agency();
    });

    $("#create-billboard").bind('submit', function(e) {
        e.preventDefault();
        
        var reader                  = new FileReader();
        var name                    = $('#name').val();
        var agency_id               = $('select[name=design-dropdown] option').filter(':selected').val();
        var agency_name             = $('select[name=design-dropdown] option').filter(':selected').text();
		var sign_placement          = $('select[name=sign_placement] option').filter(':selected').val();
        var traffic_direction       = $('select[name=traffic_direction] option').filter(':selected').val();
        var availability            = $('select[name=availability] option').filter(':selected').val();
        var duration                = $('#duration').val();
        var status                  = $('select[name=status] option').filter(':selected').val();
        var screen_count            = $('select[name=screen_count] option').filter(':selected').val();
        var edge_ip_address         = $('#ip_address').val();
        var latitude                = $('#latitude').val();
        var longitude               = $('#longitude').val();
        var map_zoom                = $('#map_zoom').val();
        var daily_views             = $('#daily_views').val();
        var capacity                = $('select[name=capacity] option').filter(':selected').val();
        var city                    = $('select[name=city] option').filter(':selected').val();
        var county                  = $('select[name=county] option').filter(':selected').val();
        var country                 = $('select[name=country] option').filter(':selected').val();
        var state                   = $('select[name=state] option').filter(':selected').val();
        var zip                     = $('select[name=zip] option').filter(':selected').val();
        var dimension_width_height  = $('select[name=dimension_width_height] option').filter(':selected').val();
        var dimension_width         = dimension_width_height.split('x')[0];
        var dimension_height        = dimension_width_height.split('x')[1];

        var form_data  = $('#file').get(0);
        var input_file = form_data.files[0];
        var extension  = input_file.name.split('.').pop().toLowerCase();

        if(name !='' && agency_id !='' && agency_name !='' && sign_placement !='' && traffic_direction !='' && availability !='' && duration !='' && status !='' && screen_count !='' && edge_ip_address !='' && latitude !='' && longitude !='' && daily_views !='' && capacity !='' && city !='' && country !='' && county !='' && zip !='' && state !='' && extension !='' && dimension_width_height != ''){
            reader.readAsDataURL(input_file);

            $(reader).on('load', function(e){
                data_line = e.target.result
                const base64String = data_line
                    .replace('data:', '')
                    .replace(/^.+,/, '');
                $('#billboard-lde').css({"display": "block"});
                $.ajax({
                    method: "POST",
                    url: ip_address+'/api/billboard/create',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify({'name': name, 'sign_placement': sign_placement, 'traffic_direction': traffic_direction, 'availability': availability, 'dimension_width': dimension_width , 'dimension_height': dimension_height, 'duration': duration, 'status': status, 'capacity': capacity, 'ip_address': edge_ip_address, 'screen_count': screen_count, 'city': city, 'state': state, 'county': county, 'country': country, 'zip': zip, 'latitude': latitude, 'longitude': longitude, 'daily_views':daily_views, 'file': base64String ,'extension': extension ,'id':uid ,'agency_name':agency_name ,'agency_id':agency_id, 'map_zoom':map_zoom }),
                    dataType: "json",
                    cache: false,
                    processData: false,
                    success: function(data) {
                        if (data.status==200){
                            GoodEggs('SUCCESS');
                            $('#create-billboard')[0].reset();
                            $('#billboard-lde').css({"display": "none"});
                            $("#load-edge-computers").click();
                        }
                        if (data.status!=200){
                            BadEggs('ERROR');
                            $('#billboard-lde').css({"display": "none"});
                        }
                    },
                    statusCode: {
                        400: function(data) {
                            BadEggs('ERROR');
                            $('#billboard-lde').css({"display": "none"});
                        }
                    },
                    error: function(err) {
                        BadEggs('ERROR');
                        $('#billboard-lde').css({"display": "none"});
                    }
                });
            });
        }

        if(name =='' || agency_id =='' || agency_name =='' || sign_placement =='' || traffic_direction =='' || availability =='' || duration =='' || status =='' || screen_count =='' || edge_ip_address =='' || latitude =='' || longitude =='' || daily_views =='' || capacity =='' || city =='' || country =='' || county =='' || zip =='' || state =='' || extension =='' || dimension_width_height == ''){
            BadEggs('EMPTY FIELD EXISTS');
        }
    });

    $("#create-agency").bind('submit', function(e) {
        e.preventDefault();
    
        var agency_name                    = $('#agency_name').val();
        var agency_mail                    = $('#agency_mail').val();
        var agency_location                = $('#agency_location').val();
        var agency_address                 = $('#agency_address').val();
        var agency_telephone_1             = $('#agency_telephone_1').val();
        var agency_telephone_2             = $('#agency_telephone_2').val();
        var agency_city                    = $('select[name=agency_city] option').filter(':selected').val();
        var agency_country                 = $('select[name=agency_country] option').filter(':selected').val();
        var agency_status                  = $('select[name=agency_status] option').filter(':selected').val();

        if(agency_name !='' && agency_mail !='' && agency_location !='' && agency_address !='' && agency_telephone_1 !='' && agency_telephone_2 !='' && agency_city !='' && agency_country !='' && agency_status !=''){
            document.getElementById('agency-lde').style.display = 'block';
            $.ajax({
                method: "POST",
                url: ip_address+'/api/agency/create',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'agency_name':agency_name,'agency_city': agency_city, 'agency_mail': agency_mail, 'agency_status': agency_status, 'agency_country': agency_country, 'agency_telephone_1': agency_telephone_1, 'agency_telephone_2': agency_telephone_2, 'agency_address':agency_address, 'agency_location':agency_location }),
                dataType: "json",
                cache: false,
                processData: false,
                success: function(data) {
                    if (data.status==200){
                        GoodEggs('SUCCESS');
                        $('#create-agency')[0].reset();
                        document.getElementById('agency-lde').style.display = 'none';
                    }
                    if (data.status!=200){
                        BadEggs('ERROR');
                        document.getElementById('agency-lde').style.display = 'none';
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

        if(agency_name =='' || agency_mail =='' || agency_location =='' || agency_address =='' || agency_telephone_1 =='' || agency_telephone_2 =='' || agency_city =='' || agency_country =='' || agency_status ==''){
            BadEggs('EMPTY FIELD EXISTS');
        }
    });

    $("#user-logout").bind('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location = 'http://127.0.0.1/';
    });

    $('#nav-bar-open').bind('click', function(e) {
        e.preventDefault();
        $(this).css({"display": "none"});
        $('#side-panel').css({"width": "250px"});
        $('#nav-bar-close').css({"display": "block"});
    });

    $('#nav-bar-close').click(function(e){
       e.preventDefault();
       $(this).css({"display": "none"});
       $('#side-panel').css({"width": "0px"});
       $('#nav-bar-open').css({"display": "block"});
    });

});     

function loadEdge(addressPoints) {
    var id = $(addressPoints).attr("id");
    window.sessionStorage.setItem('dvd', id);
    $.ajax({
        method: "POST",
        url: ip_address+'/api/billboard/select',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'query': id , 'limit': '1'}),
        dataType: "json",
        success: function(data) {
            if (data.status==200){

                if(data.msg[0].billboard_id == id){

                    var edge_id   = window.sessionStorage.getItem('edge_id');

                    if(edge_id != "#select_"+id){
                        $(edge_id).css({"color": "green","font-weight": "bolder"});
                        $("#select_"+id).css({"color": "#062B78","font-weight": "bolder"});
                        window.sessionStorage.setItem('edge_id', "#select_"+id);
                    }

                    if(edge_id == "#select_"+id){
                        $("#select_"+id).css({"color": "#062B78","font-weight": "bolder"});
                        window.sessionStorage.setItem('edge_id', "#select_"+id);
                    }

                    if(edge_id == ""){
                        $("#select_"+id).css({"color": "#062B78","font-weight": "bolder"});
                        window.sessionStorage.setItem('edge_id', "#select_"+id);
                    }
                    
                    if(data.msg[0].billboard_status == 'ON'){
                        $("#customSwitch-11" ).prop( "checked", true);
                    }

                    if(data.msg[0].billboard_status == 'OFF'){
                        $("#customSwitch-11" ).prop( "checked", false);
                    }

                    $("#edge_screen_count").html(data.msg[0].billboard_screen_count);
                    $('#customRange2').attr('max',data.msg[0].billboard_vcpus);
                    $('#customRange2').val(data.msg[0].billboard_screen_count);
                }
            }
            if (data.status!=200){
             
                BadEggs('ERROR');
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
    return false;
}
