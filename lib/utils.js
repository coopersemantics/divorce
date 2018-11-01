export const isObject = value =>
  Object.prototype.toString.call(value) === '[object Object]';

export const isFunction = value =>
  Object.prototype.toString.call(value) === '[object Function]';
