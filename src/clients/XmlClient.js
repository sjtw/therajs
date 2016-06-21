import request from 'request';
import xml2js from 'xml2js';
import _ from 'lodash';
import moment from 'moment';
import MemoryCache from '../cache/MemoryCache.js';
import { install } from 'source-map-support';

const xml2jsOptions = {
  explicitArray: false,
  explicitRoot: false,
  explicitChildren: false,
  mergeAttrs: true
};

function getMsDiff(start, end) {
  start = moment(start);
  end = moment(end);
  return end.diff(start);
}

class HTTPError {
  constructor(statusCode, url, msg, code) {
    this.errorType = 'HTTP_ERR';
    this.error = {};
    if (statusCode) this.error.statusCode = statusCode;
    if (url) this.error.url = url;
    if (msg) this.error.msg = msg;
    if (code) this.error.code = code;
  }
}

class ApiRequest {
  constructor(url, keyID, vCode, characterID) {
    this.requestOptions = {
      url: url,
    };
    this.baseQueryParams = {
      keyID: keyID,
      vCode: vCode
    };

    if (characterID) this.baseQueryParams.characterID = characterID;
    install();
  }

  get(extraParams, extraRequestOptions) {
    return new Promise((resolve, reject) => {
      var requestParams = {qs:{}};
      Object.assign(requestParams, this.requestOptions);
      Object.assign(requestParams.qs, this.baseQueryParams, extraParams);

      if (extraRequestOptions) Object.assign(requestParams, extraRequestOptions);

      request.get(requestParams, (err, res, body) => {
        if (err) {
          reject({errorType: 'REQUEST_FAIL', error: err});
          return;
        }
        if (res.statusCode !== 200) {
          if (body) {
            xml2js.parseString(body, xml2jsOptions, (err, result) => {
              if (err) reject(new HTTPError(res.statusCode, requestParams.url));
              else reject(new HTTPError(res.statusCode, requestParams.url, result.error._, result.error.code));
            });
          } else {
            reject({errorType: 'HTTP_ERR',error: {statusCode: res.statusCode, url: requestParams.url}});
          }
          return;
        }

        xml2js.parseString(body, xml2jsOptions, (err, result) => {
          if (err) reject({errorType: 'XML_PARSE_ERR', error: err });
          resolve(result);
        });
      });
    });
  }
}

class XmlApiClient {
  constructor(options) {
    if (!options) options = {};
    this.keyID = options.keyID ? options.keyID : null;
    this.vCode = options.vCode ? options.vCode : null;
    this.characterID = options.characterID ? options.characterID : null;
    this.rootURL = 'https://api.eveonline.com';
    this.endpointSuffix = '.xml.aspx';
    this.cache = options.cache ? options.cache : new MemoryCache();
    install();
  }

  get (path, extraParams, requestOptions, force) {
    return new Promise((resolve, reject) => {

      if (typeof extraParams === 'boolean') force = extraParams;
      if (typeof requestOptions === 'boolean') force = requestOptions;
      if (!extraParams) extraParams = {};
      if (!requestOptions) requestOptions = {};

      // pick up cached response, if one exists in the cache
      this.cache.exists(path).then(exists => {

        // resolve cached version
        if (exists && !force) {
          return this.cache.get(path).then(body => {
            body.isCached = true;
            return resolve(body);
          });
        }
       
        var url = this.getFullUrl(path);
        return new ApiRequest(url, this.keyID, this.vCode, this.characterID)
        .get(extraParams, requestOptions)
        .then( body => {
          // handle GET response
          if (!body.result) {
            return reject({errorType: 'INVALID_RESPONSE', error: 'The Response from ' + url + ' was invalid.'});
          }

          var cacheStart = _.get(body, 'currentTime', false);
          var cacheEnd = _.get(body, 'cachedUntil', false);

          body.isCached = false;
          if (cacheStart && cacheEnd) {
            // cache this response until the received cachedUntil time
            // (timezone differences are taken into account as we're using the offset from currentTime)
            timeout = getMsDiff(cacheStart, cacheEnd);
            return this.cache.put(path, body, timeout).then(() => {
              return resolve(body);
            });
          } else {
            return resolve(body);
          }

        });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * sets the characterID which will be used in all API requests
   * @param {Number} id - characterID
   */
  setCharacterID(id) {
    this.characterID = id;
    return this;
  }

  /**
   * sets the keyID which will be used in all API requests
   * @param {Number} keyID - Eve Online API keyID
   */
  setKeyID(keyID) {
    this.keyID = keyID;
    return this;
  }

  /**
   * sets the verification code which will be used in all API requests
    */
  setVCode(vCode) {
    this.vCode = vCode;
    return this;
  }

  /**
   * Sets multiple configuration parameters at once
   * @param {Object} config - e.g {characterID: <charID>, keyID: <keyID>, cache: new CustomCache()}
   */
  setConfig(config) {
    for (var key in config) {
      this[key] = config.key;
    }
    return this;
  }

  getFullUrl(path) {
    return this.rootURL + '/' + path + this.endpointSuffix;
  }
}

export default XmlApiClient;