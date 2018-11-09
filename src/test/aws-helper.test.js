require('babel-polyfill');

import expect from 'expect';
import awsHelper from '../aws-helper';

describe('Tests concerning the aws-helper utility', () => {
  describe('Class utility', () => {
    it('should create an AWS credentials file and return true', async () => {
      const response = await new awsHelper().setCredentials();
      expect(response.success).toBeTruthy();
    });
  });
  describe('S3 Functions', function () {
    it('should list all the user\'s buckets', async () => {
      const response = await new awsHelper().getBuckets();
      expect(response.Buckets).toBeDefined();
    });

    it('should return the file count in a bucket', async function () {
      const response = await new awsHelper().getBucketInfo({ Bucket: 'mytest-bucket-node' });
      expect(response.fileCount).toBeDefined();
    });

    it('should return the total size of files in a bucket', async () => {
      const response = await new awsHelper().getBucketInfo({ Bucket: 'mytest-bucket-node' });
      expect(response.totalSize).toBeDefined();
    });

    it('should return a detailed list of all buckets with Bucket_Name, Total_Size, File_Count, Creation_Date, Last_Modified, Region', async () => {
      const response = await new awsHelper().detailedListBuckets();
      expect(response[0].Bucket_Name).toBeDefined();
      expect(response[0].Creation_Date).toBeDefined();
      expect(response[0].Total_Size).toBeDefined();
      expect(response[0].File_Count).toBeDefined();
      expect(response[0].Last_Modified).toBeDefined();
      expect(response[0].Region).toBeDefined();
    });

    it('should return a list of objects within a bucket', async () => {
      const response = await new awsHelper().getBucketObjects({ Bucket: 'mytest-bucket-node' });
      expect(response).toBeDefined();
    });
  });

  describe('Sorting/Filtering/Ordering tests', () => {
    it('should list all buckets SORTED by created date ORDERED descendingly', async () => {
      const response = await new awsHelper().detailedListBuckets('Last_Modified', 'desc');
      expect(new Date(response[0].Creation_Date).getTime()).toBeGreaterThan(new Date(response[1].Creation_Date).getTime());
    });

    it('should list the buckets for the us-east-1 region using a REGEXP', async () => {
      const response = await new awsHelper().detailedListBuckets('Last_Modified', 'asc', 'us-(.+?)-1')
      expect(response.length).toBe(1);
      expect(response[0].Region).toBe('us-east-1');
    });

    it('should list the buckets for the ca-central-1 region using a STRING', async () => {
      const response = await new awsHelper().detailedListBuckets('Last_Modified', 'asc', 'canada')
      expect(response.length).toBe(1);
      expect(response[0].Region).toBe('ca-central-1');
    });

    it('should list objects FILTERED by their storage class', async () => {
      const response = await new awsHelper().getBucketObjects({ Bucket: 'mytest-bucket-node' }, "STANDARD_IA");
      expect(response.length).toBe(1);
      expect(response[0].StorageClass).toBe("STANDARD_IA");
    });
  });

  describe('Cost Explorer Functions', function () {
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