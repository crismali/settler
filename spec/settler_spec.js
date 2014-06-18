describe('Settler', function() {
  var subject;
  var noop;
  var addTwo;
  var contextFunc;
  var obj;
  var argify;

  beforeEach(function() {
    noop = function() {};
    addTwo = function(x) {
      return x + 2;
    };
    contextFunc = function() {
      this.worked = true;
    };

    argify = function() {
      return arguments;
    };
  });

  afterEach(function() {
    window.worked = false;
  });

  it('is an object', function() {
    expect(Settler).to.be.object;
  });

  describe('exactly', function() {
    var exactly;

    beforeEach(function() {
      exactly = Settler.exactly;
      subject = exactly;
    });

    it('throws an error when passed neither a function or arguments', function() {
      expect(function() {
        subject(1, 3);
      }).to.throw(/Expected arguments object or a function as its last argument but received a number/);
    });

    describe('validator', function() {
      it('no ops when given the correct arguments', function() {
        expect(function() { subject(2, argify(1, 2)); }).to.not.throw();
      });

      it('returns undefined when given the correct number of arguments', function() {
        expect(subject(1, argify(1))).to.be.undefined;
      });

      it('throws an error if fewer args are provided than the minimum', function() {
        expect(function() {
          subject(2, argify(1));
        }).to.throw(/Expected 2 arguments, but received 1/);
      });

      it('throws an error if too many args are provided', function() {
        expect(function() {
          subject(2, argify(1, 2, 3));
        }).to.throw(/Expected 2 arguments, but received 3/);
      });
    });

    describe('wrapper function', function() {
      beforeEach(function() {
        subject = exactly(3, noop);
      });

      it('returns a function that throws an error if the number of arguments is incorrect', function() {
        expect(function() {
          subject('foo', 'bar');
        }).to.throw(/Expected 3 arguments, but received 2/);
      });

      it('executes the function when given the correct number of arguments', function() {
        expect(function() {
          subject('foo', 'bar', 'baz');
        }).to.not.throw();
      });

      it('executes the function in the appropriate context', function() {
        subject = {
          worked: false,
          work: exactly(0, contextFunc)
        };
        subject.work();
        expect(subject.worked).to.equal(true);
      });
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

  describe('between', function() {
    var between;

    beforeEach(function() {
      between = Settler.between;
      subject = between;
    });

    it('throws an error when passed neither a function or arguments', function() {
      expect(function() {
        subject(1, 2, 3);
      }).to.throw(/Expected arguments object or a function as its last argument but received a number/);
    });

    describe('validator', function() {
      it('no ops when given the correct arguments', function() {
        expect(function() { subject(2, 4, argify(1, 2, 3, 4)); }).to.not.throw();
        expect(function() { subject(2, 4, argify(1, 2, 3)); }).to.not.throw();
        expect(function() { subject(2, 4, argify(1, 2)); }).to.not.throw();
      });

      it('returns undefined when given the correct number of arguments', function() {
        expect(subject(1, 2, argify(1))).to.be.undefined;
      });

      it('throws an error if fewer args are provided than the minimum', function() {
        expect(function() {
          subject(2, 4, argify(1));
        }).to.throw(/Expected 2 to 4 arguments, but received 1/);
      });

      it('throws an error if too many args are provided', function() {
        expect(function() {
          subject(2, 4, argify(1, 2, 3, 4, 5));
        }).to.throw(/Expected 2 to 4 arguments, but received 5/);
      });
    });

    describe('wrapper function', function() {
      beforeEach(function() {
        obj = { subject: between(2, 4, contextFunc) };
        subject = between(2, 4, noop);
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
          between(1, 2);
        }).to.throw(/Expected 3 arguments, but received 2/);
      });

      it('throws an error if given more than 3 arguments', function() {
        expect(function() {
          between(1, 2, 3, 4);
        }).to.throw(/Expected 3 arguments, but received 4/);
      });
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

    it('invokes default functions and uses the return value', function() {
      subject = defaultArgs([function() {
        return { bar: 'baz' };
      }], function(foo) {
        return foo.bar;
      });
      expect(subject()).to.equal('baz');
    });

    it('invokes default functions in the appropriate context', function() {
      subject = defaultArgs([contextFunc], addTwo);
      obj = { subject: subject };
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

  describe('atLeast', function() {
    var atLeast;

    beforeEach(function() {
      atLeast = Settler.atLeast;
      subject = atLeast;
    });

    it('throws an error when passed neither a function or arguments', function() {
      expect(function() {
        subject(1, 2);
      }).to.throw(/Expected arguments object or a function as its last argument but received a number/);
    });

    describe('validator', function() {
      it('throws an error if too few arguments are given', function() {
        expect(function() {
          subject(2, argify(1));
        }).to.throw(/Expected at least 2 arguments, but received 1/);
      });

      it('does not throw an error if the minimum number of arguments is given', function() {
        expect(function() { subject(2, argify(1, 2)); }).to.not.throw();
      });
    });

    describe('wrapper function', function() {
      beforeEach(function() {
        subject = atLeast(2, function() {
          contextFunc.apply(this, arguments);
          return true;
        });
        obj = { subject: subject };
      });

      it('throws an error if too few arguments are given', function() {
        expect(function() {
          subject(1);
        }).to.throw(/Expected at least 2 arguments, but received 1/);
      });

      it('does not throw an error if the minimum number of arguments is given', function() {
        expect(function() { subject(1, 2); }).to.not.throw();
      });

      it('executes the function in the correct context', function() {
        obj.subject(1, 2);
        expect(obj.worked).to.equal(true);
      });

      it('returns the return value of the function', function() {
        expect(subject(1, 2)).to.equal(true);
      });
    });
  });

  describe('atMost', function() {
    var atMost;

    beforeEach(function() {
      atMost = Settler.atMost;
      subject = atMost;
    });

    it('throws an error when passed neither a function or arguments', function() {
      expect(function() {
        subject(1, 2);
      }).to.throw(/Expected arguments object or a function as its last argument but received a number/);
    });

    describe('validator', function() {
      it('throws an error if too many arguments are given', function() {
        expect(function() {
          subject(2, argify(1, 2, 3));
        }).to.throw(/Expected at most 2 arguments, but received 3/);
      });

      it('does not throw an error if the maximum number of arguments is given', function() {
        expect(function() { subject(2, argify(1, 2)); }).to.not.throw();
      });
    });

    describe('wrapper function', function() {
      beforeEach(function() {
        subject = atMost(2, function() {
          contextFunc.apply(this, arguments);
          return true;
        });
        obj = { subject: subject };
      });

      it('throws an error if too many arguments are given', function() {
        expect(function() {
          subject(1, 2, 3);
        }).to.throw(/Expected at most 2 arguments, but received 3/);
      });

      it('does not throw an error if the maximum number of arguments is given', function() {
        expect(function() {
          subject(1, 2);
        }).to.not.throw();
      });

      it('executes the function in the correct context', function() {
        obj.subject(1, 2);
        expect(obj.worked).to.equal(true);
      });

      it('returns the return value of the function', function() {
        expect(subject(1, 2)).to.equal(true);
      });
    });
  });

  describe('defaultsBetween', function() {
    var defaultsBetweeen;
    var spy;
    var args;

    beforeEach(function() {
      defaultsBetweeen = Settler.defaultsBetweeen;
      spy = function() {
        args = arguments;
        return true;
      };
      var defaults = [5, function() { return { foo: 'bar' } }];
      subject = defaultsBetweeen(2, defaults, spy);
    });

    it('throws an error if passed too few arguments', function() {
      expect(function() { subject(1); }).to.throw(/Expected 2 to 4 .*received 1/);
    });

    it('throws an error if passed too many arguments', function() {
      expect(function() { subject(1, 2, 3, 4, 5); }).to.throw(/Expected 2 to 4 .*received 5/);
    });

    it('returns the return value of the function', function() {
      expect(subject(1, 2)).to.equal(true);
    });

    it('passes in default arguments where specified', function() {
      subject(1, 2);
      expect(args[2]).to.equal(5);
    });

    it('invokes default functions and uses the result as the default', function() {
      subject(1, 2, 3);
      expect(args[2]).to.equal(3);
      expect(args[3]).to.be.like({ foo: 'bar' });
    });

    describe('appropriate context', function() {
      var obj;

      beforeEach(function() {
        obj = {};
        obj.subject = defaultsBetweeen(1, [function(){ this.foo = true; }], contextFunc);
      });

      it('executes the passed in function', function() {
        obj.subject(1);
        expect(obj.foo).to.equal(true);
      });

      it('executes the default function', function() {
        obj.subject(1, 2);
        expect(obj.worked).to.equal(true);
      });
    });
  });

  describe('withOptions', function() {
    var withOptions;
    var args;

    beforeEach(function() {
      withOptions = Settler.withOptions;
      subject = withOptions(3, function() {
        args = arguments;
        return true;
      });
    });

    it('throws an error when called with too few options', function() {
      expect(function() { subject(1); }).to.throw(/Expected 2 to 3.*received 1/);
    });

    it('throws an error when called with too many options', function() {
      expect(function() { subject(1, 2, 3, 4); }).to.throw(/Expected 2 to 3.*received 4/);
    });

    it('returns the return value of the function', function() {
      expect(subject(1, 2)).to.equal(true);
    });

    it('passes in an empty object as the last argument if no argument was provided', function() {
      subject(1, 2);
      expect(args[2]).to.be.like({});
    });

    it('allows the options object to be passed in', function() {
      subject(1, 2, 3);
      expect(args[2]).to.equal(3);
    });

    it('executes the function in the correct context', function() {
      var obj = { subject: contextFunc };
      obj.subject(1, 2);
      expect(obj.worked).to.equal(true);
    });
  });

  describe('justOptions', function() {
    var justOptions;
    var arg;

    beforeEach(function() {
      justOptions = Settler.justOptions;
      subject = justOptions(function(options) {
        arg = options;
        return true;
      });
    });

    it('throws an error when called with more than one arguments', function() {
      expect(function() { subject(1, 2); }).to.throw(/Expected 0 to 1.*received 2/);
    });

    it('returns the return value of the function', function() {
      expect(subject(1)).to.equal(true);
    });

    it('passes in an empty object as the argument if no argument was provided', function() {
      subject();
      expect(arg).to.be.like({});
    });

    it('allows the options object to be passed in', function() {
      subject(1);
      expect(arg).to.equal(1);
    });

    it('executes the function in the correct context', function() {
      var obj = { subject: contextFunc };
      obj.subject(1);
      expect(obj.worked).to.equal(true);
    });

    it('is aliased to onlyOptions', function() {
      expect(Settler.onlyOptions).to.equal(justOptions);
    });
  });

  describe('strictlyTyped', function() {
    var strictlyTyped;
    beforeEach(function() {
      strictlyTyped = Settler.strictlyTyped;
      subject = strictlyTyped;
    });

    describe('validator', function() {
      it('throws an error when given less types than arguments', function() {
        expect(function() {
          subject([Number, Array], argify(1));
        }).to.throw(/Expected 2 arguments, but received 1/);
      });

      it('throws an error when given more/less types than arguments', function() {
        expect(function() {
          subject([Number, Array], argify(1, 2, 3));
        }).to.throw(/Expected 2 arguments, but received 3/);
      });

      it('throws an error when given the wrong type of argument', function() {
        expect(function() {
          subject([Number, Object], argify(5, []));
        }).to.throw(/Expected Object, but received Array as the 2nd argument/);
      });

      it('does not throw an error when given the correct type of argument', function() {
        expect(function() { subject([Object, String, Number], argify({}, '', 0)); }).to.not.throw();
      });

      it('throws an error when given undefined', function() {
        expect(function() {
          subject([Object], argify(undefined));
        }).to.throw(/Expected Object, but received undefined as the 1st argument/);
      });

      it('throws an error when given null', function() {
        expect(function() {
          subject([Object], argify(null));
        }).to.throw(/Expected Object, but received null as the 1st argument/);
      });

      it('throws an error when given NaN', function() {
        expect(function() {
          subject([Number], argify(NaN));
        }).to.throw('Expected Number, but received NaN as the 1st argument');
      });

      it('throws a useful error when given unnamed types', function() {
        expect(function() {
          subject([function(){}], argify(new function(){}));
        }).to.throw(/Expected Unnamed Type, but received Unnamed Type as the 1st argument/);
      });
    });

    describe('wrapper function', function() {
      beforeEach(function() {
        subject = strictlyTyped([Number, Array], noop);
      });

      it('throws an error when given less types than arguments', function() {
        expect(function() {
          subject(1);
        }).to.throw(/Expected 2 arguments, but received 1/);
      });

      it('throws an error when given more/less types than arguments', function() {
        expect(function() {
          subject(1, 2, 3);
        }).to.throw(/Expected 2 arguments, but received 3/);
      });

      it('throws an error when given the wrong type of argument', function() {
        expect(function() {
          subject(5, {});
        }).to.throw(/Expected Array, but received Object as the 2nd argument/);
      });

      it('does not throw an error when given the correct type of argument', function() {
        expect(function() { subject(5, []); }).to.not.throw();
      });

      it('executes the function in the correct context', function() {
        subject = strictlyTyped([Object], contextFunc);
        var obj = { subject: subject };
        obj.subject({});
        expect(obj.worked).to.equal(true);
      });

      it('returns the return value of the function', function() {
        subject = strictlyTyped([Object], function() { return 5; });
        expect(subject({})).to.equal(5);
      });
    });
  });

  describe('globalize', function() {
    beforeEach(function() {
      var globalize = Settler.globalize;
      globalize();
    });

    afterEach(function() {
      [
        'exactly',
        'multiFunction',
        'between',
        'defaultArgs',
        'defaultsBetweeen',
        'options',
        'normalizeArgs',
        'atMost',
        'atLeast',
        'arrayArgs'
      ].forEach(function(methodName) {
        delete window[methodName];
      });
    });

    it('injects all settler functions into the global context', function() {
      expect(window.exactly).to.equal(Settler.exactly);
      expect(window.multiFunction).to.equal(Settler.multiFunction);
      expect(window.between).to.equal(Settler.between);
      expect(window.defaultArgs).to.equal(Settler.defaultArgs);
      expect(window.defaultsBetweeen).to.equal(Settler.defaultsBetweeen);
      expect(window.options).to.equal(Settler.options);
      expect(window.normalizeArgs).to.equal(Settler.normalizeArgs);
      expect(window.atMost).to.equal(Settler.atMost);
      expect(window.atLeast).to.equal(Settler.atLeast);
      expect(window.arrayArgs).to.equal(Settler.arrayArgs);
    });

    it('does not inject the globalize method', function() {
      expect(window.globalize).to.not.equal(Settler.globalize);
    });
  });
});
