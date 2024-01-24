'use strict';

const v = require('@mapbox/fusspot');

const validateButterfly = v.assert(
  v.strictShape({
    id: v.required(v.string),
    commonName: v.required(v.string),
    species: v.required(v.string),
    article: v.required(v.string)
  })
);

const validateUser = v.assert(
  v.strictShape({
    id: v.required(v.string),
    username: v.required(v.string)
  })
);

const validateId = v.assert(v.required(v.nonEmptyString));

module.exports = {
  validateButterfly,
  validateUser,
  validateId
};
