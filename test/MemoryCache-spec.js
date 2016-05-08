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

	it('should expose a clear property', function() {
		expect(cache).to.have.property('clear');
	});

	describe('get/set', function () {
		it('it should store & retreive a value', function () {
			cache.put('mykey', 'myval');
			expect(cache.get('mykey')).to.equal('myval');
		});

		it('should delete a value after a set time, if a timeout is defined when put is called', function(done) {
			var timer = 1000;
			cache.put('mykey2', 'myval2', timer);
			expect(cache.get('mykey2')).to.equal('myval2');
			setTimeout(function() {
				expect(cache.get('mykey2')).to.equal(null);
				done();
			}, timer + 10);
		});
	});

	describe('clear', function () {
		it('should clear everything which was set', function() {
			cache.put('key1', 'val1');
			cache.put('key2', 'val2');
			cache.put('key3', 'val3');
			expect(cache.get('key1')).to.equal('val1');
			expect(cache.get('key2')).to.equal('val2');
			expect(cache.get('key3')).to.equal('val3');
			cache.clear();
			expect(cache.get('key1')).to.equal(null);
			expect(cache.get('key2')).to.equal(null);
			expect(cache.get('key3')).to.equal(null);
		});

		it('should clear the value of a single key', function() {
			cache.put('key1', 'val1');
			cache.put('key2', 'val2');
			cache.put('key3', 'val3');

			cache.clear('key1');

			expect(cache.get('key1')).to.equal(null);
			expect(cache.get('key2')).to.equal('val2');
			expect(cache.get('key3')).to.equal('val3');
		});
	});

	describe('clearAfter', function () {
		it('should clear everything after the timer', function(done) {
			var timeout = 1000;
			cache.put('key1', 'val1');
			cache.put('key2', 'val2');
			cache.put('key3', 'val3');

			cache.clearAfter(null, timeout);
			setTimeout(() => {
				expect(cache.get('key1')).to.equal(null);
				expect(cache.get('key2')).to.equal(null);
				expect(cache.get('key3')).to.equal(null);
				done()
			}, timeout);

			expect(cache.get('key1')).to.equal('val1');
			expect(cache.get('key2')).to.equal('val2');
			expect(cache.get('key3')).to.equal('val3');
		});
	});
});
