require('babel-polyfill');

import AWS, { AWSError } from 'aws-sdk';
import moment from 'moment';
import logger from 'fancy-log';
import bytes from 'bytes';
import fs from 'fs';
import os from 'os';
import utils from './libs/utils';

class awsHelper {
  constructor() {
    this.credentialsPath = `${os.homedir()}/.aws`;
    this.currentBucket = this.resetBucket();
    this.bucketObjects = {Token: null, Objects: []};
  }

  /**
   * Method that resets the value of the currentBucket - useful when listing all buckets.
   */
  resetBucket() {
    return {
      totalSize: 0,
      fileCount: 0,
      lastModified: null
    };
  }

  /**
   * Method that sets credentials in a file in the user's home folder (regardless of OS).
   * @param {accessKeyId, secretAccessKey} options
   */
  async setCredentials(options) {
    return new Promise((resolve, reject) => {
      try {
        if ((!process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY) && (!options || !options.accessKeyId || !options.secretAccessKey)) {
          throw ('No access keys defined. Either set the environment variables "ACCESS_KEY_ID" and "SECRET_ACCESS_KEY". Or provide the utility with the info.');
        }

        if (!this.checkForCredentialsFile()) {
          fs.mkdirSync(this.credentialsPath);
        }

        /*
          Using the environment variables allow us to be able to use the utility on a Docker container that already 
          has these variables defined. It also provides the user an alternative way to supply the credentials.
        */
        const creds = `[default]\naws_access_key_id = ${process.env.ACCESS_KEY_ID || options.accessKeyId}\naws_secret_access_key = ${process.env.SECRET_ACCESS_KEY || options.secretAccessKey}\n`

        fs.writeFileSync(this.credentialsPath + '/credentials', creds);

        resolve({
          success: true
        });
      } catch (e) {
        reject({
          success: false,
          error: e
        });
      }
    });
  }

  /**
   * Method that simply checks if the credentials file exists.
   */
  checkForCredentialsFile() {
    return fs.existsSync(this.credentialsPath);
  }

  /**
   * Method that retrieves all buckets.
   * @param {*} options 
   */
  async getBuckets(options) {
    const s3 = new AWS.S3();
    return await s3.listBuckets(options).promise();
  }

  /**
   * Method that retrieves all the information for a specific bucket. 
   * Returns the following info: total size, file count, last modified
   * @param {Bucket, ContinuationToken} options 
   */
  async getBucketInfo(options) {
    const s3 = new AWS.S3();
    const keys = await s3.listObjectsV2(options).promise().catch(e => { logger.error(e.message) });

    if (keys) {
      for (const key of keys.Contents) {
        this.currentBucket.totalSize += key.Size;
        this.currentBucket.fileCount++;
        this.currentBucket.lastModified = (this.currentBucket.lastModified != 0 && (key.LastModified > this.currentBucket.lastModified) || this.currentBucket.lastModified === 'N/A') ? key.LastModified : this.currentBucket.lastModified;
      }

      if (keys.IsTruncated) {
        this.currentBucket.continuationToken = keys.NextContinuationToken;
        options.ContinuationToken = keys.NextContinuationToken;
        await this.getBucketInfo(options);
      }
      const bucketRegion = await s3.getBucketLocation(options).promise();

      /** 
       *  short-hand if because of AWS's dirty litte secret -> https://github.com/aws/aws-sdk-net/issues/323 
       *  && beautify if lastModified is null
      **/
      this.currentBucket.region = (bucketRegion.LocationConstraint === '') ? 'us-east-1' : bucketRegion.LocationConstraint;
      this.currentBucket.lastModified = (!this.currentBucket.lastModified) ? 'N/A' : this.currentBucket.lastModified;
      this.currentBucket.totalSize = bytes(this.currentBucket.totalSize);

      return this.currentBucket;
    }
  }

  /**
   * Method that retrieves the cost for every usage type as well as calculating the total.
   * @param {region: STRING, start: DATE, end: DATE} options 
   */
  async getBucketCostAndUsage(options = { region: 'us-east-1', start: null, end: null }) {
    AWS.config.update({ region: options.region });

    options.granularity = options.granularity || 'MONTHLY';
    options.start = options.start || moment().month(10).startOf('month').format("YYYY-MM-DD");
    options.end = options.end || moment().format("YYYY-MM-DD");

    const costExplorer = new AWS.CostExplorer();
    const price = await costExplorer.getCostAndUsage({
      TimePeriod: { Start: options.start, End: options.end },
      Granularity: options.granularity,
      GroupBy: [{
        Key: "USAGE_TYPE",
        Type: "DIMENSION"
      }],
      Metrics: [
        "AmortizedCost",
        "BlendedCost",
        "NetAmortizedCost",
        "NetUnblendedCost",
        "NormalizedUsageAmount",
        "UnblendedCost",
        "UsageQuantity"
      ]
    }).promise();

    let results = [], totalObj = { UsageType: "** TOTAL COST **" }, i = 0;
    for (const entity of price.ResultsByTime[0].Groups) {
      let object = { UsageType: entity.Keys[0] };

      for (const metric in entity.Metrics) {
        if (metric.includes('Cost')) {
          // set object properties to 0
          if (i === 0)
            totalObj[metric] = 0;

          totalObj[metric] = totalObj[metric] + parseFloat(entity.Metrics[metric].Amount);

          // add currency
          if (i === price.ResultsByTime[0].Groups.length - 1) {
            totalObj[metric] = `${totalObj[metric]} ${entity.Metrics[metric].Unit}`
          }
        }

        let metricValStr = `${entity.Metrics[metric].Amount} ${entity.Metrics[metric].Unit}`;
        object[metric] = metricValStr;
      }
      results.push(object);
      i++;
    }
    results.push(totalObj);
    return results;
  }

  /**
   * Methods that returns a detailed array of all the buckets. List is completely sortable, filterable, and orderable.
   * @param {string} sortProp 
   * @param {string (asc, desc)} order 
   * @param {string (plain, regexp)} filter 
   */
  async detailedListBuckets(sortProp = "Creation_Date", order = "asc", filter = "") {
    try {
      const response = await this.getBuckets();
      let list = [];

      for (const bucket of response.Buckets) {
        this.currentBucket = this.resetBucket();
        const info = await this.getBucketInfo({ Bucket: bucket.Name });
        list.push({ Bucket_Name: bucket.Name, Region: info.region, Creation_Date: bucket.CreationDate, Total_Size: info.totalSize, File_Count: info.fileCount, Last_Modified: info.lastModified });
      }

      if (filter && filter.trim() !== '')
        list = utils.filter(list, filter);

      return list.sort(utils.compare(sortProp, order));
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   *  Methods that returns all the objects in a specific bucket. Completely sortable, filterable, and oderable.
   * @param {Bucket: string} options 
   * @param {string} storageType 
   * @param {string} sortProp 
   * @param {string (asc, desc)} order 
   * @param {string (plain, regexp)} filter 
   */
  async getBucketObjects(options, storageType = "ALL", sortProp="LastModified", order="desc", filter) {
    const aws = new AWS.S3();
    const response = await aws.listObjectsV2(options).promise().catch(e => { logger.error(e.message) });

    if(response) {
      this.bucketObjects.Objects = this.bucketObjects.Objects.concat(response.Contents.filter(el => (el.StorageClass === storageType || storageType === 'ALL')));

      if (response.IsTruncated) {
        this.bucketObjects.Token = response.NextContinuationToken;
        options.ContinuationToken = response.NextContinuationToken;
        await this.myTestFunction(options);
      }
      
      if (filter && filter.trim() !== '')
        this.bucketObjects.Objects = utils.filter(this.bucketObjects.Objects, filter);

      this.bucketObjects.Objects = this.bucketObjects.Objects.map(el => {el.Size = bytes(el.Size); return el;})

      return this.bucketObjects.Objects.sort(utils.compare(sortProp, order));
    }
  }
}

export default awsHelper;