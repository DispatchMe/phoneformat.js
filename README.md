meteor phoneformat.js [![Build Status](https://travis-ci.org/DispatchMe/phoneformat.js.svg)](https://travis-ci.org/DispatchMe/phoneformat.js)
==============

Javascript phone number formatter for meteor.

##Usage
`meteor add dispatch:phoneformat.js`

```
// Returns: +18646978257
Phoneformat.formatE164('US', '8646978257');

// Returns: US
Phoneformat.countryForE164Number('+18646978257');

// Returns: +1 (864) 697-8257
Phoneformat.formatInternational('US', '8646978257');

// Returns: (864) 697-8257
Phoneformat.formatLocal('US', '8646978257');

// Returns: United States
Phoneformat.countryCodeToName('US');

// Returns: United States
Phoneformat.dialCodeToName('+1');

// Returns: +1
Phoneformat.countryCodeToDialCode('US');

// Returns: +18646978257
Phoneformat.cleanPhone('+1 (864) 697-8257');
```

<br>

##Template
`{{> InternationalPhoneMultiInput id='example'}}`

This provides a template for a split input field for both an international dial code and the national phone format.

```
// The value from the dial code and phone number inputs
// Ex. +15555555555
PhoneInput('example').getValue();

// The dial code input value
// Ex. +1
PhoneInput('example').getDialCode();

// The phone number input value
// Ex. 5555555555
PhoneInput('example').getPhoneNumber();

// Listen to changes on the input
PhoneInput('example').on('change', function (change) {});
```

<br>

##License

MIT © [Dispatch](https://github.com/dispatchme)

##Credits
This repo was originally forked from [albeebe/phoneformat.js](https://github.com/albeebe/phoneformat.js).
