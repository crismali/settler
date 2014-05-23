(function(global) {
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
    }
  };

  global.Settler = Settler;
})(this);
