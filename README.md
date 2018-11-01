<a href="https://promisesaplus.com">
  <img src="https://promisesaplus.com/assets/logo-small.png" align="right" alt="Promises/A+">
</a>

# divorce

A lightweight [Promises/A+](https://promisesaplus.com) compliant library.

## Quick Start

```
$ npm i git+https://git@github.com/coopersemantics/divorce.git -P
```

```javascript
// ES2015
import Divorce from 'divorce';

// Node.js/CommonJS
const Divorce = require('divorce');
```

## API

### new Divorce(executor)

The `Divorce` object represents the eventual completion (or failure) of an asynchronous operation, and its resulting value.

#### Parameters

`executor` - A function that is passed with arguments `resolve` and `reject`. The `resolve` and `reject` functions, when called, `resolve` or `reject` the `Divorce` object, respectively.

#### Syntax

```javascript
new Divorce((resolve, reject) => {...});
```

### Divorce.prototype.then(onFulfilled[, onRejected])

The `then()` method returns a `Divorce` object. It takes up to two arguments: callback functions for the success and failure cases of the `Divorce` object.

#### Parameters

`onFulfilled` - A function called if the `Divorce` object is fulfilled. This function has one argument, the fulfillment `value`.

`onRejected` - A function called if the `Divorce` object is rejected. This function has one argument, the rejection `reason`.

#### Syntax

```javascript
// const divorce = Divorce.resolve(...);

divorce.then(value => {
  // fulfillment
});

divorce.then(value => {
  // fulfillment
}, reason => {
  // rejection
});
```

### Divorce.prototype.catch(onRejected)

The `catch()` method returns a `Divorce` object and deals with rejected cases only. It behaves the same as calling `Divorce.prototype.then(undefined, onRejected)`.

#### Parameters

`onRejected` - A function called when the `Divorce` object is rejected. The function has one argument: `reason`--the rejection reason.

#### Syntax

```javascript
// const divorce = Divorce.reject(...);

divorce.catch(reason => {
  // rejection
});
```

### Divorce.resolve(value|Divorce|thenable)

The `Divorce.resolve(value)` method returns a `Divorce` object that is resolved with the given value. If the `value` is a `Divorce` object, that `Divorce` object is returned; if the `value` is a thenable, the returned `Divorce` object will follow that thenable, adopting its eventual state; otherwise, the returned `Divorce` object will be fulfilled with the `value`.

#### Parameters

`value` - Argument to be resolved by `this` `Divorce` object. Can also be a `Divorce` object or a thenable to resolve.

#### Syntax

```javascript
Divorce.resolve(value);
Divorce.resolve(Divorce);
Divorce.resolve(thenable);
```

### Divorce.reject(reason)

The `Divorce.reject(reason)` method returns a `Divorce` object that is rejected with the given reason.

#### Parameters

`reason` - Reason why `this` `Divorce` object rejected.

#### Syntax

```javascript
Divorce.reject(reason);
```

## Contributing

To contribute, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is released under the [MIT license](LICENSE).
