'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _fancyLog = require('fancy-log');

var _fancyLog2 = _interopRequireDefault(_fancyLog);

var _bytes = require('bytes');

var _bytes2 = _interopRequireDefault(_bytes);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _utils = require('./libs/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('babel-polyfill');

var awsHelper = function () {
  function awsHelper() {
    _classCallCheck(this, awsHelper);

    this.credentialsPath = _os2.default.homedir() + '/.aws';
    this.currentBucket = this.resetBucket();
    this.bucketObjects = { Token: null, Objects: [] };
  }

  /**
   * Method that resets the value of the currentBucket - useful when listing all buckets.
   */


  _createClass(awsHelper, [{
    key: 'resetBucket',
    value: function resetBucket() {
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

  }, {
    key: 'setCredentials',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options) {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', new Promise(function (resolve, reject) {
                  try {
                    if (!process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY && (!options || !options.accessKeyId || !options.secretAccessKey)) {
                      throw 'No access keys defined. Either set the environment variables "ACCESS_KEY_ID" and "SECRET_ACCESS_KEY". Or provide the utility with the info.';
                    }

                    if (!_this.checkForCredentialsFile()) {
                      _fs2.default.mkdirSync(_this.credentialsPath);
                    }

                    /*
                      Using the environment variables allow us to be able to use the utility on a Docker container that already 
                      has these variables defined. It also provides the user an alternative way to supply the credentials.
                    */
                    var creds = '[default]\naws_access_key_id = ' + (process.env.ACCESS_KEY_ID || options.accessKeyId) + '\naws_secret_access_key = ' + (process.env.SECRET_ACCESS_KEY || options.secretAccessKey) + '\n';

                    _fs2.default.writeFileSync(_this.credentialsPath + '/credentials', creds);

                    resolve({
                      success: true
                    });
                  } catch (e) {
                    reject({
                      success: false,
                      error: e
                    });
                  }
                }));

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function setCredentials(_x) {
        return _ref.apply(this, arguments);
      }

      return setCredentials;
    }()

    /**
     * Method that simply checks if the credentials file exists.
     */

  }, {
    key: 'checkForCredentialsFile',
    value: function checkForCredentialsFile() {
      return _fs2.default.existsSync(this.credentialsPath);
    }

    /**
     * Method that retrieves all buckets.
     * @param {*} options 
     */

  }, {
    key: 'getBuckets',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(options) {
        var s3;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                s3 = new _awsSdk2.default.S3();
                _context2.next = 3;
                return s3.listBuckets(options).promise();

              case 3:
                return _context2.abrupt('return', _context2.sent);

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getBuckets(_x2) {
        return _ref2.apply(this, arguments);
      }

      return getBuckets;
    }()

    /**
     * Method that retrieves all the information for a specific bucket. 
     * Returns the following info: total size, file count, last modified
     * @param {Bucket, ContinuationToken} options 
     */

  }, {
    key: 'getBucketInfo',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(options) {
        var s3, keys, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, bucketLocation;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                s3 = new _awsSdk2.default.S3();
                _context3.next = 3;
                return s3.listObjectsV2(options).promise().catch(function (e) {
                  _fancyLog2.default.error(e.message);
                });

              case 3:
                keys = _context3.sent;

                if (!keys) {
                  _context3.next = 36;
                  break;
                }

                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context3.prev = 8;

                for (_iterator = keys.Contents[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  key = _step.value;

                  this.currentBucket.totalSize += key.Size;
                  this.currentBucket.fileCount++;
                  this.currentBucket.lastModified = this.currentBucket.lastModified != 0 && key.LastModified > this.currentBucket.lastModified || this.currentBucket.lastModified === 'N/A' ? key.LastModified : this.currentBucket.lastModified;
                }

                _context3.next = 16;
                break;

              case 12:
                _context3.prev = 12;
                _context3.t0 = _context3['catch'](8);
                _didIteratorError = true;
                _iteratorError = _context3.t0;

              case 16:
                _context3.prev = 16;
                _context3.prev = 17;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 19:
                _context3.prev = 19;

                if (!_didIteratorError) {
                  _context3.next = 22;
                  break;
                }

                throw _iteratorError;

              case 22:
                return _context3.finish(19);

              case 23:
                return _context3.finish(16);

              case 24:
                if (!keys.IsTruncated) {
                  _context3.next = 29;
                  break;
                }

                this.currentBucket.continuationToken = keys.NextContinuationToken;
                options.ContinuationToken = keys.NextContinuationToken;
                _context3.next = 29;
                return this.getBucketInfo(options);

              case 29:
                _context3.next = 31;
                return s3.getBucketLocation(options).promise();

              case 31:
                bucketLocation = _context3.sent;

                // short-hand if because of AWS' secret litte trick -> https://github.com/aws/aws-sdk-net/issues/323 && beautify if lastModified is null
                this.currentBucket.location = bucketLocation.LocationConstraint === '' ? 'us-east-1' : bucketLocation.LocationConstraint;
                this.currentBucket.lastModified = !this.currentBucket.lastModified ? 'N/A' : this.currentBucket.lastModified;
                this.currentBucket.totalSize = (0, _bytes2.default)(this.currentBucket.totalSize);

                return _context3.abrupt('return', this.currentBucket);

              case 36:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[8, 12, 16, 24], [17,, 19, 23]]);
      }));

      function getBucketInfo(_x3) {
        return _ref3.apply(this, arguments);
      }

      return getBucketInfo;
    }()

    /**
     * Method that retrieves the cost for every usage type as well as calculating the total.
     * @param {region: STRING, start: DATE, end: DATE} options 
     */

  }, {
    key: 'getBucketCostAndUsage',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { region: 'us-east-1', start: null, end: null };

        var costExplorer, price, results, totalObj, i, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, entity, object, metric, metricValStr;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _awsSdk2.default.config.update({ region: options.region });

                options.granularity = options.granularity || 'MONTHLY';
                options.start = options.start || (0, _moment2.default)().month(10).startOf('month').format("YYYY-MM-DD");
                options.end = options.end || (0, _moment2.default)().format("YYYY-MM-DD");

                costExplorer = new _awsSdk2.default.CostExplorer();
                _context4.next = 7;
                return costExplorer.getCostAndUsage({
                  TimePeriod: { Start: options.start, End: options.end },
                  Granularity: options.granularity,
                  GroupBy: [{
                    Key: "USAGE_TYPE",
                    Type: "DIMENSION"
                  }],
                  Metrics: ["AmortizedCost", "BlendedCost", "NetAmortizedCost", "NetUnblendedCost", "NormalizedUsageAmount", "UnblendedCost", "UsageQuantity"]
                }).promise();

              case 7:
                price = _context4.sent;
                results = [], totalObj = { UsageType: "** TOTAL COST **" }, i = 0;
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context4.prev = 12;

                for (_iterator2 = price.ResultsByTime[0].Groups[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  entity = _step2.value;
                  object = { UsageType: entity.Keys[0] };


                  for (metric in entity.Metrics) {
                    if (metric.includes('Cost')) {
                      // set object properties to 0
                      if (i === 0) totalObj[metric] = 0;

                      totalObj[metric] = totalObj[metric] + parseFloat(entity.Metrics[metric].Amount);

                      // add currency
                      if (i === price.ResultsByTime[0].Groups.length - 1) {
                        totalObj[metric] = totalObj[metric] + ' ' + entity.Metrics[metric].Unit;
                      }
                    }

                    metricValStr = entity.Metrics[metric].Amount + ' ' + entity.Metrics[metric].Unit;

                    object[metric] = metricValStr;
                  }
                  results.push(object);
                  i++;
                }
                _context4.next = 20;
                break;

              case 16:
                _context4.prev = 16;
                _context4.t0 = _context4['catch'](12);
                _didIteratorError2 = true;
                _iteratorError2 = _context4.t0;

              case 20:
                _context4.prev = 20;
                _context4.prev = 21;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 23:
                _context4.prev = 23;

                if (!_didIteratorError2) {
                  _context4.next = 26;
                  break;
                }

                throw _iteratorError2;

              case 26:
                return _context4.finish(23);

              case 27:
                return _context4.finish(20);

              case 28:
                results.push(totalObj);
                return _context4.abrupt('return', results);

              case 30:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[12, 16, 20, 28], [21,, 23, 27]]);
      }));

      function getBucketCostAndUsage() {
        return _ref4.apply(this, arguments);
      }

      return getBucketCostAndUsage;
    }()

    /**
     * Methods that returns a detailed array of all the buckets. List is completely sortable, filterable, and orderable.
     * @param {string} sortProp 
     * @param {string (asc, desc)} order 
     * @param {string (plain, regexp)} filter 
     */

  }, {
    key: 'detailedListBuckets',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var sortProp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Creation_Date";
        var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "asc";
        var filter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

        var response, list, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, bucket, info;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return this.getBuckets();

              case 3:
                response = _context5.sent;
                list = [];
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context5.prev = 8;
                _iterator3 = response.Buckets[Symbol.iterator]();

              case 10:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context5.next = 20;
                  break;
                }

                bucket = _step3.value;

                this.currentBucket = this.resetBucket();
                _context5.next = 15;
                return this.getBucketInfo({ Bucket: bucket.Name });

              case 15:
                info = _context5.sent;

                list.push({ Bucket_Name: bucket.Name, Location: info.location, Creation_Date: bucket.CreationDate, Total_Size: info.totalSize, File_Count: info.fileCount, Last_Modified: info.lastModified });

              case 17:
                _iteratorNormalCompletion3 = true;
                _context5.next = 10;
                break;

              case 20:
                _context5.next = 26;
                break;

              case 22:
                _context5.prev = 22;
                _context5.t0 = _context5['catch'](8);
                _didIteratorError3 = true;
                _iteratorError3 = _context5.t0;

              case 26:
                _context5.prev = 26;
                _context5.prev = 27;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 29:
                _context5.prev = 29;

                if (!_didIteratorError3) {
                  _context5.next = 32;
                  break;
                }

                throw _iteratorError3;

              case 32:
                return _context5.finish(29);

              case 33:
                return _context5.finish(26);

              case 34:

                if (filter && filter.trim() !== '') list = _utils2.default.filter(list, filter);

                return _context5.abrupt('return', list.sort(_utils2.default.compare(sortProp, order)));

              case 38:
                _context5.prev = 38;
                _context5.t1 = _context5['catch'](0);

                _fancyLog2.default.error(_context5.t1);

              case 41:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[0, 38], [8, 22, 26, 34], [27,, 29, 33]]);
      }));

      function detailedListBuckets() {
        return _ref5.apply(this, arguments);
      }

      return detailedListBuckets;
    }()

    /**
     *  Methods that returns all the objects in a specific bucket. Completely sortable, filterable, and oderable.
     * @param {Bucket: string} options 
     * @param {string} storageType 
     * @param {string} sortProp 
     * @param {string (asc, desc)} order 
     * @param {string (plain, regexp)} filter 
     */

  }, {
    key: 'getBucketObjects',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(options) {
        var storageType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ALL";
        var sortProp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "LastModified";
        var order = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "desc";
        var filter = arguments[4];
        var aws, response;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                aws = new _awsSdk2.default.S3();
                _context6.next = 3;
                return aws.listObjectsV2(options).promise().catch(function (e) {
                  _fancyLog2.default.error(e.message);
                });

              case 3:
                response = _context6.sent;

                if (!response) {
                  _context6.next = 13;
                  break;
                }

                this.bucketObjects.Objects = this.bucketObjects.Objects.concat(response.Contents.filter(function (el) {
                  return el.StorageClass === storageType || storageType === 'ALL';
                }));

                if (!response.IsTruncated) {
                  _context6.next = 11;
                  break;
                }

                this.bucketObjects.Token = response.NextContinuationToken;
                options.ContinuationToken = response.NextContinuationToken;
                _context6.next = 11;
                return this.myTestFunction(options);

              case 11:

                if (filter && filter.trim() !== '') this.bucketObjects.Objects = _utils2.default.filter(this.bucketObjects.Objects, filter);

                return _context6.abrupt('return', this.bucketObjects.Objects.sort(_utils2.default.compare(sortProp, order)));

              case 13:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getBucketObjects(_x8) {
        return _ref6.apply(this, arguments);
      }

      return getBucketObjects;
    }()
  }]);

  return awsHelper;
}();

exports.default = awsHelper;