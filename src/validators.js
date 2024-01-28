// @ts-check
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

const validateButterflyRating = v.assert(
  v.strictShape({
    id: v.required(v.string),
    userId: v.required(v.string),
    rating: v.required(v.range([0, 5])),
    review: v.string // adding  a review is optional
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

