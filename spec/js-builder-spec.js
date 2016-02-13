var os = require('os'),
  path = require('path'),
  Q = require('q'),
  rewire = require('rewire'),
  builder = rewire('../app/javascript-builder.js'),
  TMP_DIR = os.tmpdir(),
  OUT_DIR = path.join(TMP_DIR, 'javascript-builder');

builder.__set__('runTests', function() {
  // bypassing the run tests when testing
  return Q.resolve('somedata');
});

describe('javascript-builder', function() {

  beforeEach(function() {
    spyOn(builder, 'build').andCallThrough();
  });

  xit('should return the eslint count and continue to running tests', function(done) {
    builder.build(['spec/test-files/1.js']).then(function(result) {
      expect(result.eslint.errorCount).toBe(0);
      expect(result.eslint.warningCount).toBe(0);
      expect(result.karma).toEqual('somedata');
      done();
    });
  });

  it('should return the eslint count and continue not continue to run tests when warnings and errors- glob', function(done) {
    builder.build(['spec/*/!(test-with-warnings).js']).catch(function(result) {
      expect(result.eslint.errorCount).toBe(494);
      expect(result.eslint.warningCount).toBe(640);
      expect(result.karma).not.toBeDefined();
      done();
    });
  });

  xit('should return the eslint count and continue not continue to run tests when warnings and errors- glob', function(done) {
    builder.build(['spec/*/!(1-test|test-with-warnings|3).js']).then(function(result) {
      expect(result.eslint.errorCount).toBe(0);
      expect(result.eslint.warningCount).toBe(0);
      expect(result.karma).toBe('somedata');
      done();
    });
  });

});
