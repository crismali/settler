describe('Settler', function() {
  var subject;
  var noop;
  var add;

  beforeEach(function() {
    noop = function() {};
    add = function(x, y) {
      return x + y;
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
        work: lockArgs(0, function() {
          this.worked = true;
        })
      };
      subject.work();
      expect(subject.worked).to.equal(true);
    });
  });
});
