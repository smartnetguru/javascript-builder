
module.exports = function(){
  return {
      defaultGlobPattern : ['./!(node_modules|dist)/**/*!(-test).js'],
      defaultOutputFile : 'dist/js/out.min.js',
      mangle : true

  };
};
