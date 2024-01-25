'use strict';

const v = require('@mapbox/fusspot');

// Butterfly validators
const validateButterfly = v.assert(
  v.strictShape({
    commonName: v.required(v.string),
    species: v.required(v.string),
    article: v.required(v.string)
  })
);

// TODO - review can be optional
const validateButterflyRating = v.assert(
  v.strictShape({
    id: v.required(v.string),
    commonName: v.required(v.string),
    species: v.required(v.string),
    article: v.required(v.string),
    userId: v.required(v.string),
    rating: v.required(v.number),
    review: v.required(v.string)
  })
);


// User validators
const validateUser = v.assert(
  v.strictShape({
    username: v.required(v.string)
  })
);

module.exports = {
  validateButterfly,
  validateButterflyRating,
  validateUser
};
