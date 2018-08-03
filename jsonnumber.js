'use strict';

const stringToString = String.prototype.toString;
const hasStringData = (val) => {
  try {
    stringToString.call(val);
    return true;
  } catch {
    return false;
  }
};
const testString = RegExp.prototype.test.bind(/^-?(?:0|[1-9]\d*)(?:|\.\d+)(?:|[eE][+-]?\d+)$/);
const toString = String;
const isFinite = Number.isFinite;
const isNegZero = Object.is.bind(null, -0);

// NOTE: this intentionally throws the way JSON.stringify would on misconstrued Reflect.construct objects
// e.g. object with [[StringData]] or [[NumberData]] internal slot but incorrect type
const toJSONNumberString = (val) => {
  switch (typeof val) {
    case 'object':
      if (!hasStringData(val)) break;
    case 'string':
      if (!testString(val)) break;
      return toString(val);
    case 'number':
      if (!isFinite) break;
      if (isNegZero(val)) return '-0';
    case 'bigint':
      return toString(val);
  }
  throw TypeError('Not representable as a JSON number');
};

const store = new WeakMap();

const JSONNumber = class {
  constructor(val) {
    store.set(this, toJSONNumberString(val));
  }
  toString() {
    return store.get(this);
  }
};

Object.defineProperty(JSONNumber.prototype, Symbol.toStringTag, {
  configurable: true,
  enumerable: false,
  writable: false,
  value: 'JSONNumber'
});

export default JSONNumber;
