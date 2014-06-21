chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
		switch (request.requestType) {
            case 'setApiKey':
                RAA.setApiKey(request.data);
                RAA.setBadge(request.data);
                break;
            case 'getTopics':
                var topics = localStorage.RAAtopics ? localStorage.RAAtopics : '{}';
				sendResponse({data: topics});
				break;
            case 'setTopics':
				localStorage.RAAtopics = request.data;
				break;
			default:
				sendResponse({status: "unrecognized request type"});
				break;
        }
    }
);

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if(details.url.indexOf('api_key=')) {
            var url = details.url.split('api_key=');
            if(url.length > 1) {
                if(url[1].length != 36) {
                    var apikey = RAA.getApiKey();
                    if(apikey.length > 0) {
                        return { redirectUrl: url[0] + 'api_key=' + apikey };
                    }
                }
            }
        }
    },
    {urls: ["*://*.api.pvp.net/*"]},
    ["blocking"]
);

var RAA = {
    getApiKey: function() {
        return (localStorage.RAAapikey ? localStorage.RAAapikey : '');
    },
    setApiKey: function(apikey) {
        localStorage.RAAapikey = apikey;
    },
    setBadge: function(apikey) {
        if(apikey.length > 0) {
            chrome.browserAction.setBadgeText({
                text: ''
            });
        }else{
            chrome.browserAction.setBadgeText({
                text: '!'
            });
        }
    }
}

RAA.setBadge(RAA.getApiKey());