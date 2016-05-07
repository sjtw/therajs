Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MemoryCache = function () {
  function MemoryCache() {
    _classCallCheck(this, MemoryCache);

    this.data = {};
    this.timers = {};
  }

  _createClass(MemoryCache, [{
    key: 'put',
    value: function put(key, value, timer) {
      this.clear(key);
      this.clearTimer(key);
      this.data[key] = value;
      if (timer) {
        this.clearAfter(key, timer);
      }
    }
  }, {
    key: 'clearTimer',
    value: function clearTimer(key) {
      if (this.timers[key]) clearTimeout(this.timers[key]);
    }
  }, {
    key: 'clearTimers',
    value: function clearTimers() {
      for (var key in this.timers) {
        this.clearTimer(key);
      }
    }
  }, {
    key: 'get',
    value: function get(key) {
      if (this.data[key]) return this.data[key];else return null;
    }
  }, {
    key: 'clear',
    value: function clear(key) {
      if (key) {
        if (this.data[key]) delete this.data[key];
        // clearTimer(key);
      } else {
          this.data = {};
          this.clearTimers();
        }
    }
  }, {
    key: 'exists',
    value: function exists(key) {
      if (this.data[key]) return true;else return false;
    }
  }, {
    key: 'clearAfter',
    value: function clearAfter(key, timer) {
      var _this = this;

      if (key) this.timers[key] = setTimeout(function () {
        return _this.clear(key);
      }, timer);else setTimeout(function () {
        return _this.clear();
      }, timer);
    }
  }]);

  return MemoryCache;
}();

exports.default = MemoryCache;
//# sourceMappingURL=MemoryCache.js.map
