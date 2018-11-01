import { isObject, isFunction } from './utils';
import { promiseStatus, promiseValue, promiseQueue } from './symbols';
import { PENDING, RESOLVED, REJECTED } from './status';

/**
 * @method
 * @param {Object} promise
 * @param {*} value
 */
export const resolvePromise = (promise, value) => {
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
export const rejectPromise = (promise, reason) => {
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
export const resolutionProcedure = (promise, value) => {
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
