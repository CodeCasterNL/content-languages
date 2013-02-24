<?php

class LocalizedResources
{
	static function getLanguageForResouce($resources, $languages)
	{
		// TODO: implement better search algorithm;
		
		$bestQuality = 0;
		$bestLanguage = '';
		
		foreach (array_keys($resources) as $resourceLanguage)
		{
			$resLang = explode('-', strtolower($resourceLanguage));
			$resLang = $resLang[0];
			
			foreach ($languages as $requestLanguage)
			{
				$reqLang = explode('-', strtolower($requestLanguage->Value));
				$reqLang = $reqLang[0];
				
				// TODO: en-US != en-GB
				if ($reqLang == $resLang)
				{
					if ($requestLanguage->QValue > $bestQuality)
					{
						$bestQuality = $requestLanguage->QValue;
						$bestLanguage = $resourceLanguage;
					}
				}
			}
		}
		
		if ($bestLanguage) 
		{
			return $bestLanguage;
		}
		else
		{		
			// TODO: better default than first
			reset($resources);
			return key($resources);
		}
	}

	static function sendContentHeaders($language, $resources)
	{
		$contentLanguages = LocalizedResources::getLanguagesFromResources($resources);		
		
		if (!empty($language))
		{
			header("Content-Language: $language");
		}
		if (!empty($contentLanguages))
		{
			header("Content-Languages: $contentLanguages");
		}
	}
	
	static function printContentHeaders($language, $resources)
	{
		$contentLanguages = LocalizedResources::getLanguagesFromResources($resources);
		
		if (!empty($language))
		{
			echo "Content-Language: $language\r\n";
		}
		if (!empty($contentLanguages))
		{
			echo "Content-Languages: $contentLanguages\r\n";
		}
	}
	static function getLanguagesFromResources($resources)
	{
		$contentLanguages = "";
		
		foreach ($resources as $r)
		{
			$contentLanguages .= $r->LanguageTag;
			if ($r->QValue < 1)
			{
				$contentLanguages .= ";q=" . $r->QValue;
			}
			$contentLanguages .=  ",";
		}
		
		return substr($contentLanguages, 0, strlen($contentLanguages) - 1);
	}
}

class LanguageResource
{
	public $LanguageTag;
	public $Value;
	public $QValue;
	
	public function __construct($languageTag, $value, $qvalue = 1)
	{
		$this->LanguageTag = $languageTag;
		$this->Value = $value;
		$this->QValue = $qvalue;
	}
}