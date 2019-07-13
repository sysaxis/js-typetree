"use strict";

/**
 * Built-in type enumerations
 */
const Type = {
	None:       'None',
	Undefined:  'Undefined',
	Null:       'Null',
	Number:     'Number',
	String:     'String',
	Object:     'Object',
	Array:      'Array'
};
Object.seal(Type);

/**
 * Returns the object Type
 * @param {*} object 
 * @returns {String} Type
 */
function _getType(object) {
	if (Array.isArray(object)) {
		return Type.Array;
	}
	if (object === null) {
		return Type.Null;
	}
	if (object === undefined) {
		return Type.Undefined;
	}

	var _type = typeof(object);
	if (_type === 'object') {
		return Type.Object;
	}
	if (_type === 'string') {
		return Type.String;
	}

	return Type.None;
}

/**
 * Definable type definitions
 */
const DefType = {
	Ommitable:  'Ommitable',
	//Value:      'Value', // value types (Number, String, Boolean, null)
	Null:       'Null',
	Number:     'Number',
	String:     'String',
	Boolean:    'Boolean',
	Object:     'Object',
	Array:      'Array',
	Options:    'Options',
	Unknown:	'Unknown'
};
Object.seal(DefType);

/**
 * Returns the type of the definition
 * @param {*} def 
 * @returns {String}
 */
function _getDefType(def) {
	if (Array.isArray(def)) {
		if (def.length === 1) return DefType.Array;
		return DefType.Options;
	}

	if (def === undefined) {
		return DefType.Ommitable;
	}
	if (def === null) {
		return DefType.Null;
	}

	var _type = DefType[def.name];

	if (_type) {
		return _type;
	}

	if (typeof(def) === 'object') {
		return DefType.Object;
	}
	
	_type = DefType[def];

	if (_type) {
		return _type;
	}

	return DefType.Unknown;
}

/**
 * Validators corresponding to definition types
 */
const Validators = {
	[DefType.Number]:	v => v !== '' && v !== null && !isNaN(v),
	[DefType.String]:	v => typeof(v) === 'string',
	[DefType.Boolean]:	v => v === true || v === false,
	[DefType.Null]:		v => v === null
};

/**
 * Returns the descriptive string for the given definition
 * @param {*} def 
 * @param {DefType} defType 
 * @returns {String}
 */
function _getDefString(def, defType) {
    
    if (!defType) {
        defType = _getDefType(def);
    }

    switch(defType) {
        case DefType.Value:
            return String(def);

        case DefType.Options:
            return `any from [${def.map(_def => {
                return _getDefString(_def);
            }).join(', ')}]`;
            
        case DefType.Object:
            return 'Object ' + '{' + Object.keys(def).map(key => {
                var subType = _getDefType(def[key]);
                if (subType === DefType.Unknown) {
                    return key + ': ' + _getDefString(def[key]);
                }
                else {
                    return key + '<' + subType + '>';
                }
            }).join(', ') + '}';

        case DefType.Array:
            return 'Array<' + (def[0] !== undefined ? _getDefString(def[0]) : '(any)') + '>';

        case DefType.Null:
            return 'null';
            
        case DefType.Boolean:
            return 'Boolean';

        case DefType.Number:
            return 'Number';

        case DefType.String:
            return 'String';

        case DefType.Ommitable:
            return '(ommitable)';

        case DefType.Unknown:
            return String(def);

        default:
            return defType;

        // this should pretty much include def string converstions for all DefType values
        // complex DefType's should build the string recursively
    }
}


/**
 * Validates sourceObject based on validObject's type-tree definition.
 * @param {*} validObject validation object, for example: {a: Number}
 * @param {*} sourceObject the object to validate
 * @returns {Array<string>} Returns an array of errors when given sourceObject did not validate.
 */
function validateObject(validObject, sourceObject) {

    var errors = [];

    function _pushError(current, definition, defType, key) {
        if (key) {
            current =  (current ? current + '.' : '') + key,
            definition = definition[key];
        }

        var expected;

        function _result(expected) {
            var err = `expected ${(expected) + (current ? ' at ' + current : '')}`;
            errors.push(err);
        }

        expected = _getDefString(definition, defType);

        return _result(expected);
    }

    function _getNext(current, next) {
        if (!current) {
            return next || '';
        }
        else if (next) {
            return current + '.' + next;
        }
        else {
            return current;
        }
    }

    function _iterate(source, definition, current, next, returning) {
        current = _getNext(current, next);

        var defType = _getDefType(definition);
        var srcType = _getType(source);

        var valid;

        switch(defType) {
            case DefType.Array:
                if (srcType !== Type.Array) {
                    valid = false;
                }
                else {
                    source.forEach((s, k) => {
                        _iterate(s, definition[0], current + `[${k}]`, null);
                    });
                }
                break;
            case DefType.Options:
                var hasValidOption = definition.findIndex(def => {
                    // must be iterated and return a value w/o pushing the error
                    return _iterate(source, def, current, null, true);
                }) > -1;

                valid = (hasValidOption || definition.includes(DefType.Ommitable))
                break;
            case DefType.Ommitable:
                valid = (source === undefined);
                break;
            case DefType.Object:
                if (srcType !== Type.Object) {
                    valid = false;
                }
                else {
                    if (returning) {
                        valid = Object.keys(definition).map(key => {

                            return _iterate(source[key], definition[key], current, key, true);
                        }).every(v => v === true);
                    }
                    else {
                        Object.keys(definition).forEach(key => {
                        
                            _iterate(source[key], definition[key], current, key);
                        });
                    }
                }
                break;
            case DefType.Number:
            case DefType.String:
            case DefType.Boolean:
            case DefType.Null:
                var validate = Validators[defType];
                valid = validate(source);
                break;
            case DefType.Unknown:
                valid = (source === definition);
                break;
            default:
                valid = false;
        }

        if (returning) {
            return valid;
        }

        if (valid === false) {
            _pushError(current, definition, defType);
        }
    };

    _iterate(sourceObject, validObject);

    return errors.length > 0 ? errors : undefined;
}

module.exports = validateObject;
