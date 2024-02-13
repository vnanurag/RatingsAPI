# 🦋 Butterfly critique

Butterfly critique is an API designed for butterfly enthusiasts. So far, it's an [`express`](https://expressjs.com/)-based API that stores butterflies and users.

Data persistence is through a JSON-powered database called [`lowdb`](https://github.com/typicode/lowdb).

Validation is built using an assertion library called [`@mapbox/fusspot`](https://github.com/mapbox/fusspot).

### Requirements

* Node v18.x
* npm v9.x

### Setup

Install dependencies with:

```sh
npm ci
```

Butterfly critique uses lowdb to manage a JSON database. You can find the [lowdb@1.0.0 docs here](https://github.com/typicode/lowdb/tree/v1.0.0#readme). If you need to recreate the butterflies database, you can run:

```sh
npm run init-db
```

### Running

To run the application locally:

```sh
npm start
```

You should see a message that the application has started:

```sh
Butterfly API started at http://localhost:8000
```

You can manually try out the application using `curl`:

```sh
# GET a butterfly
curl http://localhost:8000/butterflies/xRKSdjkBt4

# POST a new butterfly
curl -X POST -d '{"commonName":"Brimstone", "species":"Gonepteryx rhamni", "article":"https://en.wikipedia.org/wiki/Gonepteryx_rhamni"}' -H 'content-type: application/json' http://localhost:8000/butterflies

# GET a user
curl http://localhost:8000/users/OOWzUaHLsK
```

**For developing**, you can run the application with auto-restarts on code changes using:

```sh
npm run watch
```

### Testing

This project uses [`jest`](https://jestjs.io/) as its testing framework.
If you are unfamiliar with `jest`, check out its [documentation](https://jestjs.io/docs/en/getting-started).

This project has `eslint` and a custom config [`@mapbox/eslint-config-mapbox`](https://www.npmjs.com/package/@mapbox/eslint-config-mapbox) setup for code linting.

To run the linter and all tests:

```sh
npm test
```

**For developing**, you can run `jest` with auto-restarts using:

```sh
npm run test-watch
```
