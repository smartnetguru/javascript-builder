
module.exports = function(){
  return {
      defaultGlobPattern : ['./!(node_modules|dist)/**/*.html'],
      defaultExcludePattern : ['.*-test.js$','.*-spec.js$'],
      defaultOutputFolder : 'dist/js'
  };
};
