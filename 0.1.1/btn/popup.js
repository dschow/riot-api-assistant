$(function() {  
  chrome.storage.local.get('apikey', function(items) {
    try {
      if(typeof items['apikey'] !== 'undefined' && items['apikey'].length > 0) {
	    $('#show_key').html(items['apikey'].substr(0,4)+'****-****-****-****-********'+items['apikey'].substr(-4));
      }else{
        $('#show_key').html('none');
	  }
    }catch(e) {
      $('#show_key').html('none');
    }
  });
});

$('#btnSetKey').click(function(){
  if($('#txtKey').val().length == 36 || $('#txtKey').val().length == 0) {
    if($('#txtKey').val().length == 0) {
	  $('#err_wrapper').html('API Key Cleared');
	  $('#err_wrapper').slideDown(250);
	}else{
	  $('#err_wrapper').slideUp(250);
	}
    chrome.storage.local.set({'apikey': $('#txtKey').val()});
    chrome.storage.local.get('apikey', function(items) {
      try {
        if(typeof items['apikey'] !== 'undefined' && items['apikey'].length > 0) {
	      $('#show_key').html(items['apikey'].substr(0,4)+'****-****-****-****-********'+items['apikey'].substr(-4));
        }else{
  	      $('#show_key').html('none');
	    }
      }catch(e) {
        $('#show_key').html('none');
	  }
    });
  }else{
    $('#err_wrapper').html('Invalid Key');
	$('#err_wrapper').slideDown(250);
  }
  
  $('#txtKey').val('');
});