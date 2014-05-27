(function(global) {

  var slice = [].slice;

  function isFunction(suspect) {
    return typeof suspect === 'function';
  }

  function arrayArgs(func) {
    return function() {
      var args = slice.call(arguments);
      return func.call(this, args);
    };
  }

  function multiFunction(dispatcher, dispatchees) {
    return function() {
      var result = dispatcher.apply(this, arguments);

      if (dispatchees.hasOwnProperty(result)) {
        var dispatchee = dispatchees[result];

        if (isFunction(dispatchee)) {
          return dispatchee.apply(this, arguments);
        } else {
          return dispatchee;
        }
      } else {
        throw new Error('Dispatch function failed to find a result');
      }
    };
  }

  var Settler = {
    lockArgs: function(argsAmount, func) {
      return function() {
        var argsLength = arguments.length;

        if (argsLength === argsAmount) {
          return func.apply(this, arguments);
        } else {
          throw new Error('Expected ' + argsAmount + ' arguments, but received ' + argsLength);
        }
      };
    },

    multiFunction: multiFunction,

    optionalArgs: function(minimum, maximum, func) {
      return function() {
        var argsLength = arguments.length;

        if (argsLength >= minimum && argsLength <= maximum) {
          return func.apply(this, arguments);
        } else {
          throw new Error('Expected ' + minimum + ' to ' + maximum + ' arguments, but received ' + argsLength);
        }
      };
    },

    defaultArgs: function(defaults, func) {
      return function() {
        var args = slice.call(arguments);
        var neededDefaults = defaults.slice(args.length, defaults.length);
        return func.apply(this, args.concat(neededDefaults));
      };
    },

    normalizeArgs: function(normalizer, func) {
      return function() {
        var args = normalizer.apply(this, arguments);
        return func.apply(this, args);
      };
    },

    globalize: function() {
      for (var methodName in Settler) {
        if (Settler.hasOwnProperty(methodName) &&
          isFunction(Settler[methodName]) &&
          methodName !== 'globalize') {

          global[methodName] = Settler[methodName];
        }
      }
    },

    arrayArgs: arrayArgs,

    byArgsLength: arrayArgs(function(args) {
      return multiFunction(function() {
        return arguments.length;
      }, args);
    })
  };

  global.Settler = Settler;
})(this);
