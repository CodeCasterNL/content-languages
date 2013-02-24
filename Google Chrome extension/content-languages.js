// Copyright 2013 CodeCaster

TabData = function(tabId) {
    this.tabId = tabId;
    
	// contains all response headers for all resources on the current page. Gets reset when navigating away.
	this.headers = [];
	this.preferredLanguage = '';
    this.pushHeader = function(header) {
		//console.log('TabData.pushHeader(): adding ' + header.name + ' header');
		this.headers.push(header);
    };
	this.updateIcon = function() {
		console.log('TabData.updateIcon(), tabId: ' + this.tabId + ': header count: ' + this.headers.length);		
		
		// color the icon if any language-headers were found
		chrome.browserAction.setIcon({path: '/images/langiconclassic_r9_c19' + (this.headers.length > 0 ? '' : '_disabled') + '.png'});	
	};
};

tabData = [];
activeTabId = null;

function getTabData(tabId) {
	if (!tabData[tabId]) {
        tabData[tabId] = new TabData(tabId);
    }
	return tabData[tabId];
}

function setLanguageAndReload(language) {
	if (!language) {
		language = '';
	}
	getTabData(activeTabId).preferredLanguage = language;
	chrome.tabs.reload();
}

function getLanguagesForCurrentTab() {
	console.log('getLanguagesForCurrentTab(), tabId: ' + activeTabId);

	var tabData = getTabData(activeTabId);
	var result = [];
	
	console.log('getLanguagesForCurrentTab(), header count: ' + tabData.headers.length);
	
	for (var i = 0; i < tabData.headers.length; i++) {
		if (tabData.headers[i].name.toLowerCase() == 'content-languages') {
			
			// TODO: copy parseAcceptParams from php in shared .js file with other httpUtilities (or find better (3rd party) alternative)
			var languages = tabData.headers[i].value.split(',');
			result = addLanguageToArray(result, languages);
		}
	}
	return result;
}

function getPreferredLanguageForCurrentTab() {
	console.log('getPreferredLanguageForCurrentTab(), tabId: ' + activeTabId);
	var result = getTabData(activeTabId).preferredLanguage;
	console.log('result: ' + result);
	return result;
}

function getLanguageForCurrentTab() {
	console.log('getLanguageForCurrentTab(), tabId: ' + activeTabId);
	
	var tabData = getTabData(activeTabId);
	
	// TODO: a tab can contain resources with different languages, now we return the first we find. 
	// Maybe get the tab's URL and only show the language (if any) for the requested document, path, domain, tld or most common one (in that order)?
	// Then we need to store the URL with the 
	
	for (var i = 0; i < tabData.headers.length; i++) {
		if (tabData.headers[i].name.toLowerCase() == 'content-language') {
			console.log('getLanguageForCurrentTab(): ' + tabData.headers[i].value);
			return tabData.headers[i].value
		}
	}
	
	// TODO: search html (meta) language tags to activate on more pages?
	return;
}

function addLanguageToArray(result, languages) {
	for (var i = 0; i < languages.length; i++) {
		if ($.inArray(languages[i], result) == -1) {
			// TODO: split language into primary-tag, subtag and qvalue?
			result = result.concat(languages[i]);
		}
	}
	
	return result;
}

function modifyAcceptLanguageIfRequired(tabId, requestHeader) {
	console.log('modifyAcceptLanguageIfRequired(): language request from tabId ' + tabId + ': ' + requestHeader.name + ': ' + requestHeader.value);
		
	var preferredLanguage = getTabData(tabId).preferredLanguage;
	
	if (preferredLanguage != '') {
		console.log('modifyAcceptLanguageIfRequired(): setting "' + requestHeader.name + '" to "' + preferredLanguage + '"');
		requestHeader.value = preferredLanguage;
	}
	
	return requestHeader;
}

function updateIcon(tabId) {
	console.log('updateIcon(), tabId: ' + tabId + ', activeTabId: ' + activeTabId);
    if (tabId === activeTabId) {
        getTabData(tabId).updateIcon();
    }
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
	console.log('tabs.onActivated(), tabId: ' + activeInfo.tabId);
	activeTabId = activeInfo.tabId;
	updateIcon(activeInfo.tabId);
});

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
	console.log('webNavigation.onBeforeNavigate(): clearing header cache for tabId: ' + details.tabId);
	// navigating away, clear header cache
	getTabData(details.tabId).headers = [];
	updateIcon(details.tabId);
});

/*
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log('tabs.onUpdated(), tabId: ' + tabId + ', changeInfo: ' + changeInfo.status + ', tab: ' + tab);
	if (changeInfo.status == "loading") {
		// navigating away, clear header cache
		getTabData(tabId).headers = [];
	}

	updateIcon(tabId);
});
*/

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    for (var i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name.toLowerCase() === 'accept-language') {
		details.requestHeaders[i] = modifyAcceptLanguageIfRequired(details.tabId, details.requestHeaders[i]);
      }
    }
    return {requestHeaders: details.requestHeaders};
  },
  { urls: ["http://*/*", "https://*/*"] },
  ["blocking", "requestHeaders"]);

chrome.webRequest.onCompleted.addListener(function(details) {
	for (var i = 0; i < details.responseHeaders.length; ++i) {
	  var headerName = details.responseHeaders[i].name.toLowerCase();
	  if (headerName === 'content-language' || headerName === 'content-languages') {
        console.log('webRequest.onCompleted(): language response on tabId ' + details.tabId + ': ' + details.responseHeaders[i].name + ': ' + details.responseHeaders[i].value);
        getTabData(details.tabId).pushHeader(details.responseHeaders[i]);
		updateIcon(details.tabId);
      }
	}
    return {responseHeaders: details.responseHeaders};
  },
  { urls: ["http://*/*", "https://*/*"] },
  ["responseHeaders"]);
