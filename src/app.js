require('babel-polyfill');

import _ from 'lodash';
import yargs from 'yargs';
import logger from 'fancy-log';
import awsHelper from './aws-helper';
import readline from 'readline-sync';
import cmdOpts from './libs/commands';
import cTable from 'console.table';

const argv = yargs
  .command('show', 'Shows information relative to a specific bucket')
  .command('list', 'Shows a completely sortable detailed list of all buckets')
  .command('cost', 'Shows a table of cost for a selected (defaults to current) period')
  .command('objects', 'Shows a table of all objects within a bucket.')
  .command('creds','Let\'s you set your AWS credentials')
  .option('bucket', cmdOpts.bucketOption)
  .option('sort', cmdOpts.sortOptions)
  .option('order', cmdOpts.orderOptions)
  .option('start', cmdOpts.startOptions)
  .option('end', cmdOpts.endOptions)
  .option('filter', cmdOpts.filterOptions)
  .option('storage', cmdOpts.storageOptions)
  .help()
  .argv;
const command = argv._[0];
const AWS = new awsHelper();
let response = null;
let options = {};

try {
  switch(command) {
    case 'show': 
      response = AWS.getBucketInfo({Bucket: argv.bucket}).then(bucket => {
        console.table(argv.bucket, bucket);
      });
      break;
    case 'list':
      response = AWS.detailedListBuckets(argv.sort, argv.order, argv.filter).then(buckets => {
        console.table(buckets);
      });
      break;
    case 'cost':
      response = AWS.getBucketCostAndUsage().then(costs => {
        console.table(costs);
      });
      break;
    case 'creds':
      options.accessKeyId = readline.question('Your AWS access key ID: ');
      options.secretAccessKey = readline.question('Your AWS secret access key:');
      response = AWS.setCredentials(options).then(response => logger.info('Successfully saved credentials'));
      break;
    case 'objects':
      response = AWS.getBucketObjects({Bucket: argv.bucket}, argv.storage, argv.sort, argv.order, argv.filter).then(objects => {
        console.table(argv.bucket, objects);
      });
      break;
    default: 
      logger.error(`Command "${command}" is unknown.`);
      break;
  }
} catch (e) {
  logger.error(e.message);
}