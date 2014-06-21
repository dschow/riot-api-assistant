var riotAPI = {'key': ''};

chrome.storage.local.get('apikey', function(items) {
  try {
    if(typeof items['apikey'] !== 'undefined' && items['apikey'].length > 0) {
	  riotAPI.key = items['apikey'];
	  chrome.browserAction.setBadgeText({
        text: ''
      });
    }else{
	  riotAPI.key = '';
      chrome.browserAction.setBadgeText({
        text: '!'
      });
	}
  }catch(e) {
    riotAPI.key = '';
    chrome.browserAction.setBadgeText({
      text: '!'
    });
  }
});

chrome.storage.onChanged.addListener(function(items, namespace) {
    for(key in items) {
        if(key == 'apikey') {
            try {
                if(typeof items['apikey'].newValue !== 'undefined' && items['apikey'].newValue.length > 0) {
                    riotAPI.key = items['apikey'].newValue;
                    chrome.browserAction.setBadgeText({
                        text: ''
                    });
                }else{
                    riotAPI.key = '';
                    chrome.browserAction.setBadgeText({
                        text: '!'
                    });
                }
            }catch(e) {
                riotAPI.key = '';
                chrome.browserAction.setBadgeText({
                    text: '!'
                });
            }
        }
    }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if(details.url.indexOf('api_key=')) {
      var url = details.url.split('api_key=');
	  if(url.length > 1) {
        if(url[1].length != 36) {
  	      try {
            if(riotAPI.key.length > 0) {
	          return { redirectUrl: url[0] + 'api_key=' + riotAPI.key };
            }
          }catch(e) { }
	    }
	  }else{
	    try {
          if(riotAPI.key.length > 0) {
	        return { redirectUrl: url[0] + 'api_key=' + riotAPI.key };
          }
        }catch(e) { }
	  }
	}
  },
  {urls: ["*://*.api.pvp.net/*"]},
  ["blocking"]
);