<!DOCTYPE html>
<html>
	<head>
		<title>Content-Languages test</title>
	</head>
	<body>
		<p><strong>Request:</strong></p>
		<pre>
<?php
require("httpUtilities.php");
require("localizedResources.php");

// Make up some resources
$greetings = array	(
						"nl-NL" => new LanguageResource("nl-NL", "Hallo wereld", 1.0),
						"en-US" => new LanguageResource("en-US", "Hello world", 1.0),
						"de-DE" => new LanguageResource("de-DE", "Hallo Welt", 0.8),
						"fr-FR" => new LanguageResource("fr-FR", "Bonjour tout le monde", 0.5)
					);

// Determine the requested languages
$defaultLanguage = "en-US";
$languages = HttpUtilities::getAcceptLanguages($defaultLanguage);
HttpUtilities::printAcceptValues("Accept-Language", $languages);

// Get the resource in the most fitting language
$contentLanguage = LocalizedResources::getLanguageForResouce($greetings, $languages);

// Now all is found, send headers and content
LocalizedResources::sendContentHeaders($contentLanguage, $greetings);
?>
		</pre>
		<p><strong>Best fitting content-language:</strong></p>
		<pre><?=$contentLanguage?></pre>
		<p><strong>Response:</strong></p>
		<pre>
<?php
LocalizedResources::printContentHeaders($contentLanguage, $greetings);
$greeting = $greetings[$contentLanguage]->Value;
?>
		</pre>
		<p><strong>Result:</strong></p>
		<p><?=$greeting?></p>
		<p><a href="foo.bar">Non-existing page</a> <a href="/test/">Forbidden page (translations by Apache)</a> <a href="content-languages.zip">Download the Chrome extension</a></p>
	</body>
</html>