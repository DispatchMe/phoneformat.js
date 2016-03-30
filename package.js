Package.describe({
  name: 'dispatch:phoneformat.js',
  summary: 'phoneformat.js packaged for meteor',
  version: '1.5.5',
  git: 'https://github.com/DispatchMe/phoneformat.js.git'
});

Package.onUse(function (api) {
  api.versionsFrom('1.0');

  api.use([
    // core
    'underscore',
    'reactive-var@1.0.5',
    'templating@1.1.1',

    // atmosphere
    'raix:eventemitter@0.1.2'
  ], 'web');

  api.addFiles([
    'google.phoneformat.js',
    'PhoneFormat.js',
    'country_code_map.js',
    'components/single-input/single_input.html',
    'components/single-input/single_input.js',
    'components/multi-input/multi_input.html',
    'components/multi-input/multi_input.js',
    'components/phone_input.js'
  ], 'web');

  api.use([
    'http@1.1.0'
  ], 'server');

  api.addFiles('server.js', 'server');

  api.export(['Phoneformat', 'PhoneInput']);
});

Cordova.depends({
  'cordova-plugin-globalization': '1.0.1'
});
