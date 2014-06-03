(function(global) {

  var slice = [].slice;

  function isFunction(suspect) {
    return typeof suspect === 'function';
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

    defaultArgs: exactly(2, function(defaults, func) {
      return arrayArgs(function(args) {
        var context = this;
        var neededDefaults = defaults.slice(args.length, defaults.length);

        neededDefaults = neededDefaults.map(function(defaultValue) {
          return invokeOrReturn(context, defaultValue);
        });
        return func.apply(this, args.concat(neededDefaults));
      });
    }),

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

    byArgsLength: arrayArgs(function(args) {
      return multiFunction(function() {
        return arguments.length;
      }, args);
    }),

    atLeast: exactly(2, function(minimum, func) {
      return function() {
        var argsLength = arguments.length;

        if (argsLength < minimum) {
          throw new Error(errorMessage('at least ' + minimum, argsLength));
        } else {
          func.apply(this, arguments);
        }
      };
    }),

    atMost: exactly(2, function(maximum, func) {
      return function() {
        var argsLength = arguments.length;

        if (argsLength > maximum) {
          throw new Error(errorMessage('at most ' + maximum, argsLength));
        } else {
          func.apply(this, arguments);
        }
      };
    })
  };

  global.Settler = Settler;
})(this);
