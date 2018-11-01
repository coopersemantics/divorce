import nextTick from 'next-tick';
import { isFunction } from './utils';
import { promiseStatus, promiseValue, promiseQueue } from './symbols';
import { RESOLVED, REJECTED, PENDING } from './status';
import { resolutionProcedure, rejectPromise } from './resolution';

/**
 * @class Divorce
 */
export default class Divorce {
  /**
   * @constructor
   * @description Represents the eventual completion (or failure) of an
   * asynchronous operation and its resulting value.
   * @param {Function} resolver
   */
  constructor (resolver) {
    this[promiseStatus] = PENDING;
    this[promiseValue] = undefined;
    this[promiseQueue] = [];

    try {
      resolver(
        value => resolutionProcedure(this, value),
        reason => rejectPromise(this, reason)
      );
    } catch (reason) {
      rejectPromise(this, reason);
    }
  }

  /**
   * @method
   * @description Returns a `Divorce` object that takes two arguments:
   * callback functions for the success and failure cases of the `Divorce` object.
   * @param {Function} onFulfilled
   * @param {Function} [onRejected]
   * @returns {Object} Divorce
   */
  then (onFulfilled, onRejected) {
    return new Divorce((resolve, reject) => {
      const onFulfilledHandler = wrapHandler(
        !isFunction(onFulfilled) ? (value) => value : onFulfilled,
        this,
        resolve,
        reject
      );
      const onRejectedHandler = wrapHandler(
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

const wrapHandler = (handler, promise, resolve, reject) =>
  () => {
    nextTick(() => {
      try {
        resolve(handler(promise[promiseValue]));
      } catch (reason) {
        reject(reason);
      }
    });
  };
