module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers : ['PhantomJS'],
    files: [
      './!(node_modules|dist)/**/!(*-test).js',
      // './node_modules/js-builder/node_modules/angular-mocks/angular-mocks.js', //breaks due to "TypeError: Attempted to assign to readonly property"
      './!(node_modules|dist)/**/*-test.js',

    ],
    exclude: [
      './(node_modules|dist)/**/*.js',
    ],
    preprocessors: {

    },
    singleRun : true
  });
};
