(function() {
  var global = this;

  var slice = [].slice;

  function isFunction(suspect) {
    return typeof suspect === 'function';
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

  function between(minimum, maximum, func) {
    if (arguments.length !== 3) {
      throw new Error(errorMessage(3, arguments.length));
    }

    return function() {
      var argsLength = arguments.length;

      if (argsLength >= minimum && argsLength <= maximum) {
        return func.apply(this, arguments);
      } else {
        var message = minimum === maximum ? minimum : minimum + ' to ' + maximum;
        throw new Error(errorMessage(message, argsLength));
      }
    };
  }

  var exactly = between(2, 2, function(argsAmount, func) {
    return between(argsAmount, argsAmount, func);
  });

  var defaultArgs = exactly(2, function(defaults, func) {
    return arrayArgs(function(args) {
      var context = this;
      var neededDefaults = defaults.slice(args.length, defaults.length);

      neededDefaults = neededDefaults.map(function(defaultValue) {
        return invokeOrReturn(context, defaultValue);
      });
      return func.apply(this, args.concat(neededDefaults));
    });
  });

  var defaultsBetweeen = exactly(3, function(minimum, defaults, func) {
    var maximum = minimum + defaults.length;

    for (var i = 0; i < minimum; i++) {
      defaults.unshift(null);
    }
    return between(minimum, maximum, defaultArgs(defaults, func));
  });

  var arrayArgs = exactly(1, function(func) {
    return function() {
      var args = slice.call(arguments);
      return func.call(this, args);
    };
  });

  var multiFunction = exactly(2, function(dispatcher, dispatchees) {
    return function() {
      var result = dispatcher.apply(this, arguments);

      if (dispatchees.hasOwnProperty(result)) {
        var dispatchee = dispatchees[result];
        return invokeOrReturn(this, dispatchee, arguments);
      } else {
        throw new Error('Dispatch function failed to find a result');
      }
    };
  });

  var Settler = {
    exactly: exactly,

    multiFunction: multiFunction,

    between: between,

    defaultArgs: defaultArgs,

    defaultsBetweeen: defaultsBetweeen,

    normalizeArgs: exactly(2, function(normalizer, func) {
      return function() {
        var args = normalizer.apply(this, arguments);
        return func.apply(this, args);
      };
    }),

    globalize: exactly(0, function() {
      for (var methodName in Settler) {
        if (Settler.hasOwnProperty(methodName) &&
          isFunction(Settler[methodName]) &&
          methodName !== 'globalize') {

          global[methodName] = Settler[methodName];
        }
      }
    }),

    arrayArgs: arrayArgs,

    options: exactly(2, function(total, func) {
      return defaultsBetweeen(total - 1, [newObject], func);
    }),

    byArgsLength: arrayArgs(function(args) {
      return multiFunction(argumentsLength, args);
    }),

    atLeast: exactly(2, function(minimum, func) {
      return function() {
        var argsLength = arguments.length;

        if (argsLength < minimum) {
          throw new Error(errorMessage('at least ' + minimum, argsLength));
        } else {
          return func.apply(this, arguments);
        }
      };
    }),

    atMost: exactly(2, function(maximum, func) {
      return function() {
        var argsLength = arguments.length;

        if (argsLength > maximum) {
          throw new Error(errorMessage('at most ' + maximum, argsLength));
        } else {
          return func.apply(this, arguments);
        }
      };
    })
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
