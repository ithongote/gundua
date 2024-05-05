var qrData                = [];
var geoData               = {};
var designData            = {};
var addressPoints         = [];
var locationData          = {};
var display_position      = '';
var design_file_extension = '';
var screen_width_height   = '';
var message_status        = '';
var ip_address            = 'http://127.0.0.1:5008';
var selected_end_date     = '';
var selected_start_date   = '';

function previewFile(input){
    var file = $("input[type=file]").get(0).files[0];

    var extension  = file.name.split('.').pop().toLowerCase();

    if(extension=='png'||extension=='jpg'||extension=='jpeg'){
        var reader = new FileReader();

        reader.onload = function(){
            $("#previewImg").attr("src", reader.result);
            document.getElementById('previewVid').style.display = 'none';
            document.getElementById('previewImg').style.display = 'block';
            document.getElementById('video_panel').style.display = 'none';
            document.getElementById('channel_panel').style.display = 'block';
            document.getElementById('save_design_file').style.display = 'none';
            document.getElementById('animate_design_btn').style.display = 'none';
            document.getElementById('animate_design_file').style.display = 'block';
            document.getElementById('select_animation_label').style.display = 'none';
        }

        design_file_extension = extension;
        reader.readAsDataURL(file);
    }

    if(extension=='mp4'||extension=='avi'||extension=='webm'){
        var reader = new FileReader();

        reader.onload = function(){
            $("#previewVid").attr("src", reader.result);
            document.getElementById('previewImg').style.display = 'none';
            document.getElementById('previewVid').style.display = 'block';
            document.getElementById('video_panel').style.display = 'none';
            document.getElementById('channel_panel').style.display = 'block';
            document.getElementById('save_design_file').style.display = 'none';
            document.getElementById('animate_design_btn').style.display = 'none';
            document.getElementById('animate_design_file').style.display = 'none';
            document.getElementById('select_animation_label').style.display = 'none';
        }

        design_file_extension = extension;
        reader.readAsDataURL(file);
    }
}

function today() {
    let d = new Date();
    let currDate = d.getDate()-1;
    let currMonth = d.getMonth()+1;
    let currYear = d.getFullYear();
    return currYear + "-" + ((currMonth<10) ? '0'+currMonth : currMonth )+ "-" + ((currDate<10) ? '0'+currDate : currDate );
}

function BadEggs(message_status){
    $('#msg-body-error').html(message_status);
    $('#msg-status-error').click();
}

function GoodEggs(message_status){
    $('#msg-body').html(message_status);
    $('#msg-status').click();
}

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
                    _addressPoints=[data.msg[i].billboard_latitude, data.msg[i].billboard_longitude,data.msg[i].billboard_image,data.msg[i].billboard_id];
                    addressPoints.push(_addressPoints);
                    result +=''
                    +'<div class="col-xl-12 card p-2  border-none" >'

                        +'<div class="row rounded p-2" style="background-color: whitesmoke;margin:5px;height:auto;">'
                        
                            +'<div class="col-xl-12" >'
                                +'<img id="'+data.msg[i].billboard_name+'" title="'+data.msg[i].billboard_owner_name+'" onclick="queryMap(this)" class="crm-profile-pic rounded" height="75%" width="100%" src="'+data.msg[i].billboard_image+'" >'
                                +'<path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clip-rule="evenodd" />'
                                +'</svg>'
                            +'</div>'

                            +'<div class="col-xl-6" >'

                                +'<div class="col-xl-6" style="margin-left:-10px;">'
                                    +'<p style="inline-size: 300px;color:black;font-weight:bold;display: inline-block;" >'+data.msg[i].billboard_name +'<p>'
                                    +'<p id="'+data.msg[i].billboard_id+':'+data.msg[i].billboard_latitude+':'+data.msg[i].billboard_longitude+':'+data.msg[i].billboard_image+':'+data.msg[i].zoom_level+'" class="loadEdge" onclick="saveMap(this)"   style="inline-size: 200px;color:black;margin-top:-15px;font-size:14px;" >'+data.msg[i].billboard_owner_name +' '+'<i id="select_'+data.msg[i].billboard_id+'" class="fa fa-check-circle" style="font-size:18px;color:green;cursor:pointer;" title="Select Billboard" ></i> <p>'
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
                            
                                    +'<div class="iq-icon-box-2" style="margin-left:140px;margin-top:-57px;width:74px;" title="Status" >'
                                        +'<i class="las la-check-double" style="font-size:24px;"></i>'
                                        +'<p style="font-size:12px;margin-top:-5px;color:green;">'+data.msg[i].billboard_availability+'</p>'
                                    +'</div>'

                                    +'<div class="iq-icon-box-2" style="margin-left:195px;margin-top:-55px;width:74px;" id="switch_'+data.msg[i].billboard_id+'" >'
                                        +'<i class="las la-border-none" style="font-size:24px;color:black;cursor:pointer;font-weight:bolder;" title=" Billboard split '+data.msg[i].billboard_screen_count+'"></i>'
                                        +'<p style="font-size:12px;margin-top:-5px;color:black;margin-left:8px;">'+data.msg[i].billboard_screen_count+'</p>'
                                    +'</div>'

                                +'</div>'

                            +'</div>'

                        +'</div>'
                    +'</div>';
                }

                if(data.msg.length > 0){
                    $('#serp').empty();
                    $('#serp').html(result);
                    geoData = {id:'q', data:addressPoints};
                    loadMap(geoData);
                    $('#search-bx').val('');
                    $('#search-lde').css({"display": "none"});
                }

                if(data.msg.length==0){
                    GoodEggs('RECORD NOT FOUND');
                    $('#search-bx').val('');
                    $('#load-billboards-tab').click();
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
        window.location = 'http://127.0.0.1';
    }

    document.getElementById('video_panel').style.display = 'none';
    $('#search-lde').css({"display": "none"});
    
    $('#end_date').val(today());
    $('#end_date').attr('min', today());
    $('#start_date').val(today());
    $('#start_date').attr('min', today());

    $('#map').height($( window ).height());
    
    // On Resize
    $(window).resize(function(){ 
    $('#map').height($( window ).height());
    });
    
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
                }
                $("#load-billboards-tab").click();
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

    $('#end_date').change(function(){
        selected_end_date    = $('#end_date').val();
    });

    $('#start_date').change(function(){
        selected_start_date  = $('#start_date').val();     
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

    $("#select_media_pos").bind('submit', function(e) {
        e.preventDefault();
        display_position            = $(document.activeElement).attr('id');
        screen_width_height         = $(document.activeElement).attr('value');

        if(design_file_extension=='png'||design_file_extension=='jpg'||design_file_extension=='jpeg'){
            document.getElementById('save_design_file').style.display = 'none';
            document.getElementById('animate_design_btn').style.display = 'block';
        }
        
        if(design_file_extension=='mp4'||design_file_extension=='avi'||design_file_extension=='webm'){
            document.getElementById('save_design_file').style.display = 'block';
            document.getElementById('animate_design_btn').style.display = 'none';
        }
    });
   
    $("#save_review").bind('submit', function(e) {
        e.preventDefault();
        $('#review-lde').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/campaign/submit',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid'),'status':'PENDING'}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(data) {
                if (data.status==200){
                    if($(document.activeElement).attr('id')=='review_continue'){
                        $('#save_budget')[0].reset();
                        $('#save_schedule')[0].reset();
                        GoodEggs('SUCESS');
                        window.location = data.uri;
                    }
                    if($(document.activeElement).attr('id')=='review_save_and_close'){
                        $('#client-home').click();
                        GoodEggs('SUCESS');
                    }
                }
                if (data.status!=200){
                    BadEggs('REVIEW NOT SAVED');
                    
                }
                $('#review-lde').css({"display": "none"});
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
    });

    $("#animate_design_file").bind('click', function(e) {
        e.preventDefault();
        
        var adverts                    = '';
        var reader                     = new FileReader();
        var form_data                  = $('#file').get(0);
        var input_file                 = form_data.files[0];
        var extension                  = input_file.name.split('.').pop().toLowerCase();
        var media_display_position     = display_position;
        var media_screen_width_height  = screen_width_height;
    
        reader.readAsDataURL(input_file);
        document.getElementById('design-lde').style.display = 'block';
        $(reader).on('load', function(e){
            data_line = e.target.result
            const base64String = data_line
                .replace('data:', '')
                .replace(/^.+,/, '');
            $.ajax({
                method: "POST",
                url: ip_address+'/api/campaign/animate',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'media_position':media_display_position, 'file': base64String ,'extension': extension ,'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid'),'screen':media_screen_width_height.split(':')[0],'width':media_screen_width_height.split(':')[1],'height':media_screen_width_height.split(':')[2]}),
                dataType: "json",
                cache: false,
                processData: false,
                success: function(data) {
                    if (data.status==200){
                        document.getElementById('design-lde').style.display = 'none';
                        for(var i = 0; i < data.videos.length; i++){
                            adverts += ''
                            +'<div class="col-xl-4">'
                                +'<video controls muted class="crm-profile-pic rounded avatar-100">'
                                    +'<source src="'+data.videos[i]+'" type="video/webm">'
                                +'</video>'
                                +'<div style="display: flex;align-items: center;justify-content: center;cursor: pointer;" onclick="savePanel(this)"  style="width:100px; cursor: pointer;" id="'+data.v[i]+':'+data.p[i]+':'+data.xpos+':'+data.ypos+':'+data.h+':'+data.w+':'+data.mpos+'">'
                                    +'<i class="las la-photo-video" style="font-size:24px;"></i>'
                                    +'<p style="font-size:12px;margin-left:60px;">Save</p>'
                                +'</div>'
                            +'</div>';
                        }

                        GoodEggs('SUCESS');

                        $('#videos').html(adverts);
                        $("video:first").click();
                        document.getElementById('video_panel').style.display = 'block';
                        document.getElementById('animate_design_btn').style.display = 'none';
                        document.getElementById('select_animation_label').style.display = 'block';
                        designData = {};
                        data['id'] = window.sessionStorage.getItem('cid');
                        designData = data;
                        update_design(designData);
                    }
                    if (data.status!=200){
                        BadEggs('ERROR');;
                        document.getElementById('design-lde').style.display = 'none';
                    }
                },
                statusCode: {
                    400: function(data) {
                        BadEggs('ERROR');;
                    }
                },
                error: function(err) {
                    BadEggs('ERROR');
                }
            });
        });
    });

    $("#save_location").bind('submit', function(e) {
        e.preventDefault();
        if(Object.keys(locationData).length==4){
            $('#locations-lde').css({"display": "block"});
            $.ajax({
                method: "POST",
                url: ip_address+'/api/campaign/locations',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(locationData),
                dataType: "json",
                cache: false,
                processData: false,
                success: function(data) {

                    if (data.status==200){
                        
                        if($(document.activeElement).attr('id')=='location_continue'){
                            $('#load-budget-tab').click();
                            $('#locations-lde').css({"display": "none"});
                        }

                        if($(document.activeElement).attr('id')=='location_save_and_close'){
                            $('#client-home').click();
                            $('#locations-lde').css({"display": "none"});
                        }

                        $('#load-billboards-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">LOCATIONS</span>');
                    }

                    if (data.status!=200){
                        BadEggs('ERROR');
                        $('#locations-lde').css({"display": "none"});
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

        if(Object.keys(locationData).length<4){
            $('#msg-body-error').html('SELECT A BILLBOARD FIRST');
            $('#msg-status-error').click();
        }

        return false;
    });

    $("#save_budget").bind('submit', function(e) {
        e.preventDefault();
        var end_date         = $('#end_date').val();
        var start_date       = $('#start_date').val();

        if (end_date < start_date){
            $('#end_date').val('');
            BadEggs('END DATE < START DATE');
        }

        if (end_date >= start_date  && selected_end_date !='' && selected_start_date !='' ){
            var daily_budget = $('#daily_budget').val();
            $('#budget-lde').css({"display": "block"});
            $.ajax({
                method: "POST",
                url: ip_address+'/api/campaign/budget',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'budget': daily_budget ,'start': start_date ,'end': end_date,'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid')}),
                dataType: "json",
                cache: false,
                processData: false,
                success: function(data) {
                    if (data.status==200){
                    
                        if($(document.activeElement).attr('id')=='budget_continue'){
                            $('#load-schedule-tab').click();
                            $('#budget-lde').css({"display": "none"});
                        }

                        if($(document.activeElement).attr('id')=='budget_save_and_close'){
                            $('#client-home').click();
                            $('#budget-lde').css({"display": "none"});
                        }

                        $('#load-budget-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">BUDGET</span>');
                    }

                    if (data.status!=200){
                        BadEggs('ERROR');
                        $('#budget-lde').css({"display": "none"});
                    }
                },
                statusCode: {
                    400: function(data) {
                        BadEggs('ERROR');
                        $('#budget-lde').css({"display": "none"});
                    }
                },
                error: function(err) {
                    BadEggs('ERROR');
                    $('#budget-lde').css({"display": "none"});
                }
            });
            
        }

        if (selected_end_date ==''){
            BadEggs('END DATE NOT SELECTED');
        }

        if (selected_start_date ==''){
            BadEggs('START DATE NOT SELECTED');
        }

    });

    $("#save_schedule").bind('submit', function(e) {
        e.preventDefault();
        options = '';
        $('#schedule-lde').css({"display": "block"});

        if($('#log').html()==""){
            BadEggs('SCHEDULE NOT SELECTED');
            $('#schedule-lde').css({"display": "none"});
        }

        if($('#log').html()!=""){
            $.ajax({
                method: "POST",
                url: ip_address+'/api/campaign/schedule',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid'),'schedule':[$('#log').html()]}),
                dataType: "json",
                cache: false,
                processData: false,
                success: function(data) {
                    if (data.status==200){

                        if($(document.activeElement).attr('id')=='schedule_continue'){
                           $('#load-design-tab').click();
                           $('#schedule-lde').css({"display": "none"});
                        }
                        if($(document.activeElement).attr('id')=='schedule_save_and_close'){
                            $('#client-home').click();
                            $('#schedule-lde').css({"display": "none"});
                        }
                        $('#load-schedule-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">SCHEDULE</span>');

                    }
                    if (data.status!=200){
                        BadEggs('ERROR');
                        $('#schedule-lde').css({"display": "none"});
                    }
                },
                statusCode: {
                    400: function(data) {
                        BadEggs('ERROR');
                        $('#schedule-lde').css({"display": "none"});
                    }
                },
                error: function(err) {
                    BadEggs('ERROR');
                    $('#schedule-lde').css({"display": "none"});
                }
            });
            
        }
        
    });

    $("#design_file_continue").bind('click', function(e) {
        e.preventDefault();
        var result                  = '';
        var reader                  = new FileReader();
        var form_data               = $('#file').get(0);
        var input_file              = form_data.files[0];
        var extension               = input_file.name.split('.').pop().toLowerCase();
        var media_display_position  = '';
        media_display_position      = display_position;

        reader.readAsDataURL(input_file);
        document.getElementById('design-lde').style.display = 'block';
        $(reader).on('load', function(e){
            data_line = e.target.result
            const base64String = data_line
                .replace('data:', '')
                .replace(/^.+,/, '');
            $.ajax({
                method: "POST",
                url: ip_address+'/api/campaign/design',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'media_position':media_display_position , 'file': base64String ,'extension': extension ,'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid'),'screen':screen_width_height.split(':')[0],'width':screen_width_height.split(':')[1],'height':screen_width_height.split(':')[2]}),
                dataType: "json",
                cache: false,
                processData: false,
                success: function(data) {
                    if(data.videos != null){
                        result +=''
                        +'<div class="col-xl-4">'
                            +'<video controls muted poster="'+data.videos[1]+'" class="crm-profile-pic rounded avatar-100">'
                                +'<source src="'+data.videos[0]+'" type="video/webm">'
                            +'</video>'
                            +'<div style="display: flex;align-items: center;justify-content: center;cursor: pointer;" onclick="saveVideo(this)" id="Save_Continue_Video"  style="width:100px;cursor: pointer;">'
                                +'<i class="las la-video" style="font-size:24px;"></i>'
                                +'<p style="font-size:12px;margin-left:60px;">Save</p>'
                            +'</div>'
                        +'</div>';
                        
                        GoodEggs('SUCESS');
                        $('#videos').html(result);

                        document.getElementById('design-lde').style.display                = 'none';
                        document.getElementById('save_design_file').style.display        = 'none';
                        document.getElementById('animate_design_btn').style.display      = 'none';
                        document.getElementById('video_panel').style.display             = 'block';
                        document.getElementById('select_animation_label').style.display  = 'block';

                        data['id'] = window.sessionStorage.getItem('cid');
                        designData = data;
                        update_design(designData);
                    }

                    if(data.videos == null){

                    }
                    
                    if (data.status!=200){
                        document.getElementById('design-lde').style.display = 'none';
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
        });
    });

    $('#load-billboards-tab').bind('click', function(e){
        e.preventDefault();
        result ='';
        $('#billboard-loader').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/billboard/query/client',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid')}),
            dataType: "json",
            success: function(data) {
                if (data.status==200){
                    for(i in data.msg){
                        _addressPoints=[data.msg[i].billboard_latitude, data.msg[i].billboard_longitude,data.msg[i].billboard_image,data.msg[i].billboard_id];
                        addressPoints.push(_addressPoints);
                        result +=''
                        +'<div class="col-xl-12 card p-2  border-none" >'

                            +'<div class="row rounded p-1" style="background-color: whitesmoke;margin:5px;height:auto;">'
                            
                                +'<div class="col-xl-12">'
                                    +'<img id="'+data.msg[i].billboard_name+'" title="'+data.msg[i].billboard_owner_name+'" onclick="queryMap(this)" class="crm-profile-pic rounded" height="100%" width="100%" src="'+data.msg[i].billboard_image+'" >'
                                +'</div>'

                                +'<div class="col-xl-6" style="margin-top:auto;">'

                                    +'<div class="col-xl-6" style="margin-left:-10px;">'
                                        +'<p style="width:330px;color:black;font-weight:bold;" class="wordwrap">'+data.msg[i].billboard_name +'<p>'
                                        +'<p id="'+data.msg[i].billboard_id+':'+data.msg[i].billboard_latitude+':'+data.msg[i].billboard_longitude+':'+data.msg[i].billboard_image+':'+data.msg[i].zoom_level+'" class="loadEdge" onclick="saveMap(this)"   style="inline-size: 200px;color:black;margin-top:-15px;font-size:14px;" >'+data.msg[i].billboard_owner_name +' '+'<i id="select_'+data.msg[i].billboard_id+'" class="fa fa-check-circle" style="font-size:18px;color:green;cursor:pointer;" title="Select Billboard" ></i> <p>'
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
                                
                                        +'<div class="iq-icon-box-2" style="margin-left:140px;margin-top:-57px;width:74px;" title="Status" >'
                                            +'<i class="las la-check-double" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:green;">'+data.msg[i].billboard_availability+'</p>'
                                        +'</div>'

                                        +'<div class="iq-icon-box-2" style="margin-left:195px;margin-top:-55px;width:74px;" id="switch_'+data.msg[i].billboard_id+'" >'
                                            +'<i class="las la-border-none" style="font-size:24px;color:black;cursor:pointer;font-weight:bolder;" title=" Billboard split '+data.msg[i].billboard_screen_count+'"></i>'
                                            +'<p style="font-size:12px;margin-top:-5px;color:black;margin-left:8px;">'+data.msg[i].billboard_screen_count+'</p>'
                                        +'</div>'

                                    +'</div>'

                                +'</div>'

                            +'</div>'
                        +'</div>';
                    }

                    if (data.id == 1){
                        $('#load-billboards-tab').html('<span class="menu-icon"><i class="fa fa-check-circle" ></i></span><span class="menu-title">LOCATIONS</span>');
                    }

                    if(data.msg.length > 0){
                        
                        $('#serp').empty();
                        $('#serp').html(result);

                        if(data.msg.length == 1){
                            $(".loadEdge:first").click();
                        }
                       
                        geoData = {id:'q', data:addressPoints};
                        loadMap(geoData);
                    }

                    if(data.msg.length==0){
                        GoodEggs('RECORD NOT FOUND');
                    }
                    $('#billboard-loader').css({"display": "none"});
                }
                if (data.status!=200){
                    
                    BadEggs('ERROR');
                    $('#billboard-loader').css({"display": "none"});
                }
            },
            statusCode: {
                400: function(data) {
                    
                    BadEggs('ERROR');
                    $('#billboard-loader').css({"display": "none"});
                }
            },
            error: function(err) {
                
                BadEggs('ERROR');
                $('#billboard-loader').css({"display": "none"});
            }
        });
    });
    
    $("#load-budget-tab").bind('click', function(e) {
        e.preventDefault();
        $('#budget-loader').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/campaign/budget/select',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid')}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(pkt) {

                if (pkt.status==200){

                    if(pkt.budget != null ){

                        if ( pkt.budget[0].daily_budget == null){
                            //$('#daily_budget').attr('placeholder','Ksh 100');
                        }

                        if ( pkt.budget[0].daily_budget != null){
                            $('#daily_budget').attr('placeholder','Ksh ' + pkt.budget[0].daily_budget);
                        }

                        if ( pkt.budget[0].end_date == null){
                            $('#end_date').val(today());
                            $('#end_date').attr('min', today());
                        }

                        if ( pkt.budget[0].end_date != null){
                            $('#end_date').val(pkt.budget[0].end_date);
                        }

                        if ( pkt.budget[0].start_date == null){
                            $('#start_date').val(today());
                            $('#start_date').attr('min', today());
                        }

                        if ( pkt.budget[0].start_date != null){
                            $('#start_date').val(pkt.budget[0].start_date);
                        }

                        if ( pkt.budget[0].daily_budget != null && pkt.budget[0].start_date != null &&  pkt.budget[0].end_date != null){
                            $('#load-budget-tab').html('<span class="menu-icon"><i class="fa fa-check-circle" ></i></span><span class="menu-title">BUDGET</span> ');
                        }
                    }

                    if(pkt.budget == null ){
                    
                        //$('#budget_save_and_close').attr('disabled', true);
                        //$('#budget_continue').attr('disabled', true);
                    }
                    $('#budget-loader').css({"display": "none"});

                }

                if (pkt.status!=200){
                    BadEggs('ERROR');
                    $('#budget-loader').css({"display": "none"});
                }
            },
            statusCode: {
                400: function(pkt) {
                    BadEggs('ERROR');
                    $('#budget-loader').css({"display": "none"});
                }
            },
            error: function(err) {
                BadEggs('ERROR');
                $('#budget-loader').css({"display": "none"});
            }
        });
    });

    $("#load-schedule-tab").bind('click', function(e) {
        e.preventDefault();
        $('#schedule-loader').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/campaign/schedule/select',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid')}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(pkt) {
                if (pkt.status==200){
                    
                    if(pkt.schedule[0] != null){

                        log.line = 0;

                        $('#timetable').scheduler({

                            data: pkt.schedule[0][0],
                            onSelect: function (d) {
                                console.log(typeof(d));
                                $('#log').empty();
                                log(JSON.stringify(d));     
                            }
                        });

                        $('#load-schedule-tab').html('<span class="menu-icon"><i class="fa fa-check-circle" ></i></span><span class="menu-title">SCHEDULE</span>');
                    }
                    
                    if(pkt.schedule[0] == null){

                        log.line = 0;

                        $('#timetable').scheduler({
                            onSelect: function (d) {
                                console.log(typeof(d));
                                $('#log').empty();
                                log(JSON.stringify(d));     
                            }
                        });
                        /*
                        $('.scheduler-reset').attr('disabled', true);
                        $('#schedule_save_and_close').attr('disabled', true);
                        $('#schedule_continue').attr('disabled', true);
                        */
                    }

                    $('#schedule-loader').css({"display": "none"});

                }
                if (pkt.status!=200){
                    BadEggs('ERROR');
                    $('#schedule-loader').css({"display": "none"});
                }
            },
            statusCode: {
                400: function(pkt) {
                    BadEggs('ERROR');
                    $('#schedule-loader').css({"display": "none"});
                }
            },
            error: function(err) {
                BadEggs('ERROR');
                $('#schedule-loader').css({"display": "none"});
            }
        });
    });

    $("#load-design-tab").bind('click', function(e) {
        e.preventDefault();
        var adverts  = '';
        $('#divisiondrp').html('');
        $('#design-loader').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/campaign/design/select',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid')}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(data) {
                if (data.status==200){
                    if( data.button != null ){

                        $('#divisiondrp').html(data.button['controls']);
                        document.getElementById('animate_design_btn').style.display = 'block';

                        if(data.design.videos != null){

                            if(data.type == 'video'){
                                adverts += ''
                                    +'<div class="col-xl-4">'
                                        +'<video controls poster="'+data.design.videos[1]+'" muted class="crm-profile-pic rounded avatar-100">'
                                            +'<source src="'+data.design.videos[0]+'" type="video/webm">'
                                        +'</video>'
                                        +'<div style="display: flex;align-items: center;justify-content: center;cursor: pointer;" onclick="saveVideo(this)"  style="width:100px; cursor: pointer;" id="Save_Continue_Video">'
                                            +'<i class="las la-video" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-left:60px;">Save</p>'
                                        +'</div>'
                                    +'</div>';
                                $("#previewVid").attr("src", data.preview);
                                
                                document.getElementById('previewImg').style.display         = 'none';
                                document.getElementById('previewVid').style.display         = 'block';
                                document.getElementById('channel_panel').style.display      = 'block';
                                document.getElementById('save_design_file').style.display   = 'block';
                                document.getElementById('animate_design_btn').style.display = 'none';
                            }

                            if(data.type == 'image'){

                                for(var i = 0; i < data.design.videos.length; i++){
                                    
                                    adverts += ''
                                    +'<div class="col-xl-4">'
                                        +'<video controls muted class="crm-profile-pic rounded avatar-100">'
                                            +'<source src="'+data.design.videos[i]+'" type="video/webm">'
                                        +'</video>'
                                        +'<div style="display: flex;align-items: center;justify-content: center;cursor: pointer;" onclick="savePanel(this)"  style="width:100px; cursor: pointer;" id="'+data.design.v[i]+':'+data.design.p[i]+':'+data.design.xpos+':'+data.design.ypos+':'+data.design.h+':'+data.design.w+':'+data.design.mpos+'">'
                                            +'<i class="las la-photo-video" style="font-size:24px;"></i>'
                                            +'<p style="font-size:12px;margin-left:60px;">Save</p>'
                                        +'</div>'
                                    +'</div>';
                                }

                                $("#previewImg").attr("src", data.preview);
                                document.getElementById('previewVid').style.display          = 'none';
                                document.getElementById('previewImg').style.display          = 'block';
                                document.getElementById('channel_panel').style.display       = 'block';
                                document.getElementById('animate_design_file').style.display = 'block';
                                document.getElementById('save_design_file').style.display    = 'none';
                            }

                            $('#videos').html(adverts);
                            document.getElementById('video_panel').style.display = 'block';
                            document.getElementById('select_animation_label').style.display = 'block';
                            $('#load-design-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">DESIGN</span>');
                        }

                        if(data.design.videos = null){
                            $('#design-loader').css({"display": "none"});
                        }

                        $('#design-loader').css({"display": "none"});
                    }

                    if( data.button == null ){
                        BadEggs('SELECT A BILLBOARD FIRST');
                        $('#design-loader').css({"display": "none"});
                    }

                }
                if (data.status==201){
                    BadEggs('SELECT A BILLBOARD FIRST');
                    $('#design-loader').css({"display": "none"});
                }
                if (data.status==202){
                    console.log(data);
                    $('#divisiondrp').html(data.button[0]['controls']);
                    $('#design-loader').css({"display": "none"});
                    document.getElementById('animate_design_btn').style.display = 'block';
                }
            },
            statusCode: {
                400: function(data) {
                    BadEggs('ERROR');
                    $('#design-loader').css({"display": "none"});
                }
            },
            error: function(err) {
                BadEggs('ERROR');
                $('#design-loader').css({"display": "none"});
            }
        });
    });

    function save_tabs(){
        $('#load-review-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">REVIEW</span>');
        $('#load-budget-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">BUDGET</span>');
        $('#load-design-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">DESIGN</span>');
        $('#load-qr-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">QRCODE</span>');
        $('#load-schedule-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">SCHEDULE</span>');
        $('#load-billboards-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">LOCATIONS</span>');
    }

    $("#load-review-tab").bind('click', function(e) {
        e.preventDefault();
        result        = '';
        popup         = '';
        campaign      = '';
        reviewData    = {};
        $('#review-loader').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/campaign/review',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid')}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(pkt) {
               
                if (pkt.status==200){
                     console.log(pkt);
                    for(i in pkt.campaign){
                        if(pkt.campaign[i].name != null){
                            $('#Name').html(pkt.campaign[i].name);
                            reviewData['name']  = pkt.campaign[i].name;
                            if(reviewData.name  == '?'){
                                delete reviewData['name'];
                            }
                        }

                        if(pkt.campaign[i].category != null){
                            $('#Category').html(pkt.campaign[i].category);
                            reviewData['category']  = pkt.campaign[i].category;
                            if(reviewData.category  == '?'){
                                delete reviewData['category'];
                            }
                        }
 
                        if(pkt.campaign[i].magnate != null){
                            $('#Magnate').html(pkt.campaign[i].magnate);
                            reviewData['magnate']  = pkt.campaign[i].magnate;
                            if(reviewData.magnate  == '?'){
                                delete reviewData['magnate'];
                            }
                        }
                    }

                    for (i in pkt.budget){

                        if(pkt.budget[i].daily_budget != null){
                            $('#Daily_budget').html(pkt.budget[i].daily_budget);
                            reviewData['daily_budget']  = pkt.budget[i].daily_budget;
                            if(reviewData.daily_budget  == '?'){
                                delete reviewData['daily_budget'];
                            }
                        }

                        if(pkt.budget[i].start_date != null){
                            $('#Start_date').html(pkt.budget[i].start_date);
                            reviewData['start_date']  = pkt.budget[i].start_date;
                            if(reviewData.start_date  == '?'){
                                delete reviewData['start_date'];
                            }
                        }

                        if(pkt.budget[i].end_date != null){
                            $('#End_date').html(pkt.budget[i].end_date);
                            reviewData['end_date']  = pkt.budget[i].end_date;
                            if(reviewData.end_date  == '?'){
                                delete reviewData['end_date'];
                            }
                        }
                    }

                    for(i in pkt.location){

                        if(pkt.location[i].billboard_name != null){
                            $('#Location').html(pkt.location[i].billboard_name);
                            reviewData['location']  = pkt.location[i].billboard_name;
                            if(reviewData.location  == '?'){
                                delete reviewData['location'];
                            }
                        }
                    }
                    
                    for(i in pkt.design){
                       
                        if(pkt.design[i] != null){
                            $("#design_detail").attr("poster", pkt.design[i].poster);
                            $("#design_detail").attr("src", pkt.design[i].source_file);
                            document.getElementById('design_detail').style.display = 'block';
                            reviewData['design']  = pkt.design[i].source_file;
                        }

                        if(pkt.design[i] == null){
                            $("#design_detail").attr("poster", 'http://127.0.0.1/images/novideo.png');
                            document.getElementById('design_detail').style.display = 'block';
                        }

                        if(reviewData.design == '?'){
                            delete reviewData['design'];
                        }
                    }
                    
                    if( pkt.schedule[0]  != null){
                        $('#Schedule').scheduler({
                            disabled: true,
                            footer:false,
                            data: pkt.schedule[0][0]
                        });
                        reviewData['schedule']  = pkt.schedule[0][0];
                    }

                    if( pkt.schedule[0]  == null){
                        $('#Schedule').scheduler({
                            disabled: true,
                            footer:false
                        });
                    }

                    for(i in pkt.qrcode){
                        if(pkt.qrcode[i].qvid != null){
                            
                            $("#qvid").attr("src", pkt.qrcode[i].qvid);
                            reviewData['qvid']  = pkt.qrcode[i].qvid;
                            if(reviewData.qrcode  == '?'){
                                delete reviewData['qvid'];
                            }
                        }

                        if(pkt.qrcode[i].qimg != null){

                            $("#qimg").attr("src", pkt.qrcode[i].qimg);
                            reviewData['qimg']  = pkt.qrcode[i].qimg;
                            if(reviewData.qimg  == '?'){
                                delete reviewData['qimg'];
                            }
                        }
 
                        if(pkt.qrcode[i].qposter != null){

                            $("#qvid").attr("poster", pkt.qrcode[i].qposter);
                            reviewData['qposter']  = pkt.qrcode[i].qposter;
                            if(reviewData.qposter  == '?'){
                                delete reviewData['qposter'];
                            }
                        }
                    }

                    if (pkt.event != 'ONGOING'){
                       save_tabs();
                    }

                    if (pkt.event == 'APPROAVED'){
                        $('#location_continue').attr('disabled', true);
                        $('#location_save_and_close').attr('disabled', true);
                        $('#budget_save_and_close').attr('disabled', true);
                        $('#budget_continue').attr('disabled', true);
                        $('#schedule_save_and_close').attr('disabled', true);
                        $('#schedule_continue').attr('disabled', true);
                        $('.las la-pen upload-button').attr('disabled', true);
                        $('#review_continue').attr('disabled', true);
                        $('#review_save_and_close').attr('disabled', true);
                        save_tabs();
                    }
                }

                if (pkt.status!=200){

                    $('#Schedule').scheduler({
                        disabled: true,
                        footer:false
                    });
                    $("#design_detail").attr("poster", 'http://127.0.0.1/images/novideo.png');
                    document.getElementById('design_detail').style.display = 'block';
                }

                if(reviewData.schedule === undefined){
                    delete reviewData['schedule'];
                }

                if(Object.keys(reviewData).length<10){
                    $('#review_continue').attr('disabled', true);

                }

                if(Object.keys(reviewData).length==10){
                    $('#review_continue').attr('disabled', false);
                }

                $('#review-loader').css({"display": "none"});
            },
            statusCode: {
                400: function(pkt) {
                    BadEggs('ERROR');
                    $('#review-loader').css({"display": "none"});
                }
            },
            error: function(err) {
                BadEggs('ERROR');
                $('#review-loader').css({"display": "none"});
            }
        });
    });

    $("#load-schedule").bind('click', function(e) {
        e.preventDefault();
        $('#load-schedule-tab').click();
    });

    $("#load-design").bind('click', function(e) {
        e.preventDefault();
        $('#load-design-tab').click();
    });

    $("#load-budget").bind('click', function(e) {
        e.preventDefault();
        $('#load-budget-tab').click();
    });
    
    function log(msg) {
        $('#log').prepend(msg);
    }

    $(document).on('mouseover', 'video', function() { 
        $(this).get(0).play(); 
    }); 

    $(document).on('mouseleave', 'video', function() { 
        $(this).get(0).pause(); 
    });

    $("#edit_name").bind('click', function(e) {
        e.preventDefault();
        $('#load-budget-tab').click();
    });

    $("#edit_category").bind('click', function(e) {
        e.preventDefault();
        $('#load-budget-tab').click();
    });

    $("#edit_location").bind('click', function(e) {
        e.preventDefault();
        $('#load-billboards-tab').click();
    });

    $("#edit_magnate").bind('click', function(e) {
        e.preventDefault();
        $('#load-billboards-tab').click();
    });

    $("#edit_budget").bind('click', function(e) {
        e.preventDefault();
        $('#load-budget-tab').click();
    });

    $("#edit_schedule").bind('click', function(e) {
        e.preventDefault();
        $('#load-schedule-tab').click();
    });

    $("#edit_design").bind('click', function(e) {
        e.preventDefault();
        $('#load-design-tab').click();
       
    });

    $('#end_date').on('change', function(){
        var startDate = $('#start_date').val();
        var endDate = $('#end_date').val();
        if (endDate < startDate){
            $('#end_date').val('');
            BadEggs('END DATE <  START DATE');
        }
    });

    $("#user-logout").bind('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location = 'http://127.0.0.1/';
    });

    $("#edit_qr_code").bind('click', function(e) {
        e.preventDefault();
        $('#load-qr-tab').click();
    });
    
    //QRCODE
    $("#qr_submit").bind('click', function(e) {

        e.preventDefault();
        var _qrData     = [];
        var dest        = $('#qr_name').val();
        var title       = $('select[name=qr_category] option').filter(':selected').val();
        $('#qr-loader').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/qrcode/create',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid'),'dest':dest,'name':title}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(data) {
                if (data.status==200){
                    _qrData = [data.result,window.sessionStorage.getItem('content'),window.sessionStorage.getItem('cid')];
                    qrData.push(_qrData);
                    qrcode(qrData);
                    $('#qr_submit').css({"display": "none"});
                }
                if (data.status!=200){
                    BadEggs('QR CODE NOT CREATED');
                    $('#qr-loader').css({"display": "none"});
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
    });

    $("#load-qr-tab").bind('click', function(e) {
        qr_img ='';
        qr_vid ='';
        e.preventDefault();
        $('#qr-loader').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/qrcode/video/select',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid')}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(data) {
                console.log(data);
                if (data.status==200){
                    
                    if(data.qrcode[0] != null){

                        qr_img += ''
                        +'<div class="col-xl-12">'
                            +'<label>QR Image</label>'
                            +'<div class="crm-profile-img-edit position-relative">'
                                +'<img class="crm-profile-pic rounded avatar-100"  style="height:300px;width: 300px;" src="'+data.qrcode[0].img+'" alt="">'
                            +'</div>'
                        +'</div>';
                        $('#qr_image').html(qr_img);
                        qr_vid += ''
                        +'<div class="col-xl-12">'
                            +'<label>QR Video</label>'
                            +'<video controls poster="'+data.qrcode[0].prev+'" muted class="crm-profile-pic rounded avatar-100">'
                                +'<source src="'+data.qrcode[0].video+'" type="video/webm">'
                            +'</video>'
                        +'</div>';
                        $('#qr_video').html(qr_vid);
                        $('#qr_submit').css({"display": "none"});
                        $('#qr_footer').css({"display": "block"});
                        $('#load-qr-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">QRCODE</span>');
                    }
                    
                    if(data.qrcode[0] == null){

                        qr_img += ''
                        +'<div class="col-xl-12">'
                            +'<label>QR Image</label>'
                            +'<div class="crm-profile-img-edit position-relative">'
                                +'<img class="crm-profile-pic rounded avatar-100"  style="height:300px;width: 300px;" src="'+data.qrcode[0].prev+'" alt="">'
                            +'</div>'
                        +'</div>';
                        $('#qr_image').html(qr_img);
                        qr_vid += ''
                        +'<div class="col-xl-12">'
                            +'<label>QR Video</label>'
                            +'<video controls poster="'+data.qrcode[0].img+'" muted class="crm-profile-pic rounded avatar-100">'
                                +'<source src="'+data.qrcode[0].video+'" type="video/webm">'
                            +'</video>'
                        +'</div>';
                        $('#qr_video').html(qr_vid);
                        $('#qr_submit').css({"display": "block"});
                        $('#qr_footer').css({"display": "none"});
                    }

                    
                    $('#qr-loader').css({"display": "none"});

                }
                if (data.status!=200){
                    BadEggs(data.msg);
                    $('#qr-loader').css({"display": "none"});
                }
            },
            statusCode: {
                400: function(data) {
                    BadEggs(data.msg);
                    $('#qr-loader').css({"display": "none"});
                }
            },
            error: function(err) {
                BadEggs(data.msg);
                $('#qr-loader').css({"display": "none"});
            }
        });
    });

});     

var map = null;

const { Geo } = aws_amplify_geo;
const { Amplify } = aws_amplify_core;
const { createMap} = AmplifyMapLibre;

Amplify.configure({
Auth: {
    identityPoolId: "us-east-1:8cbbf4f0-45cb-4c54-9cf1-74c07df56ae4",
    region: "us-east-1",
},
geo: {
    AmazonLocationService: {
    maps: {
        items: {
        "Tangazo": {
            style: "Default style"
        },
        },
        default: "Tangazo",
    },
    search_indices: {
        items: [
            "Tangazo-idx"
        ],
        default: "Tangazo-idx"
      },
    region: "us-east-1",
    },
}
});

function qrcode(qrData){
    qr_img ='';
    qr_vid ='';

    $.ajax({
        method: "POST",
        url: ip_address+'/api/qrcode/video',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'q':qrData}),
        dataType: "json",
        cache: false,
        processData: false,
        success: function(data) {
            if (data.status==200){
                qr_img += ''
                +'<div class="col-xl-12">'
                    +'<label>QR Image</label>'
                    +'<div class="crm-profile-img-edit position-relative">'
                        +'<img class="crm-profile-pic rounded avatar-100"  style="height:300px;width: 300px;" src="'+data.img+'" alt="">'
                    +'</div>'
                +'</div>';
                $('#qr_image').html(qr_img);

                qr_vid += ''
                +'<div class="col-xl-12">'
                    +'<label>QR Video</label>'
                    +'<video controls  autoplay class="crm-profile-pic rounded avatar-100">'
                        +'<source src="'+data.video+'" type="video/webm">'
                    +'</video>'
                +'</div>';
                $('#qr_video').html(qr_vid);

                GoodEggs(data.msg);

                
                $('#load-qr-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">QRCODE</span>');
                $('#qr_footer').css({"display": "block"});
                $('#qr_submit').css({"display": "none"});
          
            }
            if (data.status!=200){
                BadEggs(data.msg);
                $('#qr-loader').css({"display": "none"});
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
    qrData = [];
}

$("#qr_continue").bind('click', function(e) {
    e.preventDefault();
    $('#load-review-tab').click();
});

$("#qr_save_and_close").bind('click', function(e) {
    e.preventDefault();
    $('#client-home').click();
});

function loadMap(addressPoints) {
    async function initializeMap() {
        const map = await createMap(
          {
            container: "map",
            center: [36.8160363,-1.2749951],
            zoom: 5,
            hash: true,
          }
        );

        //map.addControl(new maplibregl.NavigationControl(), "bottom-left");
        
        for(var i = 0; i < addressPoints.data.length; i++){

            try {

                // Initialize one marker and one popup
                const marker = new maplibregl.Marker();
                const popup = new maplibregl.Popup({ offset: 35 });
                /*
                //Set popup event handler
                popup.on('close', () => {
                    marker.remove();
                });
                */
                // Remove existing marker & popup if any
                if (marker) marker.remove();
                if (popup) popup.remove();
                
                // Get place details
                const point = await Geo.searchByCoordinates([addressPoints.data[i][1], addressPoints.data[i][0]]);

                // set popup position and text & add it to the map
                
                /*
                popup.setLngLat([point.geometry?.point[0], point.geometry?.point[1]])
                    .setHTML('<img src="' +  addressPoints.data[i][2] + '" width="150" height="100" style="border-radius:50%;width:50px;height:50px;" /><p>'+point.label+'</p>')
                    .addTo(map);
                */
                // set marker coords & add it to the map
                marker.setLngLat([point.geometry?.point[0], point.geometry?.point[1]])
                    .addTo(map);

            } catch (error) {
                console.log(error);
            }
            
        }

      }

      initializeMap();
      
    return false;
}

function queryMap(addressPoints) {
    var id = $(addressPoints).attr("id");
    return false;
}

function saveMap(addressPoints) {
    locationData={};
    id = $(addressPoints).attr("id");
    
    async function initializeMap() {
        const map = await createMap(
          {
            container: "map",
            center: [id.split(':')[2],id.split(':')[1]],
            zoom: id.split(':')[5],
            hash: true,
          }
        );
        //map.addControl(new maplibregl.NavigationControl(), "bottom-right");
        
        try {

            // Initialize one marker and one popup
            const marker = new maplibregl.Marker();
            const popup = new maplibregl.Popup({ offset: 35 });
            const point = await Geo.searchByCoordinates([id.split(':')[2], id.split(':')[1]]);

            var img_path = "http:" +  id.split(':')[4];
        
            popup.setLngLat([point.geometry?.point[0], point.geometry?.point[1]])
                .setHTML('<img src="'+ img_path + '" style="border-radius:1%;width:75px;height:50px;" />')
                .addTo(map);
            
            marker.setLngLat([point.geometry?.point[0], point.geometry?.point[1]])
                .addTo(map);
        } catch (error) {
            console.log(error);
        }
        
    }
    initializeMap();
    
    $.ajax({
        method: "POST",
        url: ip_address+'/api/campaign/query',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid'),'billboard_id': id.split(':')[0]}),
        dataType: "json",
        cache: false,
        processData: false,
        success: function(data) {
            if (data.status==200){

                var map_id= window.sessionStorage.getItem('map_id');
                if(map_id != "#select_"+id.split(':')[0]){
                    $(map_id).css({"color": "green","font-weight": "bolder"});
                    $("#select_"+id.split(':')[0]).css({"color": "#062B78","font-weight": "bolder"});
                    window.sessionStorage.setItem('map_id', "#select_"+id.split(':')[0]);
                }
                
                if(map_id == "#select_"+id.split(':')[0]){
                    $("#select_"+id.split(':')[0]).css({"color": "#062B78","font-weight": "bolder"});
                    window.sessionStorage.setItem('map_id', "#select_"+id.split(':')[0]);
                }
                
                if(map_id == ""){
                    $("#select_"+id.split(':')[0]).css({"color": "#062B78","font-weight": "bolder"});
                    window.sessionStorage.setItem('map_id', "#select_"+id.split(':')[0]);
                }
                
                var inputElement  = '';
                for(var i = 0; i < data.display.length; i++){
                    for(var j = 0; j < data.display[i].length; j++){
                        inputElement += '<button type="submit" class="btn btn-social-icon-text btn-facebook" style="background-color: #062B78;margin:5px;" id="' + data.display[i][j] + '" value="' + data.swh + '"><i class="fa fa-check-circle"></i>' + data.display[i][j] + '</button>';
                    }
                }
                
               // GoodEggs('SUCCESS');

                $("#select_"+id.split(':')[0]).css({"color": "#062B78","font-weight": "bolder"});
                locationData={'billboard_id': id.split(':')[0],'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid'),'btn':[{"controls":inputElement}]};
            }
            if (data.status!=200){
                
            }
        },
        statusCode: {
            400: function(data) {
                BadEggs('ERROR');
            }
        },
        error: function(err) {
            BadEggs(err);
        }
    });
    
}

function savePanel(metrics) {
    $('#design-lde').css({"display": "block"});
    $.ajax({
        method: "POST",
        url: ip_address+'/api/campaign/save/animate',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'media_content':$(metrics).attr("id").split(':')[0],'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid'),'media_poster':$(metrics).attr("id").split(':')[1],'media_position':$(metrics).attr("id").split(':')[6],'media_xpos':$(metrics).attr("id").split(':')[2],'media_ypos':$(metrics).attr("id").split(':')[3],'media_height':$(metrics).attr("id").split(':')[4],'media_width':$(metrics).attr("id").split(':')[5]}),
        dataType: "json",
        cache: false,
        processData: false,
        success: function(data) {
            if (data.status==200){
                message_status = '';
                message_status = 'SUCCESS';
                $('#msg-body').html(message_status);
                $('#msg-status').click();
                $('#design-lde').css({"display": "none"});
                $('#load-qr-tab').click();
                $('#load-design-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">DESIGN</span>');
            }
            if (data.status!=200){
                $('#design-lde').css({"display": "none"});
            }
        },
        statusCode: {
            400: function(data) {
                $('#design-lde').css({"display": "none"});
            }
        },
        error: function(err) {
            $('#design-lde').css({"display": "none"});
        }
    });
}

function saveVideo(metrics){
    if($(metrics).attr("id")=='Save_Continue_Video'){
        GoodEggs('SUCCESS');
        $('#load-qr-tab').click();
        $('#load-design-tab').html('<span class="menu-icon"><i class="fa fa-check-circle"></i></span><span class="menu-title">DESIGN</span>');
    }
}

function update_design(designData){
    $.ajax({
        method: "POST",
        url: ip_address+'/api/campaign/update/animate',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'campaign_id':window.sessionStorage.getItem('cid'),'design':[designData]}),
        dataType: "json",
        cache: false,
        processData: false,
        success: function(data) {
            if (data.status==200){
                GoodEggs('SUCCESS');
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
