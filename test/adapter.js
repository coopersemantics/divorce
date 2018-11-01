'use strict';

const Divorce = require('..');

exports.resolved = value =>
  new Divorce(resolve => resolve(value));

exports.rejected = reason =>
  new Divorce((resolve, reject) => reject(reason));

exports.deferred = () => {
  let resolve;
  let reject;
  let promise = new Divorce((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};
