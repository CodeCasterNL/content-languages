<?php 
class AcceptParam
{
	public $Value;
	public $QValue;
	
	function __construct($value, $qValue)
	{	
		//echo "Accept value: $value;q=$qValue\r\n";
		$this->Value = $value;
		$this->QValue = $qValue;
	}
}

class LanguageTag extends AcceptParam
{
	function __construct()
	{
	
	}
	// TODO: validate languages		
	// 3.10 Language Tags: http://tools.ietf.org/html/rfc2616#section-3.10
	//  "(
	//    [(					// Lanugage-tag
	//      [A-Z]{0,8}		// primary-tag
	// 	    (-[A-Z]{0,8})?	// subtag
	//    )
	//    | 
	//    \*
	//   )"
}

class HttpUtilities
{
	static function getAcceptLanguages($defaultLanguage)
	{
		$acceptLanguage = $_SERVER["HTTP_ACCEPT_LANGUAGE"];
		if (empty($acceptLanguage) && !empty($defaultLanguage))
		{
			$acceptLanguage = $defaultLanguage;
		}
		
		// http://tools.ietf.org/html/rfc2616#section-14.4
		// TODO: create and pass LanguageTag factory for validation and creation 
		$languages = HttpUtilities::parseAcceptParams($acceptLanguage);
		return $languages;
	}

	// http://tools.ietf.org/html/rfc2616#section-14.1
	// Adapted from http://stackoverflow.com/questions/1049401/how-to-select-content-type-from-http-accept-header-in-php
	static function parseAcceptParams($acceptHeader)
	{
		//echo "Parsing Accept header: $acceptHeader\r\n";
		
		$acceptValues = explode(',', $acceptHeader);
		$result = array();
		
		foreach ($acceptValues as $acceptValue) 
		{
			$result[] = HttpUtilities::parseAcceptValue($acceptValue);
		}
		
		return $result;
	}
	
	static function parseAcceptValue($acceptValue)
	{
		//echo "Parsing Accept value: $acceptValue\r\n";
		
		// remove all whitespace
		$acceptValue = preg_replace("/\s+/", "", $acceptValue);			
		$semiPos = strpos($acceptValue, ';');
		
		// defaults
		$value = $acceptValue;
		$qvalue = 1;
			
		// if a semicolon was found, try to find a QValue (for example ";q=0.123" or "q=1")
		if ($semiPos > -1)
		{
			$value = substr($acceptValue, 0, $semiPos);

			if (preg_match("/;q=([0-1]\.?[0-9]{0,3})/i", $acceptValue, $qvalue))
			{
				$qvalue = (float)$qvalue[1];
			}
		}
		
		return new AcceptParam($value, $qvalue);
	}
	
	static function printAcceptValues($title, $languages)
	{
		foreach ($languages as $l)
		{
			echo $title . ": " . $l->Value . ", QValue: " . $l->QValue . "\r\n";
		}
	}
}