import XmlApiClient from '../src/clients/XmlClient.js';
import MemoryCache from '../src/cache/MemoryCache.js';
import {expect} from 'chai';

var legitKeyID = process.env.EVEAPI_KEYID;
var legitVCode = process.env.EVEAPI_VCODE;

console.log('using key ID beginning: ' + legitKeyID.substr(0,4));
console.log('using vcode beginning: ' + legitVCode.substr(0,8));

function handlePromiseError(error) {
  console.error(error);
  throw new Error(error);
}

class TestCache extends MemoryCache {
  constructor() {
    super();
    this.test = true;
  }
}

describe('XmlApiClient', function () {

  it('should instantiate ok with no arguments passed to it', function() {
    var api = new XmlApiClient();
    expect(api).to.be.an.instanceof(XmlApiClient);
  });

  it('should store option values passed into it when instantiated', function() {
    var api = new XmlApiClient({
      keyID: '12345',
      vCode: 'longstringoftext',
      characterID: '1234',
      cache: new TestCache()
    });

    expect(api.keyID).to.equal('12345');
    expect(api.vCode).to.equal('longstringoftext');
    expect(api.characterID).to.equal('1234');
    expect(api.cache).to.be.an.instanceof(TestCache);
  });


  describe('Once instantiated, ', function () {
    var api;

    before(function() {
      api = new XmlApiClient({
        keyID: legitKeyID,
        vCode: legitVCode,
      });
    });

    it('should query the desired endpoint', function() {
      return api.get('account/Characters')
        .then(function(response) {
          expect(response.currentTime).to.be.defined;
          expect(response.result).to.be.defined;
          expect(response.result.rowset).to.be.defined;
          expect(response.result.cachedUntil).to.be.defined;
          expect(response.isCached).to.equal(false);
        })
        .catch(handlePromiseError);
    });

    it('should retrieve a previously cached version of the response if one exists', function() {
      return api.get('account/Characters')
        .then(function(response) {
          expect(response.currentTime).to.be.defined;
          expect(response.result).to.be.defined;
          expect(response.result.rowset).to.be.defined;
          expect(response.result.cachedUntil).to.be.defined;
          expect(response.isCached).to.equal(true);
        })
        .catch(handlePromiseError);
    });

    it('should force a new fetch if the forceGet argument is true', function() {
      return api.get('account/Characters')
        .then(function(response) {
          expect(response.currentTime).to.be.defined;
          expect(response.result).to.be.defined;
          expect(response.result.rowset).to.be.defined;
          expect(response.result.cachedUntil).to.be.defined;
          expect(response.isCached).to.equal(true);
        })
        .catch(handlePromiseError);
    });

    after(function() {
      api.cache.clearTimers();
    });
  });
});
