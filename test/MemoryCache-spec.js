import MemoryCache from '../src/cache/MemoryCache.js';
import {expect} from 'chai';

describe('MemoryCache', function () {
  var cache;

  beforeEach(function() {
    cache = new MemoryCache();
  });

  it('should export a get property', function() {
    expect(cache).to.have.property('get');
  });

  it('should expose a put property', function() {
    expect(cache).to.have.property('put');
  });

  it('should expose a delete property', function() {
    expect(cache).to.have.property('delete');
  });

  describe('put', function () {

    beforeEach(function() {
      cache = new MemoryCache();
    });

    it('it should store a value against a key', function () {
      return cache.put('mykey', 'myval').then(() => {
        expect(cache.data.mykey).to.equal('myval');
      });
    });

    it('should delete a value after a set time, if a timeout is defined when put is called', function(done) {
      var timer = 1000;
      cache.put('mykey2', 'myval2', timer)
        .then(savedDoc => {
          return cache.get('mykey2');
        })
        .then(value => {
          expect(value).to.equal('myval2');
          setTimeout(function() {
            cache.get('mykey2').then(value => {
              expect(value).to.equal(null);
              done();
            });
          }, timer + 10);
        });
    });
  });

  describe('get', function () {

    beforeEach(function() {
      cache = new MemoryCache();
    });

    it('should retrieve the document stored against a key', function() {
      return cache.put('mykey', 'myval').then(() => {
        return cache.get('mykey').then(storedDoc => {
          expect(storedDoc).to.equal('myval');
          expect(cache.data.mykey).to.equal(storedDoc);
        });
      });
    });

  });

  describe('delete', function () {
    it('should delete everything which was set', function() {
      cache.put('key1', 'val1');
      cache.put('key2', 'val2');
      cache.put('key3', 'val3');
      expect(cache.get('key1')).to.equal('val1');
      expect(cache.get('key2')).to.equal('val2');
      expect(cache.get('key3')).to.equal('val3');
      cache.delete();
      expect(cache.get('key1')).to.equal(null);
      expect(cache.get('key2')).to.equal(null);
      expect(cache.get('key3')).to.equal(null);
    });

    it('should delete the value of a single key', function() {
      cache.put('key1', 'val1');
      cache.put('key2', 'val2');
      cache.put('key3', 'val3');

      cache.delete('key1');

      expect(cache.get('key1')).to.equal(null);
      expect(cache.get('key2')).to.equal('val2');
      expect(cache.get('key3')).to.equal('val3');
    });
  });

  describe('deleteAfter', function () {
    it('should delete everything after the timer', function(done) {
      var timeout = 1000;
      cache.put('key1', 'val1');
      cache.put('key2', 'val2');
      cache.put('key3', 'val3');

      cache.deleteAfter(null, timeout);
      setTimeout(() => {
        expect(cache.get('key1')).to.equal(null);
        expect(cache.get('key2')).to.equal(null);
        expect(cache.get('key3')).to.equal(null);
        done();
      }, timeout);

      expect(cache.get('key1')).to.equal('val1');
      expect(cache.get('key2')).to.equal('val2');
      expect(cache.get('key3')).to.equal('val3');
    });
  });
});
