Phoneformat = {};

// Look up the user's current country based on the user's ip address
var lookupCountryForIp = function (callback) {
  Meteor.call('phoneformat.getCountryForIp', function (error, country) {
    if (!country) return callback && callback('US');

    localStorage.setItem('phoneformat.current_country', country);

    callback && callback(country);
  });
};

// Get the user's current country
Phoneformat._getCountryForIp = function (callback) {
  // Return cached country if it exists.
  var storedCountry = localStorage.getItem('phoneformat.current_country');
  if (storedCountry) return callback && callback(storedCountry);

  // If the user is on a mobile device, attempt to get the country from the phone.
  if (Meteor.isCordova && navigator.globalization) {
    navigator.globalization.getLocaleName(function (locale) {
      // The locale is given as a language and then two digit country code
      // Ex. en-US
      var localeValue = locale.value;
      var country = localeValue.substr(localeValue.indexOf('-') + 1, 2);

      localStorage.setItem('phoneformat.current_country', country);

      callback && callback(country);
    }, function (error) {
      // If the locale cannot be found, get the country from the user's IP and store it.
      lookupCountryForIp(callback);
    });
    return;
  }

  // Otherwise, get the country from the user's IP and store it.
  lookupCountryForIp(callback);
};

/*
 * Return the country code for an e164 formatted number.
 * @param {String} phone The number in e164 format.
 */
Phoneformat.countryForE164Number = function (phone) {
  try {
    phone = Phoneformat.cleanPhone(phone);
    var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
    var number = phoneUtil.parseAndKeepRawInput(phone);
    var output = new goog.string.StringBuffer();
    output = phoneUtil.getRegionCodeForNumber(number);
    return output.toString();
  } catch (e) {
    return "";
  }
};

/*
 * Returns a number formatted in such a way that it can be dialed from a mobile
 * phone in a specific region. If the number cannot be reached from the region
 * (e.g. some countries block toll-free numbers from being called outside of the
 * country), the method returns an empty string.
 * @param {String} country The two digit country code.
 * @param {String} phone The number to format
 */
Phoneformat.formatNumberForMobileDialing = function (country, phone) {
  try {
    phone = Phoneformat.cleanPhone(phone);
    var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
    var number = phoneUtil.parseAndKeepRawInput(phone, country);
    var output = new goog.string.StringBuffer();
    output = phoneUtil.formatNumberForMobileDialing(number, country, true);
    return output.toString();
  } catch (e) {
    return "";
  }
};

/*
 * Tests whether a phone number matches a valid pattern.
 * @param {String} phone
 * @param {String} country The two digit country code.
 */
Phoneformat.isValidNumber = function (phone, country) {
  try {
    phone = Phoneformat.cleanPhone(phone);
    var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
    var number = phoneUtil.parseAndKeepRawInput(phone, country);
    return phoneUtil.isValidNumber(number);
  } catch (e) {
    return false;
  }
};

/*
 * Return the phone number in e164 format.
 * @param {String} country The two digit country code.
 * @param {String} phone The number to format
 */
Phoneformat.formatE164 = function (country, phone) {
  try {
    phone = Phoneformat.cleanPhone(phone);
    var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
    var number = phoneUtil.parseAndKeepRawInput(phone, country);
    var PNF = i18n.phonenumbers.PhoneNumberFormat;
    var output = new goog.string.StringBuffer();
    output = phoneUtil.format(number, PNF.E164);
    return output.toString();
  } catch (e) {
    return phone
  }
};

/*
 * Return the phone number in international format.
 * @param {String} country The two digit country code.
 * @param {String} phone The number to format
 */
Phoneformat.formatInternational = function (country, phone) {
  try {
    phone = Phoneformat.cleanPhone(phone);
    var formatter = new i18n.phonenumbers.AsYouTypeFormatter(country);
    var output = new goog.string.StringBuffer();

    for (var i = 0; i < phone.length; ++i) {
      var inputChar = phone.charAt(i);
      output = (formatter.inputDigit(inputChar));
    }

    return output.toString();
  } catch (e) {
    return phone;
  }
};

/*
 * Return the phone number in the format local to the user.
 * @param {String} country The two digit country code.
 * @param {String} phone The number to format
 */
Phoneformat.formatLocal = function (country, phone) {
  try {
    phone = Phoneformat.cleanPhone(phone);
    var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
    var number = phoneUtil.parseAndKeepRawInput(phone, country);

    if (phoneUtil.isValidNumberForRegion(number, country)) {
      var PNF = i18n.phonenumbers.PhoneNumberFormat;
      var output = new goog.string.StringBuffer();
      output = phoneUtil.format(number, PNF.NATIONAL);
      return output.toString();
    }

    return Phoneformat.formatInternational(country, phone);
  } catch (e) {
    return Phoneformat.formatInternational(country, phone);
  }
};

/*
 * Returns an example land line phone number for the specified country.
 * @param {String} country The two digit country code.
 */
Phoneformat.exampleLandlineNumber = function (country) {
  try {
    var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
    var output = phoneUtil.getExampleNumber(country);
    return ""+output.getNationalNumber();
  } catch (e) {
    return "";
  }
};

/*
 * Returns an example mobile phone number for the specified country.
 * @param {String} country The two digit country code.
 */
Phoneformat.exampleMobileNumber = function (country) {
  try {
    var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
    var output = phoneUtil.getExampleNumberForType(country, i18n.phonenumbers.PhoneNumberType.MOBILE);
    return ""+output.getNationalNumber();
  } catch (e) {
    return "";
  }
};

/*
 * Remove any non numeric characters from the phone number
 * but leave any plus sign at the beginning.
 * @param {String} phone
 */
Phoneformat.cleanPhone = function (phone) {
  if (!phone || phone.length === 0) return '';

  var hasPlus = false;
  if (phone.charAt(0) === "+") hasPlus = true;

  phone = phone.replace(/[^\d]/g,'');

  return hasPlus ? '+' + phone : phone;
};

/*
 * Convert the country code to a name.
 * @param {String} country The two digit country code.
 */
Phoneformat.countryCodeToName = function (countryCode) {
  if (!countryCode) return '';

  var name = countryCodeToNameArr[countryCode.toUpperCase()];
  return name || '';
};

/*
 * Convert the dial code to a name.
 * @param {String} dialCode Dial code for a country starting with '+'.
 */
Phoneformat.dialCodeToName = function (dialCode) {
  var name = dialCodeToNameArr[dialCode];
  return name || '';
};

/*
 * Get the country code from a dial code.
 * @param {String} dialCode Dial code to get country code for.
 */
Phoneformat.dialCodeToCountryCode = function (dialCode) {
  var name = dialCodeToNameArr[dialCode];
  var countryInfo = COUNTRY_CODE_MAP[name];

  return countryInfo && countryInfo.code;
};

/*
 * Get the dial code from a country code.
 * @param {String} countryCode Country code to get dial code for.
 */
Phoneformat.countryCodeToDialCode = function (countryCode) {
  var country = Phoneformat.countryCodeToName(countryCode);
  return COUNTRY_CODE_MAP[country] && COUNTRY_CODE_MAP[country].dial_code;
};

/*
 * Get the dial code from an international phone number.
 * @param {String} phoneNumber Phone number to parse dial code from.
 */
Phoneformat.phoneNumberToDialCode = function (phoneNumber) {
  // Just the dial code was given, therefore it should be returned
  if (dialCodeToNameArr[phoneNumber]) return phoneNumber;

  var countryCode = Phoneformat.countryForE164Number(phoneNumber);

  // If a country code can not be found and the first digits are +1 default to US.
  if (!countryCode && phoneNumber.indexOf('+1') > -1) countryCode = 'US';

  return Phoneformat.countryCodeToDialCode(countryCode);
};

/*
 * Return an object of country names and their dial codes and country codes.
 * @return {Object}
 */
Phoneformat.countryList = function () {
  return COUNTRY_CODE_MAP;
};


var countryCodeToNameArr = {};

countryCodeToNameArr['AF'] = "Afghanistan";
countryCodeToNameArr['AL'] = "Albania";
countryCodeToNameArr['DZ'] = "Algeria";
countryCodeToNameArr['AS'] = "AmericanSamoa";
countryCodeToNameArr['AD'] = "Andorra";
countryCodeToNameArr['AO'] = "Angola";
countryCodeToNameArr['AI'] = "Anguilla";
countryCodeToNameArr['AG'] = "Antigua and Barbuda";
countryCodeToNameArr['AR'] = "Argentina";
countryCodeToNameArr['AM'] = "Armenia";
countryCodeToNameArr['AW'] = "Aruba";
countryCodeToNameArr['AU'] = "Australia";
countryCodeToNameArr['AT'] = "Austria";
countryCodeToNameArr['AZ'] = "Azerbaijan";
countryCodeToNameArr['BS'] = "Bahamas";
countryCodeToNameArr['BH'] = "Bahrain";
countryCodeToNameArr['BD'] = "Bangladesh";
countryCodeToNameArr['BB'] = "Barbados";
countryCodeToNameArr['BY'] = "Belarus";
countryCodeToNameArr['BE'] = "Belgium";
countryCodeToNameArr['BZ'] = "Belize";
countryCodeToNameArr['BJ'] = "Benin";
countryCodeToNameArr['BM'] = "Bermuda";
countryCodeToNameArr['BT'] = "Bhutan";
countryCodeToNameArr['BA'] = "Bosnia and Herzegovina";
countryCodeToNameArr['BW'] = "Botswana";
countryCodeToNameArr['BR'] = "Brazil";
countryCodeToNameArr['IO'] = "British Indian Ocean Territory";
countryCodeToNameArr['BG'] = "Bulgaria";
countryCodeToNameArr['BF'] = "Burkina Faso";
countryCodeToNameArr['BI'] = "Burundi";
countryCodeToNameArr['KH'] = "Cambodia";
countryCodeToNameArr['CM'] = "Cameroon";
countryCodeToNameArr['CA'] = "Canada";
countryCodeToNameArr['CV'] = "Cape Verde";
countryCodeToNameArr['KY'] = "Cayman Islands";
countryCodeToNameArr['CF'] = "Central African Republic";
countryCodeToNameArr['TD'] = "Chad";
countryCodeToNameArr['CL'] = "Chile";
countryCodeToNameArr['CN'] = "China";
countryCodeToNameArr['CX'] = "Christmas Island";
countryCodeToNameArr['CO'] = "Colombia";
countryCodeToNameArr['KM'] = "Comoros";
countryCodeToNameArr['CG'] = "Congo";
countryCodeToNameArr['CK'] = "Cook Islands";
countryCodeToNameArr['CR'] = "Costa Rica";
countryCodeToNameArr['HR'] = "Croatia";
countryCodeToNameArr['CU'] = "Cuba";
countryCodeToNameArr['CY'] = "Cyprus";
countryCodeToNameArr['CZ'] = "Czech Republic";
countryCodeToNameArr['DK'] = "Denmark";
countryCodeToNameArr['DJ'] = "Djibouti";
countryCodeToNameArr['DM'] = "Dominica";
countryCodeToNameArr['DO'] = "Dominican Republic";
countryCodeToNameArr['EC'] = "Ecuador";
countryCodeToNameArr['EG'] = "Egypt";
countryCodeToNameArr['SV'] = "El Salvador";
countryCodeToNameArr['GQ'] = "Equatorial Guinea";
countryCodeToNameArr['ER'] = "Eritrea";
countryCodeToNameArr['EE'] = "Estonia";
countryCodeToNameArr['ET'] = "Ethiopia";
countryCodeToNameArr['FO'] = "Faroe Islands";
countryCodeToNameArr['FJ'] = "Fiji";
countryCodeToNameArr['FI'] = "Finland";
countryCodeToNameArr['FR'] = "France";
countryCodeToNameArr['GF'] = "French Guiana";
countryCodeToNameArr['PF'] = "French Polynesia";
countryCodeToNameArr['GA'] = "Gabon";
countryCodeToNameArr['GM'] = "Gambia";
countryCodeToNameArr['GE'] = "Georgia";
countryCodeToNameArr['DE'] = "Germany";
countryCodeToNameArr['GH'] = "Ghana";
countryCodeToNameArr['GI'] = "Gibraltar";
countryCodeToNameArr['GR'] = "Greece";
countryCodeToNameArr['GL'] = "Greenland";
countryCodeToNameArr['GD'] = "Grenada";
countryCodeToNameArr['GP'] = "Guadeloupe";
countryCodeToNameArr['GU'] = "Guam";
countryCodeToNameArr['GT'] = "Guatemala";
countryCodeToNameArr['GN'] = "Guinea";
countryCodeToNameArr['GW'] = "Guinea-Bissau";
countryCodeToNameArr['GY'] = "Guyana";
countryCodeToNameArr['HT'] = "Haiti";
countryCodeToNameArr['HN'] = "Honduras";
countryCodeToNameArr['HU'] = "Hungary";
countryCodeToNameArr['IS'] = "Iceland";
countryCodeToNameArr['IN'] = "India";
countryCodeToNameArr['ID'] = "Indonesia";
countryCodeToNameArr['IQ'] = "Iraq";
countryCodeToNameArr['IE'] = "Ireland";
countryCodeToNameArr['IL'] = "Israel";
countryCodeToNameArr['IT'] = "Italy";
countryCodeToNameArr['JM'] = "Jamaica";
countryCodeToNameArr['JP'] = "Japan";
countryCodeToNameArr['JO'] = "Jordan";
countryCodeToNameArr['KZ'] = "Kazakhstan";
countryCodeToNameArr['KE'] = "Kenya";
countryCodeToNameArr['KI'] = "Kiribati";
countryCodeToNameArr['KW'] = "Kuwait";
countryCodeToNameArr['KG'] = "Kyrgyzstan";
countryCodeToNameArr['LV'] = "Latvia";
countryCodeToNameArr['LB'] = "Lebanon";
countryCodeToNameArr['LS'] = "Lesotho";
countryCodeToNameArr['LR'] = "Liberia";
countryCodeToNameArr['LI'] = "Liechtenstein";
countryCodeToNameArr['LT'] = "Lithuania";
countryCodeToNameArr['LU'] = "Luxembourg";
countryCodeToNameArr['MG'] = "Madagascar";
countryCodeToNameArr['MW'] = "Malawi";
countryCodeToNameArr['MY'] = "Malaysia";
countryCodeToNameArr['MV'] = "Maldives";
countryCodeToNameArr['ML'] = "Mali";
countryCodeToNameArr['MT'] = "Malta";
countryCodeToNameArr['MH'] = "Marshall Islands";
countryCodeToNameArr['MQ'] = "Martinique";
countryCodeToNameArr['MR'] = "Mauritania";
countryCodeToNameArr['MU'] = "Mauritius";
countryCodeToNameArr['YT'] = "Mayotte";
countryCodeToNameArr['MX'] = "Mexico";
countryCodeToNameArr['MC'] = "Monaco";
countryCodeToNameArr['MN'] = "Mongolia";
countryCodeToNameArr['ME'] = "Montenegro";
countryCodeToNameArr['MS'] = "Montserrat";
countryCodeToNameArr['MA'] = "Morocco";
countryCodeToNameArr['MM'] = "Myanmar";
countryCodeToNameArr['NA'] = "Namibia";
countryCodeToNameArr['NR'] = "Nauru";
countryCodeToNameArr['NP'] = "Nepal";
countryCodeToNameArr['NL'] = "Netherlands";
countryCodeToNameArr['AN'] = "Netherlands Antilles";
countryCodeToNameArr['NC'] = "New Caledonia";
countryCodeToNameArr['NZ'] = "New Zealand";
countryCodeToNameArr['NI'] = "Nicaragua";
countryCodeToNameArr['NE'] = "Niger";
countryCodeToNameArr['NG'] = "Nigeria";
countryCodeToNameArr['NU'] = "Niue";
countryCodeToNameArr['NF'] = "Norfolk Island";
countryCodeToNameArr['MP'] = "Northern Mariana Islands";
countryCodeToNameArr['NO'] = "Norway";
countryCodeToNameArr['OM'] = "Oman";
countryCodeToNameArr['PK'] = "Pakistan";
countryCodeToNameArr['PW'] = "Palau";
countryCodeToNameArr['PA'] = "Panama";
countryCodeToNameArr['PG'] = "Papua New Guinea";
countryCodeToNameArr['PY'] = "Paraguay";
countryCodeToNameArr['PE'] = "Peru";
countryCodeToNameArr['PH'] = "Philippines";
countryCodeToNameArr['PL'] = "Poland";
countryCodeToNameArr['PT'] = "Portugal";
countryCodeToNameArr['PR'] = "Puerto Rico";
countryCodeToNameArr['QA'] = "Qatar";
countryCodeToNameArr['RO'] = "Romania";
countryCodeToNameArr['RW'] = "Rwanda";
countryCodeToNameArr['WS'] = "Samoa";
countryCodeToNameArr['SM'] = "San Marino";
countryCodeToNameArr['SA'] = "Saudi Arabia";
countryCodeToNameArr['SN'] = "Senegal";
countryCodeToNameArr['RS'] = "Serbia";
countryCodeToNameArr['SC'] = "Seychelles";
countryCodeToNameArr['SL'] = "Sierra Leone";
countryCodeToNameArr['SG'] = "Singapore";
countryCodeToNameArr['SK'] = "Slovakia";
countryCodeToNameArr['SI'] = "Slovenia";
countryCodeToNameArr['SB'] = "Solomon Islands";
countryCodeToNameArr['ZA'] = "South Africa";
countryCodeToNameArr['GS'] = "South Georgia and the South Sandwich Islands";
countryCodeToNameArr['ES'] = "Spain";
countryCodeToNameArr['LK'] = "Sri Lanka";
countryCodeToNameArr['SD'] = "Sudan";
countryCodeToNameArr['SR'] = "Suriname";
countryCodeToNameArr['SZ'] = "Swaziland";
countryCodeToNameArr['SE'] = "Sweden";
countryCodeToNameArr['CH'] = "Switzerland";
countryCodeToNameArr['TJ'] = "Tajikistan";
countryCodeToNameArr['TH'] = "Thailand";
countryCodeToNameArr['TG'] = "Togo";
countryCodeToNameArr['TK'] = "Tokelau";
countryCodeToNameArr['TO'] = "Tonga";
countryCodeToNameArr['TT'] = "Trinidad and Tobago";
countryCodeToNameArr['TN'] = "Tunisia";
countryCodeToNameArr['TR'] = "Turkey";
countryCodeToNameArr['TM'] = "Turkmenistan";
countryCodeToNameArr['TC'] = "Turks and Caicos Islands";
countryCodeToNameArr['TV'] = "Tuvalu";
countryCodeToNameArr['UG'] = "Uganda";
countryCodeToNameArr['UA'] = "Ukraine";
countryCodeToNameArr['AE'] = "United Arab Emirates";
countryCodeToNameArr['GB'] = "United Kingdom";
countryCodeToNameArr['US'] = "United States";
countryCodeToNameArr['UY'] = "Uruguay";
countryCodeToNameArr['UZ'] = "Uzbekistan";
countryCodeToNameArr['VU'] = "Vanuatu";
countryCodeToNameArr['WF'] = "Wallis and Futuna";
countryCodeToNameArr['YE'] = "Yemen";
countryCodeToNameArr['ZM'] = "Zambia";
countryCodeToNameArr['ZW'] = "Zimbabwe";
countryCodeToNameArr['AX'] = "land Islands";
countryCodeToNameArr['AQ'] = "Antarctica";
countryCodeToNameArr['BO'] = "Bolivia, Plurinational State of";
countryCodeToNameArr['BN'] = "Brunei Darussalam";
countryCodeToNameArr['CC'] = "Cocos (Keeling) Islands";
countryCodeToNameArr['CD'] = "Congo, The Democratic Republic of the";
countryCodeToNameArr['CI'] = "Cote d'Ivoire";
countryCodeToNameArr['FK'] = "Falkland Islands (Malvinas)";
countryCodeToNameArr['GG'] = "Guernsey";
countryCodeToNameArr['VA'] = "Holy See (Vatican City State)";
countryCodeToNameArr['HK'] = "Hong Kong";
countryCodeToNameArr['IR'] = "Iran, Islamic Republic of";
countryCodeToNameArr['IM'] = "Isle of Man";
countryCodeToNameArr['JE'] = "Jersey";
countryCodeToNameArr['KP'] = "Korea, Democratic People's Republic of";
countryCodeToNameArr['KR'] = "Korea, Republic of";
countryCodeToNameArr['LA'] = "Lao People's Democratic Republic";
countryCodeToNameArr['LY'] = "Libyan Arab Jamahiriya";
countryCodeToNameArr['MO'] = "Macao";
countryCodeToNameArr['MK'] = "Macedonia, The Former Yugoslav Republic of";
countryCodeToNameArr['FM'] = "Micronesia, Federated States of";
countryCodeToNameArr['MD'] = "Moldova, Republic of";
countryCodeToNameArr['MZ'] = "Mozambique";
countryCodeToNameArr['PS'] = "Palestinian Territory, Occupied";
countryCodeToNameArr['PN'] = "Pitcairn";
countryCodeToNameArr['RE'] = "RÃ©union";
countryCodeToNameArr['RU'] = "Russia";
countryCodeToNameArr['BL'] = "Saint BarthÃ©lemy";
countryCodeToNameArr['SH'] = "Saint Helena, Ascension and Tristan Da Cunha";
countryCodeToNameArr['KN'] = "Saint Kitts and Nevis";
countryCodeToNameArr['LC'] = "Saint Lucia";
countryCodeToNameArr['MF'] = "Saint Martin";
countryCodeToNameArr['PM'] = "Saint Pierre and Miquelon";
countryCodeToNameArr['VC'] = "Saint Vincent and the Grenadines";
countryCodeToNameArr['ST'] = "Sao Tome and Principe";
countryCodeToNameArr['SO'] = "Somalia";
countryCodeToNameArr['SJ'] = "Svalbard and Jan Mayen";
countryCodeToNameArr['SY'] = "Syrian Arab Republic";
countryCodeToNameArr['TW'] = "Taiwan, Province of China";
countryCodeToNameArr['TZ'] = "Tanzania, United Republic of";
countryCodeToNameArr['TL'] = "Timor-Leste";
countryCodeToNameArr['VE'] = "Venezuela, Bolivarian Republic of";
countryCodeToNameArr['VN'] = "Viet Nam";
countryCodeToNameArr['VG'] = "Virgin Islands, British";
countryCodeToNameArr['VI'] = "Virgin Islands, U.S.";

var dialCodeToNameArr = {};

dialCodeToNameArr['+93'] = "Afghanistan";
dialCodeToNameArr['+355'] = "Albania";
dialCodeToNameArr['+213'] = "Algeria";
dialCodeToNameArr['+1684'] = "AmericanSamoa";
dialCodeToNameArr['+376'] = "Andorra";
dialCodeToNameArr['+244'] = "Angola";
dialCodeToNameArr['+1264'] = "Anguilla";
dialCodeToNameArr['+1268'] = "Antigua and Barbuda";
dialCodeToNameArr['+54'] = "Argentina";
dialCodeToNameArr['+374'] = "Armenia";
dialCodeToNameArr['+297'] = "Aruba";
dialCodeToNameArr['+61'] = "Australia";
dialCodeToNameArr['+43'] = "Austria";
dialCodeToNameArr['+994'] = "Azerbaijan";
dialCodeToNameArr['+1242'] = "Bahamas";
dialCodeToNameArr['+973'] = "Bahrain";
dialCodeToNameArr['+880'] = "Bangladesh";
dialCodeToNameArr['+1246'] = "Barbados";
dialCodeToNameArr['+375'] = "Belarus";
dialCodeToNameArr['+32'] = "Belgium";
dialCodeToNameArr['+501'] = "Belize";
dialCodeToNameArr['+229'] = "Benin";
dialCodeToNameArr['+1441'] = "Bermuda";
dialCodeToNameArr['+975'] = "Bhutan";
dialCodeToNameArr['+387'] = "Bosnia and Herzegovina";
dialCodeToNameArr['+267'] = "Botswana";
dialCodeToNameArr['+55'] = "Brazil";
dialCodeToNameArr['+246'] = "British Indian Ocean Territory";
dialCodeToNameArr['+359'] = "Bulgaria";
dialCodeToNameArr['+226'] = "Burkina Faso";
dialCodeToNameArr['+257'] = "Burundi";
dialCodeToNameArr['+855'] = "Cambodia";
dialCodeToNameArr['+237'] = "Cameroon";
dialCodeToNameArr['+1'] = "Canada";
dialCodeToNameArr['+238'] = "Cape Verde";
dialCodeToNameArr['+345'] = "Cayman Islands";
dialCodeToNameArr['+236'] = "Central African Republic";
dialCodeToNameArr['+235'] = "Chad";
dialCodeToNameArr['+56'] = "Chile";
dialCodeToNameArr['+86'] = "China";
dialCodeToNameArr['+61'] = "Christmas Island";
dialCodeToNameArr['+57'] = "Colombia";
dialCodeToNameArr['+269'] = "Comoros";
dialCodeToNameArr['+242'] = "Congo";
dialCodeToNameArr['+682'] = "Cook Islands";
dialCodeToNameArr['+506'] = "Costa Rica";
dialCodeToNameArr['+385'] = "Croatia";
dialCodeToNameArr['+53'] = "Cuba";
dialCodeToNameArr['+537'] = "Cyprus";
dialCodeToNameArr['+420'] = "Czech Republic";
dialCodeToNameArr['+45'] = "Denmark";
dialCodeToNameArr['+253'] = "Djibouti";
dialCodeToNameArr['+1767'] = "Dominica";
dialCodeToNameArr['+1849'] = "Dominican Republic";
dialCodeToNameArr['+593'] = "Ecuador";
dialCodeToNameArr['+20'] = "Egypt";
dialCodeToNameArr['+503'] = "El Salvador";
dialCodeToNameArr['+240'] = "Equatorial Guinea";
dialCodeToNameArr['+291'] = "Eritrea";
dialCodeToNameArr['+372'] = "Estonia";
dialCodeToNameArr['+251'] = "Ethiopia";
dialCodeToNameArr['+298'] = "Faroe Islands";
dialCodeToNameArr['+679'] = "Fiji";
dialCodeToNameArr['+358'] = "Finland";
dialCodeToNameArr['+33'] = "France";
dialCodeToNameArr['+594'] = "French Guiana";
dialCodeToNameArr['+689'] = "French Polynesia";
dialCodeToNameArr['+241'] = "Gabon";
dialCodeToNameArr['+220'] = "Gambia";
dialCodeToNameArr['+995'] = "Georgia";
dialCodeToNameArr['+49'] = "Germany";
dialCodeToNameArr['+233'] = "Ghana";
dialCodeToNameArr['+350'] = "Gibraltar";
dialCodeToNameArr['+30'] = "Greece";
dialCodeToNameArr['+299'] = "Greenland";
dialCodeToNameArr['+1473'] = "Grenada";
dialCodeToNameArr['+590'] = "Guadeloupe";
dialCodeToNameArr['+1671'] = "Guam";
dialCodeToNameArr['+502'] = "Guatemala";
dialCodeToNameArr['+224'] = "Guinea";
dialCodeToNameArr['+245'] = "Guinea-Bissau";
dialCodeToNameArr['+595'] = "Guyana";
dialCodeToNameArr['+509'] = "Haiti";
dialCodeToNameArr['+504'] = "Honduras";
dialCodeToNameArr['+36'] = "Hungary";
dialCodeToNameArr['+354'] = "Iceland";
dialCodeToNameArr['+91'] = "India";
dialCodeToNameArr['+62'] = "Indonesia";
dialCodeToNameArr['+964'] = "Iraq";
dialCodeToNameArr['+353'] = "Ireland";
dialCodeToNameArr['+972'] = "Israel";
dialCodeToNameArr['+39'] = "Italy";
dialCodeToNameArr['+1876'] = "Jamaica";
dialCodeToNameArr['+81'] = "Japan";
dialCodeToNameArr['+962'] = "Jordan";
dialCodeToNameArr['+77'] = "Kazakhstan";
dialCodeToNameArr['+254'] = "Kenya";
dialCodeToNameArr['+686'] = "Kiribati";
dialCodeToNameArr['+965'] = "Kuwait";
dialCodeToNameArr['+996'] = "Kyrgyzstan";
dialCodeToNameArr['+371'] = "Latvia";
dialCodeToNameArr['+961'] = "Lebanon";
dialCodeToNameArr['+266'] = "Lesotho";
dialCodeToNameArr['+231'] = "Liberia";
dialCodeToNameArr['+423'] = "Liechtenstein";
dialCodeToNameArr['+370'] = "Lithuania";
dialCodeToNameArr['+352'] = "Luxembourg";
dialCodeToNameArr['+261'] = "Madagascar";
dialCodeToNameArr['+265'] = "Malawi";
dialCodeToNameArr['+60'] = "Malaysia";
dialCodeToNameArr['+960'] = "Maldives";
dialCodeToNameArr['+223'] = "Mali";
dialCodeToNameArr['+356'] = "Malta";
dialCodeToNameArr['+692'] = "Marshall Islands";
dialCodeToNameArr['+596'] = "Martinique";
dialCodeToNameArr['+222'] = "Mauritania";
dialCodeToNameArr['+230'] = "Mauritius";
dialCodeToNameArr['+262'] = "Mayotte";
dialCodeToNameArr['+52'] = "Mexico";
dialCodeToNameArr['+377'] = "Monaco";
dialCodeToNameArr['+976'] = "Mongolia";
dialCodeToNameArr['+382'] = "Montenegro";
dialCodeToNameArr['+1664'] = "Montserrat";
dialCodeToNameArr['+212'] = "Morocco";
dialCodeToNameArr['+95'] = "Myanmar";
dialCodeToNameArr['+264'] = "Namibia";
dialCodeToNameArr['+674'] = "Nauru";
dialCodeToNameArr['+977'] = "Nepal";
dialCodeToNameArr['+31'] = "Netherlands";
dialCodeToNameArr['+599'] = "Netherlands Antilles";
dialCodeToNameArr['+687'] = "New Caledonia";
dialCodeToNameArr['+64'] = "New Zealand";
dialCodeToNameArr['+505'] = "Nicaragua";
dialCodeToNameArr['+227'] = "Niger";
dialCodeToNameArr['+234'] = "Nigeria";
dialCodeToNameArr['+683'] = "Niue";
dialCodeToNameArr['+672'] = "Norfolk Island";
dialCodeToNameArr['+1670'] = "Northern Mariana Islands";
dialCodeToNameArr['+47'] = "Norway";
dialCodeToNameArr['+968'] = "Oman";
dialCodeToNameArr['+92'] = "Pakistan";
dialCodeToNameArr['+680'] = "Palau";
dialCodeToNameArr['+507'] = "Panama";
dialCodeToNameArr['+675'] = "Papua New Guinea";
dialCodeToNameArr['+595'] = "Paraguay";
dialCodeToNameArr['+51'] = "Peru";
dialCodeToNameArr['+63'] = "Philippines";
dialCodeToNameArr['+48'] = "Poland";
dialCodeToNameArr['+351'] = "Portugal";
dialCodeToNameArr['+1939'] = "Puerto Rico";
dialCodeToNameArr['+974'] = "Qatar";
dialCodeToNameArr['+40'] = "Romania";
dialCodeToNameArr['+250'] = "Rwanda";
dialCodeToNameArr['+685'] = "Samoa";
dialCodeToNameArr['+378'] = "San Marino";
dialCodeToNameArr['+966'] = "Saudi Arabia";
dialCodeToNameArr['+221'] = "Senegal";
dialCodeToNameArr['+381'] = "Serbia";
dialCodeToNameArr['+248'] = "Seychelles";
dialCodeToNameArr['+232'] = "Sierra Leone";
dialCodeToNameArr['+65'] = "Singapore";
dialCodeToNameArr['+421'] = "Slovakia";
dialCodeToNameArr['+386'] = "Slovenia";
dialCodeToNameArr['+677'] = "Solomon Islands";
dialCodeToNameArr['+27'] = "South Africa";
dialCodeToNameArr['+500'] = "South Georgia and the South Sandwich Islands";
dialCodeToNameArr['+34'] = "Spain";
dialCodeToNameArr['+94'] = "Sri Lanka";
dialCodeToNameArr['+249'] = "Sudan";
dialCodeToNameArr['+597'] = "Suriname";
dialCodeToNameArr['+268'] = "Swaziland";
dialCodeToNameArr['+46'] = "Sweden";
dialCodeToNameArr['+41'] = "Switzerland";
dialCodeToNameArr['+992'] = "Tajikistan";
dialCodeToNameArr['+66'] = "Thailand";
dialCodeToNameArr['+228'] = "Togo";
dialCodeToNameArr['+690'] = "Tokelau";
dialCodeToNameArr['+676'] = "Tonga";
dialCodeToNameArr['+1868'] = "Trinidad and Tobago";
dialCodeToNameArr['+216'] = "Tunisia";
dialCodeToNameArr['+90'] = "Turkey";
dialCodeToNameArr['+993'] = "Turkmenistan";
dialCodeToNameArr['+1649'] = "Turks and Caicos Islands";
dialCodeToNameArr['+688'] = "Tuvalu";
dialCodeToNameArr['+256'] = "Uganda";
dialCodeToNameArr['+380'] = "Ukraine";
dialCodeToNameArr['+971'] = "United Arab Emirates";
dialCodeToNameArr['+44'] = "United Kingdom";
dialCodeToNameArr['+1'] = "United States";
dialCodeToNameArr['+598'] = "Uruguay";
dialCodeToNameArr['+998'] = "Uzbekistan";
dialCodeToNameArr['+678'] = "Vanuatu";
dialCodeToNameArr['+681'] = "Wallis and Futuna";
dialCodeToNameArr['+967'] = "Yemen";
dialCodeToNameArr['+260'] = "Zambia";
dialCodeToNameArr['+263'] = "Zimbabwe";
dialCodeToNameArr['+591'] = "Bolivia, Plurinational State of";
dialCodeToNameArr['+673'] = "Brunei Darussalam";
dialCodeToNameArr['+61'] = "Cocos (Keeling) Islands";
dialCodeToNameArr['+243'] = "Congo, The Democratic Republic of the";
dialCodeToNameArr['+225'] = "Cote d'Ivoire";
dialCodeToNameArr['+500'] = "Falkland Islands (Malvinas)";
dialCodeToNameArr['+44'] = "Guernsey";
dialCodeToNameArr['+379'] = "Holy See (Vatican City State)";
dialCodeToNameArr['+852'] = "Hong Kong";
dialCodeToNameArr['+98'] = "Iran, Islamic Republic of";
dialCodeToNameArr['+44'] = "Isle of Man";
dialCodeToNameArr['+44'] = "Jersey";
dialCodeToNameArr['+850'] = "Korea, Democratic People's Republic of";
dialCodeToNameArr['+82'] = "Korea, Republic of";
dialCodeToNameArr['+856'] = "Lao People's Democratic Republic";
dialCodeToNameArr['+218'] = "Libyan Arab Jamahiriya";
dialCodeToNameArr['+853'] = "Macao";
dialCodeToNameArr['+389'] = "Macedonia, The Former Yugoslav Republic of";
dialCodeToNameArr['+691'] = "Micronesia, Federated States of";
dialCodeToNameArr['+373'] = "Moldova, Republic of";
dialCodeToNameArr['+258'] = "Mozambique";
dialCodeToNameArr['+970'] = "Palestinian Territory, Occupied";
dialCodeToNameArr['+872'] = "Pitcairn";
dialCodeToNameArr['+262'] = "RÃ©union";
dialCodeToNameArr['+7'] = "Russia";
dialCodeToNameArr['+590'] = "Saint BarthÃ©lemy";
dialCodeToNameArr['+290'] = "Saint Helena, Ascension and Tristan Da Cunha";
dialCodeToNameArr['+1869'] = "Saint Kitts and Nevis";
dialCodeToNameArr['+1758'] = "Saint Lucia";
dialCodeToNameArr['+590'] = "Saint Martin";
dialCodeToNameArr['+508'] = "Saint Pierre and Miquelon";
dialCodeToNameArr['+1784'] = "Saint Vincent and the Grenadines";
dialCodeToNameArr['+239'] = "Sao Tome and Principe";
dialCodeToNameArr['+252'] = "Somalia";
dialCodeToNameArr['+47'] = "Svalbard and Jan Mayen";
dialCodeToNameArr['+963'] = "Syrian Arab Republic";
dialCodeToNameArr['+886'] = "Taiwan, Province of China";
dialCodeToNameArr['+255'] = "Tanzania, United Republic of";
dialCodeToNameArr['+670'] = "Timor-Leste";
dialCodeToNameArr['+58'] = "Venezuela, Bolivarian Republic of";
dialCodeToNameArr['+84'] = "Viet Nam";
dialCodeToNameArr['+1284'] = "Virgin Islands, British";
dialCodeToNameArr['+1340'] = "Virgin Islands, U.S.";
