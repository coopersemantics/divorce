# Contributing to divorce

## Working with a Fork

The first step to contributing fixes and improvements to `divorce` is [forking the repository](https://help.github.com/articles/fork-a-repo) into your own `GitHub` account. Make sure to [follow the instructions](https://help.github.com/articles/configuring-a-remote-for-a-fork) on how to 'Configure Remotes' and 'Pull in upstream changes'--you will need to keep your fork in sync with changes that happen in the official repository.

## Never Commit on Master

When working on a fork, always think of your master branch as a 'landing place' for upstream changes. Only make commits to topic branches.

## Commands

```bash
# Builds the library, lints it, and runs Promises/A+ unit tests
$ npm t

# Lints the library
$ npm run test:lint

# Runs Promises/A+ unit tests
$ npm run test:aplus

# Builds the library
$ npm run build
```

## Commit Message Guidelines

Commit messages are written in a simple format, which clearly describes the purpose of a change.

Commit message summaries must follow the following format:

```
<type>: <subject> (Github issue #)
```

### Type

* **build**: Changes that affect the build system or external dependencies
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)

### Subject

The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* do not capitalize the first letter
* no dot (.) at the end

Following the subject, a `Github` issue number must be added, e.g.,

```
fix: cannot call method "split" of undefined TypeError (#840)
```

## Submit a Pull Request

When your commit is ready to be reviewed, please submit a [pull request](https://help.github.com/articles/creating-a-pull-request).
Push the topic branch to your fork and then use one of the several options in `GitHub`'s interface to initiate the request. Please do not commit `dist` files.

It is generally a good practice to file an issue explaining your idea before writing code or submitting a pull request--especially when introducing new features.

## Versioning

Releases will be numbered using the following format:

```
<major>.<minor>.<patch>
```

And constructed with the following guidelines:

- Breaking backward compatibility **bumps the major** while resetting minor and patch
- New additions without breaking backward compatibility **bumps the minor** while resetting the patch
- Bug fixes and misc. changes **bumps only the patch**

For more information on `SemVer`, please visit [<http://semver.org>](http://semver.org).
