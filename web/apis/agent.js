$(document).ready(function() {
    adverts = '';
    advert_status = 'PENDING';
    ip_address    = 'http://127.0.0.1:5008';
    var uid       = window.sessionStorage.getItem('content');
    if(uid == null){
        window.location = 'http://127.0.0.1/';
    }

    document.getElementById('b-loader').style.display = 'block';

    function BadEggs(message_status){
        $('#msg-body').html(message_status);
        $('#msg-bad').click();
    }

    function GoodEggs(message_status){
        $('#msg-body-good').html(message_status);
        $('#msg-good').click();
    }

    $.ajax({
        method: "POST",
        url: ip_address+'/api/profile/query',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'query': uid , 'limit': '1'}),
        dataType: "json",
        success: function(data) {
            if (data.status==200){
                console.log(data);
                if(data.msg[0].user_id==uid){
                    $('#admin-email').html(data.msg[0].user_email);
                    $('#admin-profile-image').attr({src: data.msg[0].user_image});
                    $('#admin-creation-date').html(data.msg[0].user_registration_date);
                    $('#admin-usernames').html(data.msg[0].first_name + " " + data.msg[0].last_name);
                    window.sessionStorage.setItem('agid', data.msg[0].user_agency_id);
                }
                $("#load_pending").click();
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

    $("#load-home").bind('click', function(e) {
        e.preventDefault();
        $('#load_all').click();
    });

    $("#ads").bind('submit', function(e) {
        e.preventDefault();
        $('#b-loader').css({"display": "block"});

        if($(document.activeElement).attr('id')=='load_all'){
            advert_status = 'ALL';
            $('#srch-category').text(advert_status);
        }
        
        if($(document.activeElement).attr('id')=='load_pending'){
            advert_status = 'PENDING';
            $('#srch-category').text(advert_status);
        }

        if($(document.activeElement).attr('id')=='load-rejected'){
            advert_status = 'REJECTED';
            $('#srch-category').text(advert_status);
        }
        if($(document.activeElement).attr('id')=='load_approaved'){
            advert_status = 'APPROAVED';
            $('#srch-category').text('APPROVED');
        }
        if($(document.activeElement).attr('id')=='load_terminated'){
            advert_status  = 'TERMINATED';
            $('#srch-category').text(advert_status);
        }

        $.ajax({
            method: "POST",
            url: ip_address+'/api/campaign/agents',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'agid':window.sessionStorage.getItem('agid'),'status':advert_status}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(pkt) {
                if (pkt.status==200){
                    result = '';
                    if(pkt.campaign.length>0){
                        for (var i = 0; i < pkt.campaign.length; i++){
                            edtstatus    = '';
                            undstatus    = '';
                            chtstatus    = '';
                            status_color = '';
                            border_color = '';
                            if (pkt.campaign[i].status=='PENDING'){
                                edtstatus    = 'block';
                                undstatus    = 'none';
                                chtstatus    = 'none';
                                status_color = '#F7DC6F';
                                border_color = '#F7DC6F';
                            }
                            if (pkt.campaign[i].status=='REJECTED'){
                                edtstatus    = 'none';
                                undstatus    = 'none';
                                chtstatus    = 'none';
                                status_color = '#7B241C';
                                border_color = '#7B241C';
                            }
                            if (pkt.campaign[i].status=='APPROAVED'){
                                edtstatus    = 'none';
                                undstatus    = 'none';
                                chtstatus    = 'block';
                                status_color = '#82E0AA';
                                border_color = '#82E0AA';
                            }
                            if (pkt.campaign[i].status=='TERMINATED'){
                                edtstatus    = 'none';
                                undstatus    = 'block';
                                chtstatus    = 'none';
                                status_color = '#1B4F72';
                                border_color = '#1B4F72';
                            }
                            result +=''
                            +'<div class="col-xl-4 card p-2 border-none" style="height:auto;margin-bottom:5px;">'
                                +'<div class="row">'
                                    +'<div class="col-xl-12">'
                                        +'<video controls muted poster="'+pkt.design[i].poster+'" class="crm-profile-pic rounded avatar-100">'
                                            +'<source src="'+pkt.design[i].source_file+'" type="video/webm">'
                                        +'</video>'
                                    +'</div>'
                                    +'<div class="col-xl-12" style="margin-left:2px;">'
                                        +'<div class="card border-none p-1">'
                                                +'<div class="col-xl-12">'
                                                    +'<div class="row">'
                                                        +'<div class="p-1">'
                                                            +'<div id="'+pkt.location[i].billboard_id+'">'
                                                                +'<p style="text-transform:capitalize;text-overflow: ellipsis;">'+pkt.campaign[i].name+' - '+pkt.campaign[i].category+'</p>'
                                                            +'</div>'
                                                            
                                                            +'<img id="'+pkt.location[i].billboard_name+'" onclick="queryMap(this)" style="border-radius:50%;background-color:'+border_color+';padding:2px;" alt="check" height="40" width="40" src="'+pkt.location[i].billboard_image+'" >'
                                                                +'<path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clip-rule="evenodd" />'
                                                            +'</svg>'
                                                            
                                                            +'<div style="margin-left:55px;margin-top:-40px;">'
                                                                +'<h4 id="'+pkt.location[i].billboard_id+'" style="text-transform:capitalize;overflow: hidden;font-size:15px;">'
                                                                +pkt.location[i].billboard_name+'</h4>'
                                                                +'<h5 style="font-size:12px;margin-top:5px;">'+pkt.campaign[i].magnate+'</h5>'
                                                            +'</div>'
                                                        +'</div>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="col-xl-12">'
                                                    +'<div class="custom-control custom-switch custom-switch-text custom-control-inline">'
                                                        +'<div class="row" style="margin-left: 7.0rem;">'
                                                            +'<div class="row p-1" id="'+pkt.campaign[i].id+'" style="display:'+edtstatus+';">'
                                                                +'<i class="fa fa-check-circle"  data-message="'+pkt.campaign[i].id+':APPROAVED" onclick="YesNo(this)"   style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;"></i>'
                                                                +'<i class="las la-trash" data-message="'+pkt.campaign[i].id+':REJECTED"  onclick="YesNo(this)"   style="font-size:32px;font-weight: bolder;color:'+status_color+';margin-left:auto;cursor:pointer;"></i>'
                                                            +'</div>'
                                                            +'<div class="row p-1"  style="display:'+undstatus+';">'
                                                                +'<i class="las la-undo "  data-message="'+pkt.campaign[i].id+'" onclick="Undo(this)"    style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;"></i>'
                                                            +'</div>'
                                                            +'<ul class="navbar-nav p-2">'
                                                                +'<li class="dropdown">'
                                                                    +'<a href="#"  id="dropdownMenuButton4" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
                                                                        +'<i class="las la-ellipsis-h" style="font-size:32px;color:'+status_color+';"></i>'
                                                                    +'</a>'
                                                                    +'<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">'
                                                                        +'<div class="dropdown-item"  style="width:80px;" title="Advert Daily Budget">'
                                                                        +'<i class="las la-briefcase" style="font-size:24px;"></i>'
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;">'+pkt.budget[i].daily_budget+'</p>'
                                                                        +'</div>'
                                                                    
                                                                        +'<div class="dropdown-item"  style="width:80px;" title="Advert Start Date">'
                                                                        +'<i class="las la-calendar-day" style="font-size:24px;"></i>'
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;">'+pkt.budget[i].start_date+'</p>'
                                                                        +'</div>'
                                                                    
                                                                        +'<div class="dropdown-item"   style="width:80px;" title="Advert End Date">'
                                                                        +'<i class="las la-calendar-check" style="font-size:24px;"></i>'
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;">'+pkt.budget[i].end_date+'</p>'
                                                                        +'</div>'
                                                                    
                                                                        +'<div class="dropdown-item" style="width:80px;" title="Advert Status" >'
                                                                        +'<i class="las la-clock" style="font-size:24px;"></i>'
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;"  id="status_'+pkt.campaign[i].id+'">'+pkt.campaign[i].status+'</p>'
                                                                        +'</div>'
                                                                    +'</div>'
                                                                +'</li>'
                                                            +'</ul>'
                                                        +'</div>'
                                                    +'</div>'
                                                +'</div>'
                                        +'</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>';
                            $('#b-loader').css({"display": "none"});
                        }
                        $('#pending_videos').html(result);
                    }
                    if(pkt.campaign.length==0){

                        if(advert_status == 'ALL'){
                           
                            $('#load-compose').click();
                        }

                        if(advert_status == 'PENDING' || advert_status == 'TERMINATED' ||  advert_status == 'APPROAVED' || advert_status == 'REJECTED'){
                            advert_status = 'ALL';
                            $("#load-home").click();
                            GoodEggs('RECORD NOT FOUND' );
                        }
                        $('#b-loader').css({"display": "none"});
                    }
                }
                if (pkt.status!=200){
                    BadEggs('ERROR');
                }
            },
            statusCode: {
                400: function(data) {
                    
                }
            },
            error: function(err) {
                console.log(err);
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

    $(document).on('mouseover', 'video', function() { 
        $(this).get(0).play(); 
    }); 
    $(document).on('mouseleave', 'video', function() { 
        $(this).get(0).pause(); 
    });

    $("#user-logout").bind('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location = 'http://127.0.0.1/';
    });

    function search(query){
        $.ajax({
            method: "POST",
            url: ip_address+'/api/agency/campaign/query',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'query': query , 'uid':window.sessionStorage.getItem('content'), 'status': advert_status , 'id':window.sessionStorage.getItem('agid')}),
            dataType: "json",
            success: function(pkt) {
                if (pkt.status==200){
                    result = '';
                    if(pkt.campaign.length>0){
                        for (var i = 0; i < pkt.campaign.length; i++){
                            edtstatus    = '';
                            undstatus    = '';
                            chtstatus    = '';
                            status_color = '';
                            border_color = '';
                            if (pkt.campaign[i].status=='PENDING'){
                                edtstatus    = 'block';
                                undstatus    = 'none';
                                chtstatus    = 'none';
                                status_color = '#F7DC6F';
                                border_color = '#F7DC6F';
                            }
                            if (pkt.campaign[i].status=='REJECTED'){
                                edtstatus    = 'none';
                                undstatus    = 'none';
                                chtstatus    = 'none';
                                status_color = '#7B241C';
                                border_color = '#7B241C';
                            }
                            if (pkt.campaign[i].status=='APPROAVED'){
                                edtstatus    = 'none';
                                undstatus    = 'none';
                                chtstatus    = 'block';
                                status_color = '#82E0AA';
                                border_color = '#82E0AA';
                            }
                            if (pkt.campaign[i].status=='TERMINATED'){
                                edtstatus    = 'none';
                                undstatus    = 'block';
                                chtstatus    = 'none';
                                status_color = '#1B4F72';
                                border_color = '#1B4F72';
                            }
                            result +=''
                            +'<div class="col-xl-4 card p-2 border-none" style="height:auto;margin-bottom:5px;">'
                                +'<div class="row">'
                                    +'<div class="col-xl-12">'
                                        +'<video controls muted poster="'+pkt.design[i].poster+'" class="crm-profile-pic rounded avatar-100">'
                                            +'<source src="'+pkt.design[i].source_file+'" type="video/webm">'
                                        +'</video>'
                                    +'</div>'
                                    +'<div class="col-xl-12" style="margin-left:2px;">'
                                        +'<div class="card border-none p-1">'
                                                +'<div class="col-xl-12">'
                                                    +'<div class="row">'
                                                        +'<div class="p-1">'
                                                            +'<div id="'+pkt.location[i].billboard_id+'">'
                                                                +'<p style="text-transform:capitalize;text-overflow: ellipsis;">'+pkt.campaign[i].name+' - '+pkt.campaign[i].category+'</p>'
                                                            +'</div>'
                                                            
                                                            +'<img id="'+pkt.location[i].billboard_name+'" onclick="queryMap(this)" style="border-radius:50%;background-color:'+border_color+';padding:2px;" alt="check" height="40" width="40" src="'+pkt.location[i].billboard_image+'" >'
                                                                +'<path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clip-rule="evenodd" />'
                                                            +'</svg>'
                                                            
                                                            +'<div style="margin-left:55px;margin-top:-40px;">'
                                                                +'<h4 id="'+pkt.location[i].billboard_id+'" style="text-transform:capitalize;overflow: hidden;font-size:15px;">'
                                                                +pkt.location[i].billboard_name+'</h4>'
                                                                +'<h5 style="font-size:12px;margin-top:5px;">'+pkt.campaign[i].magnate+'</h5>'
                                                            +'</div>'
                                                        +'</div>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="col-xl-12">'
                                                    +'<div class="custom-control custom-switch custom-switch-text custom-control-inline">'
                                                        +'<div class="row" style="margin-left: 7.0rem;">'
                                                            +'<div class="row p-1" id="'+pkt.campaign[i].id+'" style="display:'+edtstatus+';">'
                                                                +'<i class="fa fa-check-circle"  data-message="'+pkt.campaign[i].id+':APPROAVED" onclick="YesNo(this)"   style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;"></i>'
                                                                +'<i class="las la-trash" data-message="'+pkt.campaign[i].id+':REJECTED"  onclick="YesNo(this)"   style="font-size:32px;font-weight: bolder;color:'+status_color+';margin-left:auto;cursor:pointer;"></i>'
                                                            +'</div>'
                                                            +'<div class="row p-1"  style="display:'+undstatus+';">'
                                                                +'<i class="las la-undo "  data-message="'+pkt.campaign[i].id+'" onclick="Undo(this)"    style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;"></i>'
                                                            +'</div>'
                                                            +'<ul class="navbar-nav p-2">'
                                                                +'<li class="dropdown">'
                                                                    +'<a href="#"  id="dropdownMenuButton4" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
                                                                        +'<i class="las la-ellipsis-h" style="font-size:32px;color:'+status_color+';"></i>'
                                                                    +'</a>'
                                                                    +'<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">'
                                                                        +'<div class="dropdown-item"  style="width:80px;" title="Advert Daily Budget">'
                                                                        +'<i class="las la-briefcase" style="font-size:24px;"></i>'
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;">'+pkt.budget[i].daily_budget+'</p>'
                                                                        +'</div>'
                                                                    
                                                                        +'<div class="dropdown-item"  style="width:80px;" title="Advert Start Date">'
                                                                        +'<i class="las la-calendar-day" style="font-size:24px;"></i>'
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;">'+pkt.budget[i].start_date+'</p>'
                                                                        +'</div>'
                                                                    
                                                                        +'<div class="dropdown-item"   style="width:80px;" title="Advert End Date">'
                                                                        +'<i class="las la-calendar-check" style="font-size:24px;"></i>'
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;">'+pkt.budget[i].end_date+'</p>'
                                                                        +'</div>'
                                                                    
                                                                        +'<div class="dropdown-item" style="width:80px;" title="Advert Status" >'
                                                                        +'<i class="las la-clock" style="font-size:24px;"></i>'
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;"  id="status_'+pkt.campaign[i].id+'">'+pkt.campaign[i].status+'</p>'
                                                                        +'</div>'
                                                                    +'</div>'
                                                                +'</li>'
                                                            +'</ul>'
                                                        +'</div>'
                                                    +'</div>'
                                                +'</div>'
                                        +'</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>';
                            $('#b-loader').css({"display": "none"});
                        }
                        $('#pending_videos').html(result);
                    }

                    if(pkt.campaign.length==0){

                        if(advert_status == 'ALL'){
                           
                            $('#load-compose').click();
                        }

                        if(advert_status == 'PENDING' || advert_status == 'TERMINATED' ||  advert_status == 'APPROAVED' || advert_status == 'REJECTED'){
                            advert_status = 'ALL';
                            $("#load-home").click();
                            GoodEggs('RECORD NOT FOUND' );
                        }
                        $('#b-loader').css({"display": "none"});
                    }
                }
            
                if (pkt.status!=200){
                    BadEggs('ERROR');
                    $('#search-lde').css({"display": "none"});
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
    }

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

function YesNo (metrics){

    var id           = $(metrics).attr("data-message").split(':')[0];
    var switchStatus = $(metrics).attr("data-message").split(':')[1];
    
    if(switchStatus != ''){
        $('#b-loader').css({"display": "block"});
        $.ajax({
            method: "POST",
            url: ip_address+'/api/advert/create',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'campaign_id':id,'status':switchStatus}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(data) {
                console.log(data);
                if (data.status==200){

                    $('#msg-body').html('SUCCESS');
                    $('#msg-status').click();
                    $('#'+id+'').css({"display": "none"});
                    $('#b-loader').css({"display": "none"});

                    if(switchStatus=='REJECTED'){
                        $('#status_'+id+'').html("REJECTED");
                    }
                    if(switchStatus=='APPROAVED'){
                        $('#status_'+id+'').html("APPROVED");
                    }
                    
                }
                if (data.status!=200){
                    $('#msg-body-error').html('ERROR');
                    $('#msg-status-error').click();
                    $('#b-loader').css({"display": "none"});
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
    }
}

function Undo(metrics) {
    $('#b-loader').css({"display": "block"});
    $.ajax({
        method: "POST",
        url: ip_address+'/api/campaign/delete',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'campaign_id':$(metrics).attr("data-message"),'status':'PENDING'}),
        dataType: "json",
        cache: false,
        processData: false,
        success: function(data) {
            if (data.status==200){
                $('#b-loader').css({"display": "none"});
                $("#load-ongoing").click();
                $('#msg-body').html('SUCCESS');
                $('#msg-status').click();
            }
            if (data.status!=200){
                $('#msg-body-error').html('ERROR');
                $('#msg-status-error').click();
                $('#b-loader').css({"display": "none"});
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
}
