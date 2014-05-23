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
          throw new Error("Expected " + argsAmount + " arguments, but was given " + argsLength);
        }
      };
    },

    multiFunction: function(dispatcher, results) {
      return function() {
        var testResult = dispatcher.apply(this, arguments);
        var dispatchee = results[testResult];

        if (results.hasOwnProperty(testResult)) {
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
  };

  global.Settler = Settler;
})(this);
