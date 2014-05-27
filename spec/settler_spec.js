describe('Settler', function() {
  var subject;
  var noop;
  var addTwo;
  var contextFunc;
  var obj;

  beforeEach(function() {
    noop = function() {};
    addTwo = function(x) {
      return x + 2;
    };
    contextFunc = function() {
      this.worked = true;
    };
  });

  it('is an object', function() {
    expect(Settler).to.be.object;
  });

  describe('lockArgs', function() {
    var lockArgs;
    var lockedFunc;

    beforeEach(function() {
      lockArgs = Settler.lockArgs;
      lockedFunc = lockArgs(3, noop);
    });

    it('returns a function that throws an error if the number of arguments is incorrect', function() {
      expect(function() {
        lockedFunc('foo', 'bar');
      }).to.throw(/Expected 3 arguments, but received 2/);
    });

    it('executes the function when given the correct number of arguments', function() {
      expect(function() {
        lockedFunc('foo', 'bar', 'baz');
      }).to.not.throw();
    });

    it('executes the function in the appropriate context', function() {
      subject = {
        worked: false,
        work: lockArgs(0, contextFunc)
      };
      subject.work();
      expect(subject.worked).to.equal(true);
    });
  });

  describe('multiFunction', function() {
    var multiFunction;
    var results;
    var dispatcher;

    beforeEach(function() {
      multiFunction = Settler.multiFunction;
      dispatcher = function(arg) {
        this.lastArgType = typeof arg;
        return this.lastArgType;
      };
      results = {
        'undefined': 'foo',
        string: function(arg) {
          return arg.trim();
        },
        number: addTwo,
        object: contextFunc
      };

      subject = multiFunction(dispatcher, results);
      obj = { subject: subject };
    });

    it('executes the result function based on the return value of the dispatch function', function() {
      expect(subject('   foo   ')).to.equal('foo');
      expect(subject(2)).to.equal(4);
    });

    it('throws an error when there is no result function', function() {
      expect(function() {
        subject(noop);
      }).to.throw(/Dispatch function failed to find a result/);
    });

    it('returns the result when it is not a function', function() {
      expect(subject(undefined)).to.equal('foo');
    });

    it('executes the dispatch function in the correct context', function() {
      obj.subject({});
      expect(obj.lastArgType).to.equal('object');
    });

    it('executes the result function in the correct context', function() {
      obj.subject({});
      expect(obj.worked).to.equal(true);
    });
  });

  describe('optionalArgs', function() {
    var optionalArgs;

    beforeEach(function() {
      optionalArgs = Settler.optionalArgs;
      obj = { subject: optionalArgs(2, 4, contextFunc) };
      subject = optionalArgs(2, 4, noop);
    });

    it('executes the function if the number of args is in range', function() {
      expect(function() { subject(1, 2); } ).to.not.throw();
      expect(function() { subject(1, 2, 3); } ).to.not.throw();
      expect(function() { subject(1, 2, 3, 4); } ).to.not.throw();
    });

    it('throws an error if fewer args are provided than the minimum', function() {
      expect(function() {
        subject(1);
      }).to.throw(/Expected 2 to 4 arguments, but received 1/);
    });

    it('throws an error if too many args are provided', function() {
      expect(function() {
        subject(1, 2, 3, 4, 5);
      }).to.throw(/Expected 2 to 4 arguments, but received 5/);
    });

    it('executes the function in the correct context', function() {
      obj.subject(1, 2);
      expect(obj.worked).to.equal(true);
    });

    it('throws an error if given less than 3 arguments', function() {
      expect(function() {
        optionalArgs(1, 2);
      }).to.throw(/Expected 3 arguments, but received 2/);
    });

    it('throws an error if given more than 3 arguments', function() {
      expect(function() {
        optionalArgs(1, 2, 3, 4);
      }).to.throw(/Expected 3 arguments, but received 4/);
    });
  });

  describe('defaultArgs', function() {
    var defaultArgs;

    beforeEach(function() {
      defaultArgs = Settler.defaultArgs;
      subject = defaultArgs([1, 2, 3], function(x, y, z) {
        this.worked = true;
        return x + y + z;
      });
      obj = { subject: subject };
    });

    it('uses the defaults if no arguments are provided', function() {
      expect(subject()).to.equal(6);
      expect(subject(2)).to.equal(7);
      expect(subject(2, 3)).to.equal(8);
      expect(subject(2, 3, 4)).to.equal(9);
      expect(subject(2, 3, 4, 5)).to.equal(9);
      expect(subject(2, undefined, 4).toString()).to.equal('NaN');
    });

    it('executes the function in the proper context', function() {
      obj.subject();
      expect(obj.worked).to.equal(true);
    });
  });

  describe('normalizeArgs', function() {
    var normalizeArgs;

    beforeEach(function() {
      normalizeArgs = Settler.normalizeArgs;
      var normalizer = function() {
        this.normalizerRan = true;
        return [1, 2, 3];
      };
      var func = function(one, two, three) {
        this.worked = true;
        return one + two + three;
      };
      subject = normalizeArgs(normalizer, func);
      obj = { subject: subject };
    });

    it('applies the results of the normalizer to the function', function() {
      expect(subject()).to.equal(6);
    });

    it('executes the normalizer in the correct context', function() {
      obj.subject();
      expect(obj.normalizerRan).to.equal(true);
    });

    it('executes the function in the correct context', function() {
      obj.subject();
      expect(obj.worked).to.equal(true);
    });
  });

  describe('globalize', function() {
    beforeEach(function() {
      var globalize = Settler.globalize;
      globalize();
    });

    afterEach(function() {
      [
        'lockArgs',
        'multiFunction',
        'optionalArgs',
        'defaultArgs',
        'normalizeArgs'
      ].forEach(function(methodName) {
        delete window[methodName];
      });
    });

    it('injects all settler functions into the global context', function() {
      expect(window.lockArgs).to.equal(Settler.lockArgs);
      expect(window.multiFunction).to.equal(Settler.multiFunction);
      expect(window.optionalArgs).to.equal(Settler.optionalArgs);
      expect(window.defaultArgs).to.equal(Settler.defaultArgs);
      expect(window.normalizeArgs).to.equal(Settler.normalizeArgs);
    });

    it('does not inject the globalize method', function() {
      expect(window.globalize).to.not.equal(Settler.globalize);
    });
  });

  describe('arrayArgs', function() {
    var arrayArgs;
    var isArray;

    beforeEach(function() {
      arrayArgs = Settler.arrayArgs;
      isArray = function(array) {
        this.worked = true;
        return array.constructor === Array;
      };
      subject = arrayArgs(isArray);
      obj = { subject: subject };
    });

    it('calls the function with a real array of arguments (one argument)', function() {
      expect(subject()).to.equal(true);
      expect(subject(1, 2)).to.equal(true);
    });

    it('calls the function in the proper context', function() {
      obj.subject();
      expect(obj.worked).to.equal(true);
    });
  });

  describe('byArgsLength', function() {
    var byArgsLength;
    var firstFunc;
    var secondFunc;

    beforeEach(function() {
      byArgsLength = Settler.byArgsLength;
      firstFunc = function() { return true; };
      secondFunc = function() { return false; };
      subject = byArgsLength(firstFunc, secondFunc, 'foo', contextFunc);
      obj = { subject: subject };
    });

    it('dispatches to functions according to the length of the arguments passed in', function() {
      expect(subject()).to.equal(true);
      expect(subject(1)).to.equal(false);
      expect(subject(1, 2)).to.equal('foo');
      expect(function() {
        subject(1, 2, 3);
      }).to.not.throw();
    });

    it('throws an error if there are too many arguments', function() {
      expect(function() {
        subject(1, 2, 3, 4);
      }).to.throw();
    });

    it('executes the function in the correct context', function() {
      obj.subject(1, 2, 3);
      expect(obj.worked).to.equal(true);
    });
  });
});
