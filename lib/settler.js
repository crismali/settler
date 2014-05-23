(function(global) {

  function isFunction(suspect) {
    return typeof suspect === 'function';
  }

  var Settler = {
    lockArgs: function(argsAmount, func) {
      return function() {
        var argsLength = arguments.length;

        if (argsLength === argsAmount) {
          return func.apply(this, arguments);
        } else {
          throw new Error('Expected ' + argsAmount + ' arguments, but was given ' + argsLength);
        }
      };
    },

    multiFunction: function(dispatcher, dispatchees) {
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
    },

    optionalArgs: function(minimum, maximum, func) {
      return function() {
        var argsLength = arguments.length;

        if (argsLength >= minimum && argsLength <= maximum) {
          return func.apply(this, arguments);
        } else {
          throw new Error('Expected ' + minimum + ' to ' + maximum + ' arguments, but received ' + arguments.length);
        }
      };
    }
  };

  global.Settler = Settler;
})(this);
