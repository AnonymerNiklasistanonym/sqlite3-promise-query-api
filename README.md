# sqlite3-promise-query-api

A promise wrapper around sqlite3 with additional query and type support

*UNOFFICIAL!*

**Attention: This is only a prototype that is currently aimed at providing easy promise access to sqlite3 databases!**

- [Getting started](#getting-started)
  - [Use it in a Node.js project](#use-it-in-a-nodejs-project)
  - [Use it in a Typescript project](#use-it-in-a-typescript-project)
- [Testing and Linting](#testing-and-linting)
  - [Testing](#testing)
    - [Coverage](#coverage)
  - [Linting and Formatting](#linting-and-formatting)
- [Manage npm package](#manage-npm-package)
  - [Preview package content](#preview-package-content)
  - [Update/Publish package](#updatepublish-package)

## Getting started

### Use it in a Node.js project

`package.json`:

```json
{
    "name": "test-sqlite3-promise-query-api-nodejs",
    "version": "1.0.0",
    "scripts": {
        "start": "node index.js"
    },
    "dependencies": {
        "sqlite3-promise-query-api": "^0.0.1"
    }
}
```

`index.js`:

```js
const db = require("sqlite3-promise-query-api").default
```

### Use it in a Typescript project

`package.json`:

```json
{
    "name": "test-sqlite3-promise-query-api-typescript",
    "version": "1.0.0",
    "scripts": {
        "build": "tsc",
        "start": "node dist/index.js"
    },
    "dependencies": {
        "sqlite3-promise-query-api": "^0.0.1"
    },
    "devDependencies": {
        "typescript": "^4.8.3"
    }
}
```

`tsconfig.json`:

```json
{
    "compilerOptions": {
        "module": "CommonJS",
        "outDir": "dist",
        "moduleResolution": "Node",
        "target": "ES6"
    },
    "exclude": [
      "dist",
      "node_modules"
    ]
}
```

`index.ts`:

```js
import db from "sqlite3-promise-query-api"
// Types can be imported too
import type { SqliteTable, SqliteView } from "sqlite3-promise-query-api"
```

Run:

```sh
npm run build
npm start
```

## Testing and Linting

### Testing

To run the existing tests you can run:

```sh
npm run test
```

#### Coverage

To see which parts (branches and functions) of the code are covered by the tests you can run:

```sh
npm run nyc
```

This does the same thing as running `npm run test` but tracks the test coverage.

You can see the results either in the console or by opening the created `./coverage/index.html` file.

### Linting and Formatting

To format and lint the source code (and automatically fix fixable problems) run:

```sh
npm run lint-fix
npm run format-fix
```

To only check if the source code fulfills the requirements run:

```sh
npm run lint
npm run format
```

## Manage npm package

### Preview package content

```sh
npm pack --dry-run
```

### Update/Publish package

```sh
# Login to your npm account
npm login
# [Optional]: Commit all changes to the git repository
git add -A && git commit
# [Optional]: Increase the patch version of the package
#             which automatically creates a new commit
npm version patch
# Push the new package
npm publish
```

In the github repository is also a [github workflow](.github/workflows/npm-publish.yml) that publishes the package when pushing a new tag:

```sh
# [...]
npm version patch
# Push the changes to github
git push
# If not automatically push the created tag(s)
git push --tags
# Now the workflow should be triggered too and automatically
# publish a new version of the package to npm
```
