/**
 * divorce v0.1.1
 * Copyright 2018 coopersemantics
 * Available under MIT license <https://github.com/coopersemantics/divorce/blob/master/LICENSE>
 */

var callable, byObserver;

callable = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

byObserver = function (Observer) {
	var node = document.createTextNode(''), queue, currentQueue, i = 0;
	new Observer(function () {
		var callback;
		if (!queue) {
			if (!currentQueue) return;
			queue = currentQueue;
		} else if (currentQueue) {
			queue = currentQueue.concat(queue);
		}
		currentQueue = queue;
		queue = null;
		if (typeof currentQueue === 'function') {
			callback = currentQueue;
			currentQueue = null;
			callback();
			return;
		}
		node.data = (i = ++i % 2); // Invoke other batch, to handle leftover callbacks in case of crash
		while (currentQueue) {
			callback = currentQueue.shift();
			if (!currentQueue.length) currentQueue = null;
			callback();
		}
	}).observe(node, { characterData: true });
	return function (fn) {
		callable(fn);
		if (queue) {
			if (typeof queue === 'function') queue = [queue, fn];
			else queue.push(fn);
			return;
		}
		queue = fn;
		node.data = (i = ++i % 2);
	};
};

var nextTick = (function () {
	// Node.js
	if ((typeof process === 'object') && process && (typeof process.nextTick === 'function')) {
		return process.nextTick;
	}

	// MutationObserver
	if ((typeof document === 'object') && document) {
		if (typeof MutationObserver === 'function') return byObserver(MutationObserver);
		if (typeof WebKitMutationObserver === 'function') return byObserver(WebKitMutationObserver);
	}

	// W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(callable(cb)); };
	}

	// Wide available standard
	if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
		return function (cb) { setTimeout(callable(cb), 0); };
	}

	return null;
}());

const isObject = value =>
  Object.prototype.toString.call(value) === '[object Object]';

const isFunction = value =>
  Object.prototype.toString.call(value) === '[object Function]';

const promiseStatus = Symbol('[[promiseStatus]]');
const promiseValue = Symbol('[[promiseValue]]');
const promiseQueue = Symbol('[[promiseQueue]]');

const RESOLVED = 'resolved';
const REJECTED = 'rejected';
const PENDING = 'pending';

/**
 * @method
 * @param {Object} promise
 * @param {*} value
 */
const resolvePromise = (promise, value) => {
  if (promise[promiseStatus] !== PENDING) {
    return;
  }

  promise[promiseValue] = value;
  promise[promiseStatus] = RESOLVED;
  promise[promiseQueue].forEach(({ onFulfilled }) => onFulfilled());
};

/**
 * @method
 * @param {Object} promise
 * @param {*} reason
 */
const rejectPromise = (promise, reason) => {
  if (promise[promiseStatus] !== PENDING) {
    return;
  }

  promise[promiseValue] = reason;
  promise[promiseStatus] = REJECTED;
  promise[promiseQueue].forEach(({ onRejected }) => onRejected());
};

/**
 * @method
 * @description The `promise` resolution procedure is an abstract operation taking as input a `promise`
 * and a `value`. If `value` is a thenable, it attempts to make `promise` adopt the state of `value`, under the
 * assumption that `value` behaves at least somewhat like a `promise`. Otherwise, it fulfills `promise` with the `value`.
 * @param {Object} promise
 * @param {*} value
 */
const resolutionProcedure = (promise, value) => {
  if (promise === value) {
    return rejectPromise(promise, new TypeError('Chaining cycle detected for promise #<Promise>'));
  }

  if (value instanceof promise.constructor) {
    return value.then(
      (val) => resolvePromise(promise, val),
      (rej) => rejectPromise(promise, rej)
    );
  }

  if (!(isObject(value) || isFunction(value))) {
    return resolvePromise(promise, value);
  }

  let then;

  try {
    then = value.then;
  } catch (reason) {
    rejectPromise(promise, reason);
  }

  if (!isFunction(then)) {
    return resolvePromise(promise, value);
  }

  let isCalled = false;

  try {
    then.call(
      value,
      (val) => {
        if (!isCalled) {
          resolutionProcedure(promise, val);
          isCalled = true;
        }
      },
      (rej) => {
        if (!isCalled) {
          rejectPromise(promise, rej);
          isCalled = true;
        }
      }
    );
  } catch (reason) {
    if (!isCalled) {
      rejectPromise(promise, reason);
    }
  }
};

/**
 * @class Divorce
 */
class Divorce {
  /**
   * @constructor
   * @description Represents the eventual completion (or failure) of an
   * asynchronous operation and its resulting value.
   * @param {Function} executor
   */
  constructor (executor) {
    this[promiseStatus] = PENDING;
    this[promiseValue] = undefined;
    this[promiseQueue] = [];

    try {
      executor(
        value => resolutionProcedure(this, value),
        reason => rejectPromise(this, reason)
      );
    } catch (reason) {
      rejectPromise(this, reason);
    }
  }

  /**
   * @method
   * @description Returns a `Divorce` object that takes up to two arguments:
   * callback functions for the success and failure cases of the `Divorce` object.
   * @param {Function} onFulfilled
   * @param {Function} [onRejected]
   * @returns {Object} Divorce
   */
  then (onFulfilled, onRejected) {
    return new Divorce((resolve, reject) => {
      const onFulfilledHandler = executeOnNextTick(
        !isFunction(onFulfilled) ? (value) => value : onFulfilled,
        this,
        resolve,
        reject
      );
      const onRejectedHandler = executeOnNextTick(
        !isFunction(onRejected) ? (reason) => { throw reason; } : onRejected,
        this,
        resolve,
        reject
      );

      ({
        [RESOLVED]: () => onFulfilledHandler(),
        [REJECTED]: () => onRejectedHandler(),
        [PENDING]: () =>
          this[promiseQueue].push({
            onFulfilled: onFulfilledHandler,
            onRejected: onRejectedHandler,
          }),
      }[this[promiseStatus]]());
    });
  }

  /**
   * @method
   * @description Returns a `Divorce` object and deals with rejected cases only.
   * @param {Function} onRejected
   * @returns {Object} Divorce
   */
  catch (onRejected) {
    return this.then(undefined, onRejected);
  }

  /**
   * @method
   * @description Default string description of the object--accessed internally
   * by the `Object.prototype.toString()` method.
   * @returns {String}
   */
  get [Symbol.toStringTag] () {
    return 'Promise';
  }

  /**
   * @static
   * @description Returns a `Divorce` object that is resolved with a given value.
   * @param {*} value
   * @returns {Object} Divorce
   */
  static resolve (value) {
    return new Divorce(resolve => resolve(value));
  }

  /**
   * @static
   * @description Returns a `Divorce` object that is rejected with a given reason.
   * @param {*} reason
   * @returns {Object} Divorce
   */
  static reject (reason) {
    return new Divorce((resolve, reject) => reject(reason));
  }
}

const executeOnNextTick = (handler, promise, resolve, reject) =>
  () => {
    nextTick(() => {
      try {
        resolve(handler(promise[promiseValue]));
      } catch (reason) {
        reject(reason);
      }
    });
  };

export default Divorce;
//# sourceMappingURL=divorce.mjs.map
