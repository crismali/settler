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
      }).to.throw(/Expected 3 arguments, but was given 2/);
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
});
