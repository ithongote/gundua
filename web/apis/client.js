function BadEggs(message_status){
    $('#msg-body-error').html(message_status);
    $('#msg-status-error').click();
}

function GoodEggs(message_status){
    $('#msg-body').html(message_status);
    $('#msg-status').click();
}

$(document).ready(function() {
    popup             = '';
    result            = '';
    adverts           = '';
    selected_category = '';
    advert_status     = 'ALL';
    ip_address        = 'http://127.0.0.1:5008';
    var uid           = window.sessionStorage.getItem('content');

    if(uid == null){
        window.location = 'http://127.0.0.1';
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
                }
                $("#load-home").click();
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
        //$('#nav-bar-close').click();
        $('#load_all').click();
    });

    $("#load-compose").bind('click', function(e) {
        e.preventDefault();
        $('#nav-bar-close').click();
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
            url: ip_address+'/api/campaign/status',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content'),'status':advert_status}),
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
                                edtstatus    = 'block';
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
                                        +'<video controls muted poster="'+pkt.design[i].poster+'">'
                                            +'<source src="'+pkt.design[i].source_file+'" type="video/webm">'
                                        +'</video>'
                                    +'</div>'
                                    +'<div class="col-xl-12" style="margin-left:2px;">'
                                        +'<div class="card border-none p-1">'
                                                +'<div class="col-xl-12">'
                                                    +'<div class="row">'
                                                        +'<div class="p-1">'
                                                            +'<div id="'+pkt.location[i].billboard_id+'">'
                                                                +'<p style="inline-size: 330px;font-weight:bold;">'+pkt.campaign[i].name+' - '+pkt.campaign[i].category+'</p>'
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
                                                            +'<div class="row p-1" style="display:'+edtstatus+';">'
                                                                +'<i class="las la-edit "  data-message="'+pkt.campaign[i].id+'"            onclick="Edit(this)"   style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;"></i>'
                                                                +'<i class="las la-trash"  data-message="'+pkt.campaign[i].id+':TERMINATED" onclick="Trash(this)"  style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;margin-left:auto;"></i>'
                                                            +'</div>'
                                                            +'<div class="row p-1" style="display:'+undstatus+';">'
                                                                +'<i class="las la-undo "  data-message="'+pkt.campaign[i].id+':PENDING"     onclick="Trash(this)"    style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;" title="Restore From Trash"></i>'
                                                                +'<i class="las la-trash"  data-message="'+pkt.campaign[i].id+':DELETED"     onclick="Trash(this)"    style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;" title="Delete  Forever"></i>'
                                                            +'</div>'
                                                            +'<div class="row p-1" style="display:'+chtstatus+';">'
                                                                +'<i class="las la-edit"  data-message="'+pkt.campaign[i].id+'"     onclick="Draw(this)"    style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;" title="View Advert Schedules"></i>'
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
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;">'+pkt.campaign[i].status+'</p>'
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
                        $('#advert').html(result);
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
                    $('#b-loader').css({"display": "none"});
                }
            },
            statusCode: {
                400: function(data) {
                    $('#b-loader').css({"display": "none"});
                }
            },
            error: function(err) {
                console.log(err);
            }
        });
    });

    $("#load-ongoing").bind('click', function(e) {
        e.preventDefault();
        $('#nav-bar-close').click();
        $.ajax({
            method: "POST",
            url: ip_address+'/api/campaign/status/ongoing',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'uid':window.sessionStorage.getItem('content')}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(data) {
                if (data.status==200){
                    if(data.advert.length>0){
                        poster     = '';
                        adverts    = '';
                        for(i in data.advert){
                            if (data.advert[i].poster.length ==1){
                                data.advert[i].poster     ='http://127.0.0.1/images/novideo.png';
                            }
                           adverts += ''
                            +'<div class="col-xl-4 card p-2 border-none" style="height:auto;margin-bottom:5px;">'
                                +'<div class="row">'
                                    +'<div class="col-xl-12">'
                                        +'<video controls muted poster="'+data.advert[i].poster+'" class="crm-profile-pic rounded avatar-100">'
                                            +'<source src="'+data.advert[i].source_file+'" type="video/webm">'
                                        +'</video>'
                                    +'</div>'
                                    +'<div class="col-xl-12"  style="margin-left:2px;" >'
                                        +'<div class="p-1">'
                                            +'<div class="row" >'
                                                +'<div class="p-1">'
                                                    +'<div style="margin-top:1px;">'
                                                        +'<p style="text-transform:capitalize;">'+data.advert[i].name+' - '+data.advert[i].category+'</p>'
                                                        +'<h5 style="font-size:15px;margin-top:5px;">'+data.advert[i].start_date+' - '+data.advert[i].end_date+'</h5>'
                                                    +'</div>'
                                                +'</div>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>'
                                    +'<div class="col-xl-12">'
                                            +'<div class="custom-control custom-switch custom-switch-text custom-control-inline" style="margin-left: auto;">'
                                                +'<div class="row"  style="margin-left: 7.0rem;">'
                                                    +'<i class="las la-edit  "  data-message="'+data.advert[i].id+'" onclick="Edit(this)"         style="font-size:32px;font-weight: bolder;color:white;cursor:pointer;"></i>'
                                                    +'<i class="las la-trash "  data-message="'+data.advert[i].id+':TRASH" onclick="Trash(this)"  style="font-size:32px;font-weight: bolder;color:white;margin-left:auto;cursor:pointer;"></i>'
                                                +'</div>'
                                            +'</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>';
                        }
                        document.getElementById('b-loader').style.display = 'none';
                        $('#ongoing_videos').html(adverts);
                    }

                    if(data.advert.length==0){
                        GoodEggs('DRAFT RECORD NOT FOUND');
                        $("#load-home").click();
                        document.getElementById('b-loader').style.display = 'none';
                    }
                   
                }
                if (data.status!=200){
                    
                    document.getElementById('b-loader').style.display = 'none';
                }
            },
            statusCode: {
                400: function(data) {
                    document.getElementById('b-loader').style.display = 'none';
                }
            },
            error: function(err) {
                console.log(err);
            }
        });
    
    });

    $('#campaign_category').change(function(){
        selected_category = $('select[name=campaign_category] option').filter(':selected').val();       
    });

    $("#create_campaign").bind('submit', function(e) {
        e.preventDefault();
        $('#campaign-lde').css({"display": "block"});
        if( selected_category != ''){
            var name                   = $('#campaign_name').val();
            var category               = $('select[name=campaign_category] option').filter(':selected').val();
            $.ajax({
                method: "POST",
                url: ip_address+'/api/campaign/create',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({'name': name, 'category':category,'id':uid}),
                dataType: "json",
                cache: false,
                processData: false,
                success: function(data) {
                    if (data.status==200){
                        
                        if($(document.activeElement).attr('id')=='campaign_continue'){
                            $('#campaign_name').val('');
                            window.sessionStorage.setItem('cid', data.id);
                            window.location = data.uri;
                        }
                        if($(document.activeElement).attr('id')=='campaign_save_and_close'){
                            $('#campaign_name').val('');
                            $('#msg-body').html('SUCCESS');
                            $('#msg-status').click();
                            $('#load-home').click();
                            
                        }

                        selected_category == '';
                        $('#campaign-lde').css({"display": "none"});
                    }
                    if (data.status!=200){
                        selected_category == '';
                        $('#campaign-lde').css({"display": "none"});
                    }
                },
                statusCode: {
                    400: function(data) {
                        selected_category == '';
                        $('#campaign-lde').css({"display": "none"});
                    }
                },
                error: function(err) {
                    $('#campaign-lde').css({"display": "none"});
                }
            });
        }

        if( selected_category == ''){
            $('#msg-body-error').html('CATEGORY NOT SELECTED');
            $('#msg-status-error').click();
        }

    });

    $("#delete_campaign").bind('click', function(e) {
        e.preventDefault();
        document.getElementById('b-loader').style.display = 'block';
        $.ajax({
            method: "POST",
            url: ip_address+'/api/campaign/delete',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'campaign_id':window.sessionStorage.getItem('cid'),'status':'TERMINATED'}),
            dataType: "json",
            cache: false,
            processData: false,
            success: function(data) {
                if (data.status==200){
                    console.log(data);
                    document.getElementById('b-loader').style.display = 'none';
                    $("#load-rejected").click();
                    $('#msg-body').html('SUCCESS');
                    $('#msg-status').click();
                }
                if (data.status!=200){
                    
                    document.getElementById('b-loader').style.display = 'none';
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

    $(document).on('mouseover', 'video', function() { 
        $(this).get(0).play(); 
    }); 
    $(document).on('mouseleave', 'video', function() { 
        $(this).get(0).pause(); 
    });

    $("#search-bx").on('keypress',function(e) {

        if(e.which == 13) {
            var query =  $(this).val();

            if(query != ''){
                $('#b-loader').css({"display": "block"});
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
            $('#b-loader').css({"display": "block"});
            search(query);
        }

        if(query == ''){
            BadEggs('ENTER QUERY');
        }
        
    });

    $("#user-logout").bind('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location = 'http://127.0.0.1';
    });

    function search(query){
        $.ajax({
            method: "POST",
            url: ip_address+'/api/campaign/client/query',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({'query': query ,'uid':window.sessionStorage.getItem('content'), 'status': advert_status , 'id':window.sessionStorage.getItem('agid')}),
            dataType: "json",
            success: function(pkt) {
                if (pkt.status==200){
                    result = '';
                    if(pkt.campaign.length>0){
                        for (var i = 0; i < pkt.campaign.length; i++){
                            edtstatus    = '';
                            undstatus    = '';
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
                                edtstatus    = 'block';
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
                            +'<div class="col-xl-4 card p-2  border-none" style="margin-bottom:5px;height:auto;">'
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
                                                            +'<div class="row p-1" style="display:'+edtstatus+';">'
                                                                +'<i class="las la-edit "  data-message="'+pkt.campaign[i].id+'"            onclick="Edit(this)"   style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;"></i>'
                                                                +'<i class="las la-trash"  data-message="'+pkt.campaign[i].id+':TERMINATED" onclick="Trash(this)"  style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;margin-left:auto;"></i>'
                                                            +'</div>'
                                                            +'<div class="row p-1" style="display:'+undstatus+';">'
                                                                +'<i class="las la-undo "  data-message="'+pkt.campaign[i].id+':PENDING"     onclick="Trash(this)"    style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;" title="Restore From Trash"></i>'
                                                                +'<i class="las la-trash"  data-message="'+pkt.campaign[i].id+':DELETED"     onclick="Trash(this)"    style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;" title="Delete  Forever"></i>'
                                                            +'</div>'
                                                            +'<div class="row p-1" style="display:'+chtstatus+';">'
                                                                +'<i class="las la-edit"  data-message="'+pkt.campaign[i].id+'"     onclick="Draw(this)"    style="font-size:32px;font-weight: bolder;color:'+status_color+';cursor:pointer;" title="View Advert Schedules"></i>'
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
                                                                        +'<p style="font-size:12px;margin-top:-25px;color:green;margin-left:30px;">'+pkt.campaign[i].status+'</p>'
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
                        $('#advert').html(result);
                        
                    }

                    if(pkt.campaign.length==0){

                        if(advert_status == 'PENDING'){
                            GoodEggs( advert_status + ' RECORD NOT FOUND');
                        }

                        if(advert_status == 'TERMINATED' ||  advert_status == 'APPROAVED' || advert_status == 'REJECTED'){
                            advert_status = 'PENDING';
                            $("#load-home").click();
                            GoodEggs(_advert_status + ' RECORD NOT FOUND' );
                        }
                        $('#b-loader').css({"display": "none"});
                    }
                }
            
                if (pkt.status!=200){
                    BadEggs('ERROR');
                    $('#b-loader').css({"display": "none"});
                    $('#campaign-lde').css({"display": "none"});
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

function Edit(metrics) {
    window.sessionStorage.setItem('cid',$(metrics).attr("data-message"));
    window.location = "http://127.0.0.1/tangazo/client/campaigns/new/";
}

function Trash(metrics) {
    $('#b-loader').css({"display": "block"});
    evnstatus =$(metrics).attr("data-message").split(':')[1];
    $.ajax({
        method: "POST",
        url: ip_address+'/api/campaign/delete',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'campaign_id':$(metrics).attr("data-message").split(':')[0],'status':evnstatus}),
        dataType: "json",
        cache: false,
        processData: false,
        success: function(data) {
            if (data.status==200){

                if (evnstatus == 'PENDING'){
                    $("#load_pending").click();
                    GoodEggs('ITEM RESTORED FROM TRASH');
                }

                if (evnstatus == 'DELETED'){
                    $("#load_terminated").click();
                    GoodEggs('ITEM DELETED FOREVER');
                }

                if (evnstatus == 'TERMINATED'){
                    $("#load_terminated").click();
                    GoodEggs('ITEM MOVED TO TRASH');
                }

                if (evnstatus == 'TRASH'){
                    $("#load-ongoing").click();
                    GoodEggs('DRAFT DELETED FOREVER');
                }

                $('#b-loader').css({"display": "none"});
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
}

function Draw(metrics) {
    label = [];
    $('#b-loader').css({"display": "block"});
    $.ajax({
        method: "POST",
        url: ip_address+'/api/campaign/advert/plot',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'id':$(metrics).attr("data-message")}),
        dataType: "json",
        cache: false,
        processData: false,
        success: function(data) {
            if (data.status==200){
                result = '';
                for(var i = 0; i < data.cord.length; i++){
                    result +=''
                        +'<tr>'
                            +'<td>' +data.cord[i].st +'</td>'
                            +'<td>' +data.cord[i].ed +'</td>'
                            +'<td>' +data.cord[i].vl +'</td>'
                            +'<td>' +data.cord[i].vf +'</td>'
                            +'<td>' +data.cord[i].al +'</td>'
                            +'<td>' +data.cord[i].ac +'</td>'
                            +'<td>' +data.cord[i].as +'</td>'
                            +'<td>' +data.cord[i].ab +'</td>'
                        +'</tr>';
                }

                if(data.cord.length > 0){
                    $('#stats').empty();
                    $('#stats').html(result);
                    $('#load-chart').click();
                }
            
                $('#b-loader').css({"display": "none"});
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
}
