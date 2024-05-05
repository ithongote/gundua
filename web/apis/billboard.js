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

$("#dimension_width_height").change(function(){
    $("#dimension_width").html( $(this).find(':selected').text().split('x')[0]);
    $("#dimension_height").html( $(this).find(':selected').text().split('x')[1]);
});

$("#capacity").change(function(){
    $("#dimension_width").attr("placeholder", $(this).find(':selected').text().split('x')[0]);
    $("#dimension_height").attr("placeholder", $(this).find(':selected').text().split('x')[1]);
});

$(document).ready(function() {
    ip_address = 'http://127.0.0.1:5008';
    var uid = window.localStorage.getItem('content');
    
    $.ajax({
        method: "POST",
        url: ip_address+'/api/profile/query',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({'query': uid , 'limit': '1'}),
        dataType: "json",
        success: function(data) {
            if (data.status==200){
                if(data.msg[0].user_id == uid){
                    $('#admin-email').html(data.msg[0].user_email);
                    $('#admin-profile-image').attr({src: data.msg[0].user_image});
                    $('#admin-creation-date').html(data.msg[0].user_registration_date);
                    $('#admin-usernames').html(data.msg[0].first_name + " " + data.msg[0].last_name);
                    agency();
                }
            }
            if (data.status!=200){
                var n = '';
                n +='<div   class="icon iq-icon-box-2 edit-button bg-white  rounded" style="margin:20px;">'
                +'<i class="las la-exclamation-triangle" style="font-size:64px;color:red;font-weight:bold;"></i>'
                +'<p style="font-size:12px;color:red;font-weight:bold;width:200px;margin-left:-75px;">Error</p>'
                +'</div>';
                $("#status_success").attr("data-message", n);
                $('#status_success').click();
            }
        },
        statusCode: {
            400: function(data) {
                var n = '';
                n +='<div   class="icon iq-icon-box-2 edit-button bg-white  rounded" style="margin:20px;">'
                +'<i class="las la-exclamation-triangle" style="font-size:64px;color:red;font-weight:bold;"></i>'
                +'<p style="font-size:12px;color:red;font-weight:bold;width:200px;margin-left:-75px;">Error</p>'
                +'</div>';
                $("#status_success").attr("data-message", n);
                $('#status_success').click();
            }
        },
        error: function(err) {
            console.log(err);
        }
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
                    var inputElement = '<select id="design-dropdown" name="design-dropdown" class="form-control"  data-style="py-0">';  
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
                    
                    document.getElementById('b-loader').style.display = 'none';
                }
                if (data.status!=200){
                    var n = '';
                    n +='<div   class="icon iq-icon-box-2 edit-button bg-white  rounded" style="margin:20px;">'
                    +'<i class="las la-exclamation-triangle" style="font-size:64px;color:red;font-weight:bold;"></i>'
                    +'<p style="font-size:12px;color:red;font-weight:bold;width:200px;margin-left:-75px;">Error</p>'
                    +'</div>';
                    $("#status_success").attr("data-message", n);
                    $('#status_success').click();
                    document.getElementById('b-loader').style.display = 'none';
                }
            },
            statusCode: {
                400: function(data) {
                    var n = '';
                    n +='<div   class="icon iq-icon-box-2 edit-button bg-white  rounded" style="margin:20px;">'
                    +'<i class="las la-exclamation-triangle" style="font-size:64px;color:red;font-weight:bold;"></i>'
                    +'<p style="font-size:12px;color:red;font-weight:bold;width:200px;margin-left:-75px;">Error</p>'
                    +'</div>';
                    $("#status_success").attr("data-message", n);
                    $('#status_success').click();
                }
            },
            error: function(err) {
                console.log(err);
            }
        });
    }

    $("#load-billboards").bind('click', function(e) {
        e.preventDefault();
        agency();
    });

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

        reader.readAsDataURL(input_file);

        $(reader).on('load', function(e){
            data_line = e.target.result
            const base64String = data_line
                .replace('data:', '')
                .replace(/^.+,/, '');
            document.getElementById('b-loader').style.display = 'block';
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
                        document.getElementById('b-loader').style.display = 'none';
                        window.location = data.uri;
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
        });
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
    
            document.getElementById('g-loader').style.display = 'block';
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
                        $('#create-agency')[0].reset();
                        document.getElementById('g-loader').style.display = 'none';
                    }
                    if (data.status!=200){
                        var n = '';
                        n +='<div   class="icon iq-icon-box-2 edit-button bg-white  rounded" style="margin:20px;">'
                        +'<i class="las la-exclamation-triangle" style="font-size:64px;color:red;font-weight:bold;"></i>'
                        +'<p style="font-size:12px;color:red;font-weight:bold;width:200px;margin-left:-75px;">Error</p>'
                        +'</div>';
                        $("#status_success").attr("data-message", n);
                        $('#status_success').click();
                        //$('#create-agency')[0].reset();
                        document.getElementById('g-loader').style.display = 'none';
                    }
                },
                statusCode: {
                    400: function(data) {
                        var n = '';
                        n +='<div   class="icon iq-icon-box-2 edit-button bg-white  rounded" style="margin:20px;">'
                        +'<i class="las la-exclamation-triangle" style="font-size:64px;color:red;font-weight:bold;"></i>'
                        +'<p style="font-size:12px;color:red;font-weight:bold;width:200px;margin-left:-75px;">Error</p>'
                        +'</div>';
                        $("#status_success").attr("data-message", n);
                        $('#status_success').click();
                    }
                },
                error: function(err) {
                    console.log(err);
                }
            });
    });
});     
