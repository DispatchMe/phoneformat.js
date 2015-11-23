TestHelpers = {};

TestHelpers.typeInText = function(el, text) {
    var $el = $(el);
    var triggerKeyEvent = function($el, name, ch) {
        var e = $.Event(name, { keyCode: ch, which: ch });
        $el.trigger(e);
    };

    $el.click().focus();

    for (var i = 0; i < text.length; i++) {
        var ch = text.charCodeAt(i);

        triggerKeyEvent($el, 'keydown', ch);
        triggerKeyEvent($el, 'keypress', ch);
        triggerKeyEvent($el, 'keyup', ch);
    }

    $el.val(text).trigger('input').trigger('change');
};

TestHelpers.expectElements = function(container, elements, callback) {
    var element = elements.shift();

    if (!element) return callback();

    TestHelpers.waitForElement(element, function () {
        expect(container).toContainElement(element);
        expect($(element)).toBeVisible();

        TestHelpers.expectElements(container, elements, callback);
    });
};

TestHelpers.waitForElement = function(selector, callback, options) {
    options = _.extend({ container: $('body') }, options);

    Timeout.interval(function() {
        var elements = $(options.container).find(selector);
        return elements && elements.length;
    }, function(error) {
        if (error) {
            callback(new Error('Timed out while waiting for "' + selector + '"'));
        } else {
            callback(null, { message: 'Element "' + selector + '" is ready' });
        }
    }, {
        timeout: 30000
    });
};

TestHelpers.expectInputValues = function (elements, values, callback) {
    var element = elements.shift();
    var value = values.shift();

    if (!element && !value) return callback();

    Timeout.interval(function () {
        var $el = $(element);
        return $el && $el.val() === value;
    }, function () {
        expect($(element).val()).toEqual(value);

        TestHelpers.expectInputValues(elements, values, callback);
    });
};

TestHelpers.inputValues = function (elements, values, callback) {
    var element = elements.shift();
    var value = values.shift();

    if (!element && !value) return callback();

    Timeout.interval(function () {
        return !!$(element).length;
    }, function () {
        TestHelpers.typeInText(element, value);

        TestHelpers.inputValues(elements, values, callback);
    });
};