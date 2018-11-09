require('babel-polyfill');

import expect from 'expect';
import awsHelper from '../aws-helper';

describe('Tests concerning the aws-helper utility', () => {
  describe('Class utility', () => {
    it('should create an AWS credentials file and return true', async () => {
      const response = await new awsHelper().setCredentials();
      expect(response.success).toBeTruthy();
    });
  });
  describe('S3 Functions', function() {
    it('should list all the user\'s buckets', async () => { 
      const response = await new awsHelper().getBuckets();
      expect(response.Buckets).toBeDefined();
    });

    it('should return the file count in a bucket', async function() {
      const response = await new awsHelper().getBucketInfo({Bucket: 'mytest-bucket-node'});
      expect(response.fileCount).toBeDefined();
    });

    it('should return the total size of files in a bucket', async () => {
      const response = await new awsHelper().getBucketInfo({Bucket: 'mytest-bucket-node'});
      expect(response.totalSize).toBeDefined();
    });

    it('should return a detailed list of all buckets with bucketName, totalSize, fileCount, creationDate, lastModified', async () => {
      const response = await new awsHelper().detailedListBuckets();
      expect(response[0].Bucket_Name).toBeDefined();
      expect(response[0].Creation_Date).toBeDefined();
      expect(response[0].Total_Size).toBeDefined();
      expect(response[0].File_Count).toBeDefined();
      expect(response[0].Last_Modified).toBeDefined();
    });
  });
  
  describe('Cost Explorer Functions', function() {
    it('should return the costs for a bucket', async () => {
      const response = await new awsHelper().getBucketCostAndUsage();
      expect(response[0].AmortizedCost).toBeDefined();
      expect(response[0].BlendedCost).toBeDefined();
      expect(response[0].NetAmortizedCost).toBeDefined();
      expect(response[0].NetUnblendedCost).toBeDefined();
      expect(response[0].NormalizedUsageAmount).toBeDefined();
      expect(response[0].UnblendedCost).toBeDefined();
      expect(response[0].UsageQuantity).toBeDefined();
    });
  });
});