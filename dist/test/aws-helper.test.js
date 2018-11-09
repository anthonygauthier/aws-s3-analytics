'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _awsHelper = require('../aws-helper');

var _awsHelper2 = _interopRequireDefault(_awsHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('babel-polyfill');

describe('Tests concerning the aws-helper utility', function () {
  describe('Class utility', function () {
    it('should create an AWS credentials file and return true', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return new _awsHelper2.default().setCredentials();

            case 2:
              response = _context.sent;

              (0, _expect2.default)(response.success).toBeTruthy();

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));
  });
  describe('S3 Functions', function () {
    var _this = this;

    it('should list all the user\'s buckets', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var response;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return new _awsHelper2.default().getBuckets();

            case 2:
              response = _context2.sent;

              (0, _expect2.default)(response.Buckets).toBeDefined();

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    })));

    it('should return the file count in a bucket', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var response;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return new _awsHelper2.default().getBucketInfo({ Bucket: 'mytest-bucket-node' });

            case 2:
              response = _context3.sent;

              (0, _expect2.default)(response.fileCount).toBeDefined();

            case 4:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    })));

    it('should return the total size of files in a bucket', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var response;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return new _awsHelper2.default().getBucketInfo({ Bucket: 'mytest-bucket-node' });

            case 2:
              response = _context4.sent;

              (0, _expect2.default)(response.totalSize).toBeDefined();

            case 4:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    })));

    it('should return a detailed list of all buckets with bucketName, totalSize, fileCount, creationDate, lastModified', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var response;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return new _awsHelper2.default().detailedListBuckets();

            case 2:
              response = _context5.sent;

              (0, _expect2.default)(response[0].Bucket_Name).toBeDefined();
              (0, _expect2.default)(response[0].Creation_Date).toBeDefined();
              (0, _expect2.default)(response[0].Total_Size).toBeDefined();
              (0, _expect2.default)(response[0].File_Count).toBeDefined();
              (0, _expect2.default)(response[0].Last_Modified).toBeDefined();

            case 8:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this);
    })));
  });

  describe('Cost Explorer Functions', function () {
    var _this2 = this;

    it('should return the costs for a bucket', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var response;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return new _awsHelper2.default().getBucketCostAndUsage();

            case 2:
              response = _context6.sent;

              (0, _expect2.default)(response[0].AmortizedCost).toBeDefined();
              (0, _expect2.default)(response[0].BlendedCost).toBeDefined();
              (0, _expect2.default)(response[0].NetAmortizedCost).toBeDefined();
              (0, _expect2.default)(response[0].NetUnblendedCost).toBeDefined();
              (0, _expect2.default)(response[0].NormalizedUsageAmount).toBeDefined();
              (0, _expect2.default)(response[0].UnblendedCost).toBeDefined();
              (0, _expect2.default)(response[0].UsageQuantity).toBeDefined();

            case 10:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this2);
    })));
  });
});