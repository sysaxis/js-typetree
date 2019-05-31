"use strict";

const {assert} = require('chai');
const {validateObject} = require('../lib')

suite('validateObject');

test('Boolean', function() {
    var errors;
    
    errors = validateObject(Boolean, true);
    assert.isUndefined(errors);

    errors = validateObject(Boolean, false);
    assert.isUndefined(errors);

    errors = validateObject(Boolean, null);
    assert.isArray(errors);
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected Boolean');
});

test('String', function() {
    var errors;

    errors = validateObject(String, 'hello');
    assert.isUndefined(errors);

    errors = validateObject(String, null);
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected String');
});

test('Number', function() {
    var errors;

    errors = validateObject(Number, 10);
    assert.isUndefined(errors);

    errors = validateObject(Number, '10');
    assert.isUndefined(errors);

    errors = validateObject(Number, 'not a number');
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected Number');
});

test('Null', function() {
    var errors;

    errors = validateObject(null, null);
    assert.isUndefined(errors);

    errors = validateObject(null, undefined);
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected null');
});

test('Options', function() {
    var errors;
    var validObject = ['a', 'b', 'c'];

    for (var item of validObject) {
        errors = validateObject(validObject, item);
        assert.isUndefined(errors);
    }

    errors = validateObject(validObject, 'd');
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected any from [a, b, c]');

    validObject = ['a', undefined];
    errors = validateObject(validObject, undefined);
    assert.isUndefined(errors);
});

test('Array<T>', function() {
    var errors;
    var validObject = [Number];

    errors = validateObject(validObject, [1, 2, 3]);
    assert.isUndefined(errors);

    errors = validateObject(validObject, [1, 2, 'a']);
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected Number at [2]');
});

test('Array with optionals', function() {
    var errors;
    var validObject = [[
        {a: Number, b: String},
        {d: true}
    ]];

    errors = validateObject(validObject, [
        {
            a: 1,
            b: 'b1'
        },
        {
            a: 1,
            d: true
        }
    ]);
    assert.isUndefined(errors);
    
    errors = validateObject(validObject, [
        {
            a: 1,
            b: 'b1'
        },
        {
            a: 1,
            d: false
        }
    ]);
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected any from [Object {a<Number>, b<String>}, Object {d: true}] at [1]');
});

test('multiple errors', function() {
    var errors;
    var validObject = {
        a: String,
        b: {
            b1: String
        }
    };

    errors = validateObject(validObject, {});
    assert.lengthOf(errors, 2);
    assert.equal(errors[0], 'expected String at a');
    assert.equal(errors[1], 'expected Object {b1<String>} at b');
});

test('ommitable', function() {
    var errors;
    var validObject = ['a', undefined];

    errors = validateObject(validObject, 'a');
    assert.isUndefined(errors);

    errors = validateObject(validObject, undefined);
    assert.isUndefined(errors);

    errors = validateObject(validObject, 'b');
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected any from [a, (ommitable)]');
})

test('long tree', function() {
    var errors;
    var validObject = {
        a: {b: {c: {d: {e: {f: Number}}}}}
    };

    errors = validateObject(validObject, {a: {b: {c: {d: {e: {f: 10}}}}}});
    assert.isUndefined(errors);

    errors = validateObject(validObject, {a: {b: {c: {d: {e: {f: 'g'}}}}}});
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected Number at a.b.c.d.e.f');
    
    errors = validateObject(validObject, {});
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected Object {b<Object>} at a');
});

test('empty Object', function() {
    var errors;

    errors = validateObject(Object, {});
    assert.isUndefined(errors);

    errors = validateObject(Object, null);
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected Object {}');
});

test('simple Object', function() {
    var errors;
    var validObject = {
        a: Number,
        b: String
    };

    errors = validateObject(validObject, {
        a: 10,
        b: 'abc'
    });
    assert.isUndefined(errors);

    errors = validateObject(validObject, {
        a: 10,
    });
    assert.lengthOf(errors, 1);
    assert.equal(errors[0], 'expected String at b');
});

test('complex Object', function() {
    var errors;

    var validObject = {
        aa: {
            aa1: {
                aa11: Number,
                aa12: String
            },
            aa2: String
        },
        bb: Number,
        cc: [{
            cc1: String,
            cc2: Number
        }],
        dd: [null, 1, 'true'],
        ee: Boolean,
        ff: [String, {
            ff1: Boolean,
            ff2: String
        }]
    }

    var sourceObject = {
        aa: {
            aa1: {
                aa11: "3123.0",
                aa12: "hello there"
            },
            aa2: "g'day"
        },
        bb: 1240213123,
        cc: [
            {
                cc1: "abc",
                cc2: "13123.5"
            },
            {
                cc1: "def",
                cc2: null
            }
        ],
        ee: 'false',
        ff: {
            ff1: true,
            ff2: "asd"
        }
    }

    errors = validateObject(validObject, sourceObject);
    assert.lengthOf(errors, 3);
    assert.equal(errors[0], 'expected Number at cc[1].cc2');
    assert.equal(errors[1], 'expected any from [null, 1, true] at dd');
    assert.equal(errors[2], 'expected Boolean at ee');
});
