var shit;
(function() {
  var global = this;

  // Private functions start here
  var slice = [].slice;
  var toString = {}.toString;

  function isFunction(suspect) {
    return typeof suspect === 'function';
  }

  function isNumber(suspect) {
    return typeof suspect === 'number';
  }

  function isObject(suspect) {
    return typeof suspect === 'object';
  }

  function isArguments(value) { // borrowed from lodash, slightly modified
    return value && isObject(value) && isNumber(value.length) &&
      toString.call(value) === '[object Arguments]' || false;
  }

  function newObject() {
    return {};
  }

  function errorMessage(message, argsLength) {
    return 'Expected ' + message + ' arguments, but received ' + argsLength;
  }

  function invokeOrReturn(context, suspect, args) {
    if (isFunction(suspect)) {
      return suspect.apply(context, args);
    } else {
      return suspect;
    }
  }

  function argumentsLength() {
    return arguments.length;
  }
  // Private functions end here

  function validateBetween(minimum, maximum, args) {
    var argsLength = args.length;
    if (argsLength < minimum || argsLength > maximum) {
      var message = minimum === maximum ? minimum : minimum + ' to ' + maximum;
      throw new Error(errorMessage(message, argsLength));
    }
  }

  function betweenFunction(minimum, maximum, func) {
    return function() {
      validateBetween(minimum, maximum, arguments);
      return func.apply(this, arguments);
    };
  }

  function between(minimum, maximum, suspect) {
    if (arguments.length !== 3) {
      throw new Error(errorMessage(3, arguments.length));
    }

    if (isArguments(suspect)) {
      validateBetween.apply(null, arguments);
    } else if (isFunction(suspect)) {
      return betweenFunction.apply(null, arguments);
    } else {
      throw new Error('Expected arguments object or a function ' +
        'as the third argument but received a ' + typeof suspect);
    }
  }

  function exactly(argsAmount, suspect) {
    between(2, 2, arguments);
    return between(argsAmount, argsAmount, suspect);
  }

  function arrayArgs(func) {
    exactly(1, arguments);

    return function() {
      var args = slice.call(arguments);
      return func.call(this, args);
    };
  }

  function defaultArgs(defaults, func) {
    exactly(2, arguments);

    return arrayArgs(function(args) {
      var context = this;
      var neededDefaults = defaults.slice(args.length, defaults.length);

      neededDefaults = neededDefaults.map(function(defaultValue) {
        return invokeOrReturn(context, defaultValue);
      });
      return func.apply(this, args.concat(neededDefaults));
    });
  }

  function defaultsBetweeen(minimum, defaults, func) {
    exactly(3, arguments);

    var maximum = minimum + defaults.length;

    for (var i = 0; i < minimum; i++) {
      defaults.unshift(null);
    }
    return between(minimum, maximum, defaultArgs(defaults, func));
  }

  function multiFunction(dispatcher, dispatchees) {
    exactly(2, arguments);

    return function() {
      var result = dispatcher.apply(this, arguments);

      if (dispatchees.hasOwnProperty(result)) {
        var dispatchee = dispatchees[result];
        return invokeOrReturn(this, dispatchee, arguments);
      } else {
        throw new Error('Dispatch function failed to find a result');
      }
    };
  }

  var byArgsLength = arrayArgs(function(args) {
    return multiFunction(argumentsLength, args);
  });

  function atLeast(minimum, func) {
    exactly(2, arguments);

    return function() {
      var argsLength = arguments.length;

      if (argsLength < minimum) {
        throw new Error(errorMessage('at least ' + minimum, argsLength));
      } else {
        return func.apply(this, arguments);
      }
    };
  }

  function atMost(maximum, func) {
    exactly(2, arguments);

    return function() {
      var argsLength = arguments.length;

      if (argsLength > maximum) {
        throw new Error(errorMessage('at most ' + maximum, argsLength));
      } else {
        return func.apply(this, arguments);
      }
    };
  }

  function normalizeArgs(normalizer, func) {
    exactly(2, arguments);

    return function() {
      var args = normalizer.apply(this, arguments);
      return func.apply(this, args);
    };
  }

  function withOptions(total, func) {
    exactly(2, arguments);

    return defaultsBetweeen(total - 1, [newObject], func);
  }

  function justOptions(func) {
    exactly(1, arguments);

    return withOptions(1, func);
  }

  var Settler = {
    arrayArgs: arrayArgs,

    atLeast: atLeast,

    atMost: atMost,

    between: between,

    byArgsLength: byArgsLength,

    defaultArgs: defaultArgs,

    defaultsBetweeen: defaultsBetweeen,

    exactly: exactly,

    justOptions: justOptions,

    multiFunction: multiFunction,

    normalizeArgs: normalizeArgs,

    onlyOptions: justOptions, // alias

    withOptions: withOptions,

    globalize: function() {
      exactly(0, arguments);

      for (var methodName in Settler) {
        if (Settler.hasOwnProperty(methodName) &&
          isFunction(Settler[methodName]) &&
          methodName !== 'globalize') {

          global[methodName] = Settler[methodName];
        }
      }
    }
  };

  // `typeof` must be used here instead of an `isUndefined` helper
  // to prevent a ReferenceError
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Settler;
    }
    exports.Settler = Settler;
  } else {
    global.Settler = Settler;
  }

  if (typeof define === 'function' && define.amd) {
    define('settler', [], function() {
      return Settler;
    });
  }
})();
