$(function() {
    var apikey = RAA.getApiKey();
    if(apikey.length > 0) {
        $('#show_key').html(apikey.substr(0,4)+'****-****-****-****-********'+apikey.substr(-4));
    }else{
        $('#show_key').html('none');
    }
});

$('#btnSetKey').click(function(){
    if($('#txtKey').val().length == 36 || $('#txtKey').val().length == 0) {
        if($('#txtKey').val().length == 0) {
            $('#err_wrapper').html('API Key Cleared');
            $('#err_wrapper').slideDown(250);
        }else{
            $('#err_wrapper').slideUp(250);
        }
        var apikey = $('#txtKey').val();
        RAA.setApiKey(apikey);
        if(RAA.getApiKey().length > 0) {
            $('#show_key').html(RAA.getApiKey().substr(0,4)+'****-****-****-****-********'+RAA.getApiKey().substr(-4));
        }else{
            $('#show_key').html('none');
        }
  }else{
    $('#err_wrapper').html('Invalid Key');
	$('#err_wrapper').slideDown(250);
  }
  
  $('#txtKey').val('');
});

var RAA = {
    getApiKey: function() {
        return localStorage.RAAapikey ? localStorage.RAAapikey : '';
    },
    setApiKey: function(apikey) {
        chrome.runtime.sendMessage({requestType: 'setApiKey', data: apikey});
    }
}