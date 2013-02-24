// Copyright 2013 CodeCaster

console.log('popup.js');
var contentLanguages = chrome.extension.getBackgroundPage();

var languageClick = function(e) {
	var target = $(e.target);		
	if(!target.is("a")) {
		return;
	}

	var language = $(target).attr('data-lang');
	contentLanguages.setLanguageAndReload(language);
	window.close();
};

function buildPopup() {
	showCurrentLanguage();
	showAvailableLanguages();
	showPreferredLanguages();
	
	$('a').click(languageClick);
}

function showCurrentLanguage() {
	var lang = contentLanguages.getLanguageForCurrentTab();
	if (lang) {
		lang = 'This page seems to be written in ' + formatLanguage(lang) + '.';		
	} else {
		lang = 'This page did not supply language information.';
	}
	$('#current-language').html(lang);
}

function showAvailableLanguages() {
	var pageLanguagesLi = $('#page-languages');	
	var languages = contentLanguages.getLanguagesForCurrentTab();
	if (languages.length == 0) {
		$('#page-languages').hide();
		$('#also-available').hide();		
	}
	else {
		for (var i = 0; i < languages.length; i++) {
			addLanguage(pageLanguagesLi, languages[i], true, isLanguageOnCurrentTab(languages[i]));			
		}
		console.log('#page-languages.visibility: ' + $('#page-languages').visibility);
		$('#page-languages').show();
		$('#also-available').show();		
	}
}

function showPreferredLanguages() {
	
	var languages = getPreferredLanguages();
	
	for (var l = 0; l < languages.length; l++) {
		addPreferredLanguage(languages[l]);
	}
}

function getPreferredLanguages() {
	// TODO: create preferences screen
	return ['en', 'de', 'fr', 'el', '']; // '' = (Default)
}

function addPreferredLanguage(language) {
	addLanguage($('#preferred-languages'), language, false, isLanguagePreferred(language));
}

function isLanguagePreferred(language) {
	var preferredLanguage = contentLanguages.getPreferredLanguageForCurrentTab();
	
	// '' = (Default)
	if (!language && !preferredLanguage) {
		return true;
	}
	
	console.log('isLanguagePreferred(), preferredLanguage: "' + parseAcceptValue(preferredLanguage).value + '", language:"' + parseAcceptValue(language).value + '"');
	return languagesEqual(parseAcceptValue(preferredLanguage), parseAcceptValue(language));
}

function addLanguage(ul, language, showQuality, isLanguageCurrent) {
	console.log('Appending language: "' + language + '", current:' + isLanguageCurrent);
	
	// TODO: refactor
	var languageFormatted = language ? 
								formatLanguage(language, showQuality) 
								: 
								false;

	var dataTag = language ? 
								// language only, no qvalue (yet)
								parseAcceptValue(language).value 
								: 
								'';
	var displayText = languageFormatted ? 
								languageFormatted 
								: 
								'(Default)';

	// TODO: escape language, otherwise server can inject js/html?
	var button = '<li><a href="#" data-lang="' + dataTag + '"'
						  + ' title="' + (languageFormatted ?
											'Request with &quot;' + formatLanguage(language, false)  + '&quot; as preferred language.'
											: 
											'Reset to default.'
										) 
						  + '"'
						  + (isLanguageCurrent ? ' class="current"' : '')
				+ '>'
				+ displayText
				+ '</a></li>';
	
	console.log(button);
	ul.append(button);
}

function isLanguageOnCurrentTab(language) {
	var currentLanguage = contentLanguages.getLanguageForCurrentTab();

	console.log('isLanguageOnCurrentTab, language: "' + language  + '", currentLanguage: "' + currentLanguage + '"');
	
	currentLanguage = currentLanguage ? 
						parseAcceptValue(currentLanguage)
						: 
						false;
	language = language ? 
						parseAcceptValue(language) 
						: 
						false;
					
	return languagesEqual(language, currentLanguage);
}

function languagesEqual(language1, language2) {
	if (!language1
	 || !language1.value 
	 || !language2 
	 || !language2.value
	) {
		return false;
	}
	
	// TODO: http://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
	return (calculateLanguageMatch(language1, language2) >= 1);
}

function calculateLanguageMatch(language1, language2) {
	var primaryMatch = language1.value.split('-')[0].toLowerCase() 
					== language2.value.split('-')[0].toLowerCase();
	
	// TODO: calculate score of match by languageN.qValue (0.000-1.000) and take subtag into account, en-US != en-GB
	return (primaryMatch ? 1 : 0);
}

function formatLanguage(language, showQuality) {
	
	var param = parseAcceptValue(language);
	var primary = param.value.split('-')[0];
	var lang = isoLangs[primary];	
	
	if (!lang) {
		// TODO: can we do anything with it?
		return '';
	}
	
	return lang.name + ' (' + lang.nativeName + ')' 
			+ (showQuality ? 
				', quality: ' + param.qualityAsPercentage() + '%' 
				:
				''
			);
}

AcceptParam = function(value, qValue) {
	this.value = value;
	this.qValue = qValue;
	
	this.qualityAsPercentage = function() {
		return Math.round(this.qValue * 100);
	};
};

function parseAcceptValue(acceptValue)
{
	// remove all whitespace
	acceptValue = acceptValue.replace(/\s+/, '');
	var semiPos = acceptValue.indexOf(';');
	
	// defaults
	var value = acceptValue;
	var qvalue = 1;
	
	// if a semicolon was found, try to find a QValue (for example ";q=0.123" or "q=1")
	if (semiPos > -1) {
		value = acceptValue.substr(0, semiPos);
		
		var regex = /;q=([0-1]\.?[0-9]{0,3})/gi
		var match = regex.exec(acceptValue);
		
		console.log('Does "' + acceptValue + '" match "' + regex + '"?');
		
		if (match) {			
			qvalue = parseFloat(match[1]);
		}
	}
	
	console.log('Value: "' + value + '", QValue: "' + qvalue + '"');
		
	return new AcceptParam(value, qvalue);
};

$(function() {
	buildPopup();
});

