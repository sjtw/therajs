Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _MemoryCache = require('../cache/MemoryCache.js');

var _MemoryCache2 = _interopRequireDefault(_MemoryCache);

var _sourceMapSupport = require('source-map-support');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var xml2jsOptions = {
  explicitArray: false,
  explicitRoot: false,
  explicitChildren: false,
  mergeAttrs: true
};

function getMsDiff(start, end) {
  start = (0, _moment2.default)(start);
  end = (0, _moment2.default)(end);
  return end.diff(start);
}

var HTTPError = function HTTPError(statusCode, url, msg, code) {
  (0, _classCallCheck3.default)(this, HTTPError);

  this.errorType = 'HTTP_ERR';
  this.error = {};
  if (statusCode) this.error.statusCode = statusCode;
  if (url) this.error.url = url;
  if (msg) this.error.msg = msg;
  if (code) this.error.code = code;
};

var ApiRequest = function () {
  function ApiRequest(url, keyID, vCode, characterID) {
    (0, _classCallCheck3.default)(this, ApiRequest);

    this.requestOptions = {
      url: url
    };
    this.baseQueryParams = {
      keyID: keyID,
      vCode: vCode
    };

    if (characterID) this.baseQueryParams.characterID = characterID;
    (0, _sourceMapSupport.install)();
  }

  (0, _createClass3.default)(ApiRequest, [{
    key: 'get',
    value: function get(extraParams, extraRequestOptions) {
      var _this = this;

      return new _promise2.default(function (resolve, reject) {
        var requestParams = { qs: {} };
        (0, _assign2.default)(requestParams, _this.requestOptions);
        (0, _assign2.default)(requestParams.qs, _this.baseQueryParams, extraParams);

        if (extraRequestOptions) (0, _assign2.default)(requestParams, extraRequestOptions);

        _request2.default.get(requestParams, function (err, res, body) {
          if (err) {
            reject({ errorType: 'REQUEST_FAIL', error: err });
            return;
          }
          if (res.statusCode !== 200) {
            if (body) {
              _xml2js2.default.parseString(body, xml2jsOptions, function (err, result) {
                console.log(result);
                if (err) reject(new HTTPError(res.statusCode, requestParams.url));else reject(new HTTPError(res.statusCode, requestParams.url, result.error._, result.error.code));
              });
            } else {
              reject({ errorType: 'HTTP_ERR', error: { statusCode: res.statusCode, url: requestParams.url } });
            }
            return;
          }

          _xml2js2.default.parseString(body, xml2jsOptions, function (err, result) {
            if (err) reject({ errorType: 'XML_PARSE_ERR', error: err });
            resolve(result);
          });
        });
      });
    }
  }]);
  return ApiRequest;
}();

var XmlApiClient = function () {
  function XmlApiClient(options) {
    (0, _classCallCheck3.default)(this, XmlApiClient);

    if (!options) options = {};
    this.keyID = options.keyID ? options.keyID : null;
    this.vCode = options.vCode ? options.vCode : null;
    this.characterID = options.characterID ? options.characterID : null;
    this.rootURL = 'https://api.eveonline.com';
    this.endpointSuffix = '.xml.aspx';
    this.cache = options.cache ? options.cache : new _MemoryCache2.default();
    (0, _sourceMapSupport.install)();
  }

  (0, _createClass3.default)(XmlApiClient, [{
    key: 'get',
    value: function get(path, extraParams, requestOptions, force) {
      var _this2 = this;

      return new _promise2.default(function (resolve, reject) {

        if (typeof extraParams === 'boolean') force = extraParams;
        if (typeof requestOptions === 'boolean') force = requestOptions;
        if (!extraParams) extraParams = {};
        if (!requestOptions) requestOptions = {};

        // pick up cached response, if one exists in the cache
        if (_this2.cache.exists(path) && !force) {
          var body = _this2.cache.get(path);
          body.isCached = true;
          resolve(body);
          return;
        }

        // construct full URL to query
        var url = _this2.getFullUrl(path);

        // instantiate a new Api Request
        new ApiRequest(url, _this2.keyID, _this2.vCode, _this2.characterID).get(extraParams, requestOptions).then(function (body) {
          // handle GET response

          if (!body.result) {
            reject({ errorType: 'INVALID_RESPONSE', error: 'The Response from ' + url + ' was invalid.' });
          }

          var cacheStart = _lodash2.default.get(body, 'currentTime', false);
          var cacheEnd = _lodash2.default.get(body, 'cachedUntil', false);

          if (cacheStart && cacheEnd) {
            // cache this response until the received cachedUntil time
            // (timezone differences are taken into account as we're using the offset from currentTime)
            timeout = getMsDiff(cacheStart, cacheEnd);
            _this2.cache.put(path, body, timeout);
          }

          body.isCached = false;
          resolve(body);
        }).catch(function (err) {
          reject(err);
        });
      });
    }

    /**
     * sets the characterID which will be used in all API requests
     * @param {Number} id - characterID
     */

  }, {
    key: 'setCharacterID',
    value: function setCharacterID(id) {
      this.characterID = id;
      // return this;
    }

    /**
     * sets the keyID which will be used in all API requests
     * @param {Number} keyID - Eve Online API keyID
     */

  }, {
    key: 'setKeyID',
    value: function setKeyID(keyID) {
      this.keyID = keyID;
      return this;
    }

    /**
     * sets the verification code which will be used in all API requests
      */

  }, {
    key: 'setVCode',
    value: function setVCode(vCode) {
      this.vCode = vCode;
      return this;
    }

    /**
     * Sets multiple configuration parameters at once
     * @param {Object} config - e.g {characterID: <charID>, keyID: <keyID>, cache: new CustomCache()}
     */

  }, {
    key: 'setConfig',
    value: function setConfig(config) {
      for (var key in config) {
        this[key] = config.key;
      }
      return config;
    }
  }, {
    key: 'getFullUrl',
    value: function getFullUrl(path) {
      return this.rootURL + '/' + path + this.endpointSuffix;
    }
  }]);
  return XmlApiClient;
}();

exports.default = XmlApiClient;
//# sourceMappingURL=XmlClient.js.map
