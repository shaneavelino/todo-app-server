Troubleshooting:

```> npx prisma init
(node:16732) ExperimentalWarning: CommonJS module /usr/local/lib/node_modules/npm/node_modules/debug/src/node.js is loading ES Module /usr/local/lib/node_modules/npm/node_modules/supports-color/index.js using require().
Support for loading ES Module in require() is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Need to install the following packages:
prisma@6.0.1
Ok to proceed? (y)

Error: (0 , USe.isError) is not a function

Downgrade Node to v20.18.0 if current version >20.18.0

https://github.com/prisma/prisma/issues/25560

```
