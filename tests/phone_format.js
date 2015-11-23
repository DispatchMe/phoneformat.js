var elements = {
    singleInput: '.js-intlSinglePhone-phoneNumber',
    multiInput: '.js-intlMultiPhone-phoneNumber',
    multiDialCode: '.js-intlMultiPhone-dialCode'
};

var $container, view, $input, phoneInput;

describe('Phone Format', function () {
    beforeAll(function () {
        $container = $('#test-container');
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000.
    });

    afterEach(function () {
        view.destroy();
    });

    describe('Single Input', function () {
        var data = {
            id: 'singleInput',
            class: 'testClass',
            hideDialCode: true
        };

        beforeEach(function (done) {
            view = Template.InternationalPhoneSingleInput.constructView().setData(data).attach($container[0]);
            phoneInput = PhoneInput(data.id, {countryCode: 'US'});

            TestHelpers.waitForElement(elements.singleInput, function () {
                $input = $(elements.singleInput);
                done();
            });
        });

        it('is initialized', function () {
            expect($input.length).not.toEqual(0);
            expect($input.hasClass('testClass')).toBe(true);
        });

        it('has correctly formatted data on input', function (done) {
            var value = '5555555555';
            var formattedValue = '(555) 555-5555';

            TestHelpers.inputValues([elements.singleInput], [value], function () {
                TestHelpers.expectInputValues([elements.singleInput], [formattedValue], done);
            });
        });

        it('does not accept non phone number characters', function () {
            var value = 'a!@#$%^&*()_+';

            TestHelpers.typeInText(elements.singleInput, value);

            expect($(elements.singleInput).val()).toEqual('');
        });

        it('correctly sets phone number, dialcode and country code', function () {
            TestHelpers.typeInText(elements.singleInput, '5555555555');

            expect(PhoneInput(data.id).getPhoneNumber()).toEqual('(555) 555-5555');
            expect(PhoneInput(data.id).getCountryCode()).toEqual('US');
            expect(PhoneInput(data.id).getDialCode()).toEqual('');
        });
    });

    describe('Multi Input', function () {
        var data = {
            id: 'multiInput',
            class: 'testClass',
            hideDialCode: true
        };

        beforeEach(function () {
            view = Template.InternationalPhoneMultiInput.constructView().setData(data).attach($container[0]);

            $input = $(elements.multiInput);
            phoneInput = PhoneInput(data.id, { countryCode: 'US' });
        });

        it('is initialized', function () {
            expect($input.length).not.toEqual(0);
            expect($input.hasClass('testClass')).toBe(true);
        });

        it('has correctly formatted data on input', function (done) {
            var value = '5555555555';
            var formattedValue = '(555) 555-5555';

            TestHelpers.inputValues([elements.multiInput], [value], function () {
                TestHelpers.expectInputValues([elements.multiInput], [formattedValue], done);
            });
        });

        it('does not accept non phone number characters', function () {
            var value = 'a!@#$%^&*()_+';

            TestHelpers.typeInText(elements.multiInput, value);

            expect($(elements.multiInput).val()).toEqual('');
        });

        it('correctly sets phone number', function () {
            TestHelpers.typeInText(elements.multiInput, '5555555555');

            expect(PhoneInput(data.id).getPhoneNumber()).toEqual('(555) 555-5555');
        });

        it('correctly sets dialcode and country code', function () {
            TestHelpers.typeInText(elements.multiDialCode, '+1');

            expect(PhoneInput(data.id).getCountryCode()).toEqual('US');
            expect(PhoneInput(data.id).getDialCode()).toEqual('+1');
        });
    });
});