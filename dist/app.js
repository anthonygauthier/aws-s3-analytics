'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _fancyLog = require('fancy-log');

var _fancyLog2 = _interopRequireDefault(_fancyLog);

var _awsHelper = require('./aws-helper');

var _awsHelper2 = _interopRequireDefault(_awsHelper);

var _readlineSync = require('readline-sync');

var _readlineSync2 = _interopRequireDefault(_readlineSync);

var _commands = require('./libs/commands');

var _commands2 = _interopRequireDefault(_commands);

var _console = require('console.table');

var _console2 = _interopRequireDefault(_console);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-polyfill');

var argv = _yargs2.default.command('show', 'Shows information relative to a specific bucket').command('list', 'Shows a completely sortable detailed list of all buckets').command('cost', 'Shows a table of cost for a selected (defaults to current) period').command('objects', 'Shows a table of all objects within a bucket.').command('creds', 'Let\'s you set your AWS credentials').option('bucket', _commands2.default.bucketOption).option('sort', _commands2.default.sortOptions).option('order', _commands2.default.orderOptions).option('start', _commands2.default.startOptions).option('end', _commands2.default.endOptions).option('filter', _commands2.default.filterOptions).option('storage', _commands2.default.storageOptions).help().argv;
var command = argv._[0];
var AWS = new _awsHelper2.default();
var response = null;
var options = {};

try {
  switch (command) {
    case 'show':
      response = AWS.getBucketInfo({ Bucket: argv.bucket }).then(function (bucket) {
        console.table(argv.bucket, bucket);
      });
      break;
    case 'list':
      response = AWS.detailedListBuckets(argv.sort, argv.order, argv.filter).then(function (buckets) {
        console.table(buckets);
      });
      break;
    case 'cost':
      response = AWS.getBucketCostAndUsage().then(function (costs) {
        console.table(costs);
      });
      break;
    case 'creds':
      options.accessKeyId = _readlineSync2.default.question('Your AWS access key ID: ');
      options.secretAccessKey = _readlineSync2.default.question('Your AWS secret access key:');
      response = AWS.setCredentials(options).then(function (response) {
        return _fancyLog2.default.info('Successfully saved credentials');
      });
      break;
    case 'objects':
      response = AWS.getBucketObjects({ Bucket: argv.bucket }, argv.storage, argv.sort, argv.order, argv.filter).then(function (objects) {
        console.table(argv.bucket, objects);
      });
      break;
    default:
      _fancyLog2.default.error('Command "' + command + '" is unknown.');
      break;
  }
} catch (e) {
  _fancyLog2.default.error(e.message);
}