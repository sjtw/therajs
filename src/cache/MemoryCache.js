import moment from 'moment';

export default class MemoryCache {
  constructor() {
    this.data = {};
    this.timers = {};
  }

  put (key, value, timer)  {
    this.clear(key);
    this.clearTimer(key);
    this.data[key] = value;
    if (timer) {
      this.clearAfter(key, timer);
    }
  }

  clearTimer (key) {
    if (this.timers[key]) clearTimeout(this.timers[key]);
  }

  clearTimers () {
    for (var key in this.timers) {
      this.clearTimer(key);
    }
  }

  get (key) {
    if (this.data[key]) return this.data[key];
    else return null;
  }

  clear (key) {
    if (key) {
      if (this.data[key]) delete this.data[key];
      // clearTimer(key);
    } else {
      this.data = {};
      this.clearTimers();
    }
  }

  exists (key) {
    if (this.data[key]) return true;
    else return false;
  }

  clearAfter (key, timer) {
    if (key) this.timers[key] = setTimeout(() => this.clear(key), timer);
    else setTimeout(() => this.clear(), timer);
  }
}