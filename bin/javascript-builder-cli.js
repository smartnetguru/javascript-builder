#!/usr/bin/env node

var builder = require('../app/javascript-builder.js');
var program = require('commander');

program
    .arguments('[files...]')
    .usage('[options] [otherFiles...]')
    .option('-o, --outfile <path>', 'The file where to output the javascript file. Default: ./dist/js/out.min.js + ./dist/js/out.min.map')
    .option('-m, --mangle <boolean>', 'defines whether the javascript should be mangled or not')
    .action(function(files, moreFiles){



    })
    .parse(process.argv);

var options = {
  out : program.outfile,
  mangle : program.mangle && program.mangle === "true"
};


  builder.build(program.files, options)
console.log(' args: %j', program.files);

function list(val) {
  return val.split(',');
}
