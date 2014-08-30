var program = require('commander');
var Processor = require('./');

program
  .version('0.0.1')
  .option('-c, --config <name>', 'Config name for csscomb')
  .option('-p, --path <path>', 'Path to file or directory with stylus files')
  .parse(process.argv);

var processor = program.config ? new Processor(program.config) : new Processor();

if (program.path) {
    processor.process(program.path)
        .then(function () {
            console.log('path processed');
        }, function (error) {
            console.log(error);
        });
}
