'use strict';
/**
 * A module that builds the Paf JavaScript files
 * @module js-builder
 */

var promisify = require('promisify-node'),
  glob = require('glob-handler'),
  Q = require('q'),
  fs = require('fs'),
  path = require('path'),
  Karma = require('karma').Server,
  UglifyJS = require('uglify-js2'),
  CLIEngine = require('eslint').CLIEngine,
  mkdirp = promisify('mkdirp'),
  writeFile = promisify(fs.writeFile),
  minify = promisify(UglifyJS.minify),
  builderConf = require(path.normalize(__dirname + '/../.builder.conf.js'))();

exports.build = function render(filesPatterns, opts) {


  var result = {},
      matchedFiles,
      options = opts || {},
      files = filesPatterns || builderConf.defaultGlobPattern,
      mangle = options.mangle || builderConf.mangle,
      out = path.normalize(options.out || builderConf.defaultOutputFile);

  // find matching files
  return glob.getMatchingPaths(files)
    .then(function(filesFoundByGlobPatterns){
      matchedFiles = filesFoundByGlobPatterns;
      result.files = filesFoundByGlobPatterns;
      // lint the files
      return lint(matchedFiles);
    })
    .catch(function(report){
      // reject if there are linting errors
      result.eslint = report;
      return Q.reject(report);
    }).then(function(report) {
      result.eslint = report;
      // run the tests
      return runTests();
    }).then(function(karmaExitCode){
      result.karma = karmaExitCode;
      // minify and mangle the code
      return uglify(matchedFiles, mangle, out);
    }).then(function(uglifyResult){
      result.uglify = uglifyResult;
      // write the javascript and sourcemap to disk
      return writeJavascript(uglifyResult, out);
    }).then(function(){
      console.log(result);
      return Q.resolve(result);
    })
    .catch(function(error) {
      console.log(error);
      return Q.reject(result);
    });
};

////////////////////////// helper methods //////////////////

function lint(files) {
  var cli = new CLIEngine({
      // use the .eslintrc defined in this module
      configFile: path.normalize(__dirname + '/../.eslintrc'),
      ignorePath: path.normalize(__dirname + '/../.eslintignore'),
      noignore : true
    }),
    formatter = cli.getFormatter(),
    junitFormatter = cli.getFormatter('junit'),
    report = cli.executeOnFiles(files); //TODO: ignore test files?

  console.info(formatter(report.results));
  return writeEslintReport(junitFormatter(report.results)).then(function() {
    if (report && (report.errorCount > 0)) { // TODO: when to reject? warnings as well?
      return Q.reject(report);
    }
    return Q.resolve(report);
  });
}
  function writeEslintReport(report) {
    var outFolder = path.join('generated', 'eslint');

    return mkdirp(outFolder)
      .then(function() {
        return writeFile(path.normalize('generated/eslint/TEST-eslint.xml'), report);
      });
  }

function uglify(files, mangle, out) {
  var mapName = path.basename(out, '.js') + '.map';
  try {
    var result = UglifyJS.minify(files,{
      mangle : mangle || true,
      outSourceMap : mapName
    });
  } catch (e) {
    throw Error('failed to uglify the javascript. Error: ' + e);
  }

  return Q.resolve(result);
}

function writeJavascript(js, out){
  var outFolder = path.dirname(out),
      mapFile = path.normalize(outFolder + '/' + JSON.parse(js.map).file);

  return mkdirp(outFolder)
    .then(function() {
      return writeFile(out, js.code);
    }).then(function(){
      return writeFile(mapFile, js.map);
    });
}

//TODO: move this out to different module
function runTests() {
  var config = require(path.normalize(__dirname +'/../karma.conf.js'));
  var newConf = { conf : {}, set : function(data){
    this.conf = data;
  }};
  config(newConf);

  var server = new Karma(newConf.conf, function(exitCode) {
    console.log('Karma has exited with ' + exitCode);
    // process.exit(exitCode);  // TODO: throw Error instead?
    if(exitCode){
      return Q.resolve(process.exit(exitCode));
    }else{

      return Q.reject(process.exit(exitCode));
    }
  });

  server.start();

}
