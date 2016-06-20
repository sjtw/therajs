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
      return Promise.all([
        cache.put('key1', 'val1'),
        cache.put('key2', 'val2'),
        cache.put('key3', 'val3')
      ]).then(() => {
        expect(cache.data.key1).to.equal('val1');
        expect(cache.data.key2).to.equal('val2');
        expect(cache.data.key3).to.equal('val3');
      }).then(() => {
        return cache.delete();
      }).then(() => {
        return Promise.all([
          cache.get('key1'),
          cache.get('key2'),
          cache.get('key3')
        ]);
      }).then(values => {
        expect(values[0]).to.be.null;
        expect(values[1]).to.be.null;
        expect(values[2]).to.be.null;
      });
    });

    it('should delete the value of a single key', function() {
      return Promise.all([
        cache.put('key1', 'val1'),
        cache.put('key2', 'val2'),
        cache.put('key3', 'val3')
      ]).then(() => {
        return cache.delete('key1');
      }).then(() => {
        return Promise.all([
          cache.get('key1'),
          cache.get('key2'),
          cache.get('key3')
        ]);
      }).then(values => {
        expect(values[0]).to.equal(null);
        expect(values[1]).to.equal('val2');
        expect(values[2]).to.equal('val3');
      });
    });
  });

  describe('deleteAfter', function () {
    it('should delete everything after the timer', function(done) {
      Promise.all([
        cache.put('key1', 'val1'),
        cache.put('key2', 'val2'),
        cache.put('key3', 'val3')
      ]).then(values => {
        // values should have been set
        expect(values[0]).to.equal('val1');
        expect(values[1]).to.equal('val2');
        expect(values[2]).to.equal('val3');
        cache.deleteAfter('key1', 1000);
        cache.deleteAfter('key2', 1000);
        cache.deleteAfter('key3', 1000);
      }).then(values => {
        // values should still exist
        expect(cache.data.key1).to.equal('val1');
        expect(cache.data.key2).to.equal('val2');
        expect(cache.data.key3).to.equal('val3');
        setTimeout(() => {
          Promise.all([
            cache.get('key1'),
            cache.get('key2'),
            cache.get('key3')
          ]).then(values => {
            // values should now be deleted
            expect(values[0]).to.equal(null);
            expect(values[1]).to.equal(null);
            expect(values[2]).to.equal(null);
            done();
          });
        }, 1010)
      });
    });
  });
});
