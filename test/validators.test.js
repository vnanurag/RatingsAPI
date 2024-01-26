'use strict';

const { validateButterfly, validateButterflyRating, validateUser } = require('../src/validators');

describe('validateButterfly', () => {
  const validButterfly = {
    commonName: 'Butterfly Name',
    species: 'Species name',
    article: 'http://example.com/article'
  };

  it('is ok for a valid butterfly', () => {
    const result = validateButterfly(validButterfly);
    expect(result).toBe(undefined);
  });

  it('throws an error when invalid', () => {
    expect(() => {
      validateButterfly({});
    }).toThrow('The following properties have invalid values:');

    expect(() => {
      validateButterfly({
        ...validButterfly,
        commonName: 123
      });
    }).toThrow('commonName must be a string.');

    expect(() => {
      validateButterfly({
        extra: 'field',
        ...validButterfly
      });
    }).toThrow('The following keys are invalid: extra');
  });
});

describe('validateButterflyRating', () => {
  const validButterflyRating = {
    id: 'wxyz98762',
    userId: 'abcd1234',
    rating: 4
  };

  const validButterflyRatingWithReview = {
    id: 'wxyz98762',
    userId: 'abcd1234',
    rating: 4,
    review: 'Good butterfly'
  };

  it('is ok for a valid rating', () => {
    const result = validateButterflyRating(validButterflyRating);
    expect(result).toBe(undefined);
  });

  it('is ok for a valid rating with a review ', () => {
    const result = validateButterflyRating(validButterflyRatingWithReview);
    expect(result).toBe(undefined);
  });

  it('throws an error when invalid', () => {
    expect(() => {
      validateButterflyRating({});
    }).toThrow('The following properties have invalid values:');

    expect(() => {
      validateButterflyRating({
        ...validButterflyRating,
        id: 123
      });
    }).toThrow('id must be a string.');

    expect(() => {
      validateButterflyRating({
        ...validButterflyRating,
        userId: 123
      });
    }).toThrow('userId must be a string.');

    expect(() => {
      validateButterflyRating({
        ...validButterflyRating,
        rating: '4'
      });
    }).toThrow('rating must be a number between 0 & 5 (inclusive).');

    expect(() => {
      validateButterflyRating({
        ...validButterflyRating,
        rating: -1
      });
    }).toThrow('rating must be a number between 0 & 5 (inclusive).');

    expect(() => {
      validateButterflyRating({
        ...validButterflyRating,
        rating: 6
      });
    }).toThrow('rating must be a number between 0 & 5 (inclusive).');

    expect(() => {
      validateButterflyRating({
        ...validButterflyRatingWithReview,
        review: 100
      });
    }).toThrow('review must be a string.');

    expect(() => {
      validateButterflyRating({
        extra: 'field',
        ...validButterflyRating
      });
    }).toThrow('The following keys are invalid: extra');
  });
});

describe('validateUser', () => {
  const validUser = {
    username: 'test-user'
  };

  it('is ok for a valid user', () => {
    const result = validateUser(validUser);
    expect(result).toBe(undefined);
  });

  it('throws an error when invalid', () => {
    expect(() => {
      validateUser({});
    }).toThrow('username is required');

    expect(() => {
      validateUser({
        extra: 'field',
        ...validUser
      });
    }).toThrow('The following keys are invalid: extra');

    expect(() => {
      validateUser({
        username: [555]
      });
    }).toThrow('username must be a string');
  });
});
