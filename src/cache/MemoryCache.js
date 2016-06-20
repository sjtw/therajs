import moment from 'moment';

export default class MemoryCache {
  constructor() {
    this.data = {};
    this.timers = {};
  }

  put (key, value, timer)  {
    return new Promise((resolve, reject) => {
      this.delete(key);
      this.clearTimer(key);
      this.data[key] = value;
      if (timer) {
        this.deleteAfter(key, timer);
      }
      resolve(this.data[key]);
    });
  }

  get (key) {
    return new Promise((resolve, reject) => {
      if (this.data[key]) return resolve(this.data[key]);
      else return resolve(null);
    });
  }

  delete (key) {
    return new Promise((resolve, reject) => {
      if (key) {
        if (this.data[key]) delete this.data[key];
        // clearTimer(key);
      } else {
        this.data = {};
        this.clearTimers();
      }
      resolve();
    });
  }

  exists (key) {
    return new Promise((resolve, reject) => {
      if (this.data[key]) return resolve(true);
      else return resolve(false);
    });
  }

  // internal
  clearTimer (key) {
    if (this.timers[key]) clearTimeout(this.timers[key]);
  }

  // internal
  clearTimers () {
    for (var key in this.timers) {
      this.clearTimer(key);
    }
  }

  // internal
  deleteAfter (key, timer) {
    if (key) this.timers[key] = setTimeout(() => this.delete(key), timer);
    else setTimeout(() => this.delete(), timer);
  }
}
