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
  .command('cost-projection', 'Shows a table of the projected cost trend (very simple calculation that doesn\'t account for any external factors)')
  .command('objects', 'Shows a table of all objects within a bucket.')
  .command('creds','Let\'s you set your AWS credentials')
  .option('bucket', cmdOpts.bucketOption)
  .option('sort', cmdOpts.sortOptions)
  .option('order', cmdOpts.orderOptions)
  .option('start', cmdOpts.startOptions)
  .option('end', cmdOpts.endOptions)
  .option('filter', cmdOpts.filterOptions)
  .option('storage', cmdOpts.storageOptions)
  .option('region', cmdOpts.regionOptions)
  .help()
  .argv;
const command = argv._[0];
const AWS = new awsHelper();
let response = null;
let options = {};

function promptCredentials() {
  logger.info('If your credentials are already set as environment variables (AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY), just leave the prompt empty');
  options.accessKeyId = readline.question('Your AWS access key ID: ');
  options.secretAccessKey = readline.question('Your AWS secret access key: ');
  console.clear();
  response = AWS.setCredentials(options).then(response => logger.info('Successfully saved credentials'));
}

if((process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) && !AWS.checkForCredentialsFile()) {
  promptCredentials();
}

switch(command) {
  case 'show': 
    response = AWS.getBucketInfo({Bucket: argv.bucket}).then(bucket => {
      console.table(argv.bucket, bucket);
    }).catch(e => logger.error(e.message));
    break;
  case 'list':
    response = AWS.detailedListBuckets(argv.sort, argv.order, argv.filter).then(buckets => {
      console.table(buckets);
    }).catch(e => logger.error(e.message));
    break;
  case 'cost-projection':
    argv.region = argv.region || 'us-east-1';
    response = AWS.calculateCostProjection(argv.region).then(costs => {
      console.table(costs);
    }).catch(e => logger.error(e.message));
    break;
  case 'cost':
    argv.region = argv.region || 'us-east-1';
    response = AWS.getBucketCostAndUsage({region: argv.region}).then(costs => {
      console.table(costs);
    }).catch(e => logger.error(e.message));
    break;
  case 'creds':
    setCredentials();
    break;
  case 'objects':
    response = AWS.getBucketObjects({Bucket: argv.bucket}, argv.storage, argv.sort, argv.order, argv.filter).then(objects => {
      console.table(argv.bucket, objects);
    }).catch(e => logger.error(e.message));
    break;
  default: 
    logger.error(`Command "${command}" is unknown.`);
    break;
}