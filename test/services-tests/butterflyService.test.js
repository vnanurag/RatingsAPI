'use strict';

const path = require('path');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const { getButterfly, createButterfly, postButterflyRating } = require('../../src/services/butterflyService');


// Mocking User service
jest.mock('../../src/services/userService');
const userService = require('../../src/services/userService');
const mockGetUser =  jest.spyOn(userService, 'getUser');

// Mocking DB service
jest.mock('../../src/database');
const testdb = require('../../src/database');
const mockDB = jest.spyOn(testdb, 'getDB');

let db;

beforeAll(async () => {
  // Create a test database
  const testDbPath = path.join('./test/', 'test.db.json');
  db = await lowdb(new FileAsync(testDbPath));

  // Fill the test database with data
  await db.setState({
    butterflies: [
      {
        id: 'wxyz9876',
        commonName: 'test-butterfly',
        species: 'Testium butterflius',
        article: 'https://example.com/testium_butterflius'
      },
      {
        id: 'wxyz98761',
        commonName: 'test-butterfly-with-multiple-ratings',
        species: 'Testium butterflius ratingus',
        article: 'https://example.com/testium_butterflius_ratingus',
        ratingByUsers: {
          abcd1234: {
            rating: 1,
            review: 'Bad butterfly'
          },
          abcd12345: {
            rating: 5,
            review: 'Great butterfly'
          },
          abcd123456: {
            rating: 3
          }
        }
      },
      {
        id: 'wxyz98762',
        commonName: 'test-butterfly-with-one-rating',
        species: 'Testium butterflius ratingus',
        article: 'https://example.com/testium_butterflius_ratingus',
        ratingByUsers: {
          abcd1234: {
            rating: 4
          }
        }
      },
      {
        id: 'wxyz987623',
        commonName: 'test-butterfly-with-one-rating-and-review',
        species: 'Testium butterflius ratingus',
        article: 'https://example.com/testium_butterflius_ratingus',
        ratingByUsers: {
          abcd1234: {
            rating: 3,
            review: 'Decent butterfly'
          }
        }
      }
    ],
    users: [
      {
        id: 'abcd1234',
        username: 'test-user-1',
        ratedButterflies: {
          wxyz98761: {
            rating: 1,
            review: 'Bad butterfly'
          },
          wxyz98762: {
            rating: 4
          },
          wxyz987623: {
            rating: 3,
            review: 'Decent butterfly'
          }
        }
      },
      {
        id: 'abcd12345',
        username: 'test-user-2',
        ratedButterflies: {
          wxyz98761: {
            rating: 5,
            review: 'Great butterfly'
          }
        }
      },
      {
        id: 'abcd123456',
        username: 'test-user-3',
        ratedButterflies: {
          wxyz98761: {
            rating: 3
          }
        }
      },
      {
        id: 'abcd1234567',
        username: 'test-user-4'
      }
    ]
  }).write();
});

afterAll(() => {
  jest.clearAllMocks();
});

describe('get butterfly', () => {
  it('success - get butterfly without ratings', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    const butterfly = await getButterfly('wxyz9876');

    expect(butterfly).toEqual({
      id: 'wxyz9876',
      commonName: 'test-butterfly',
      species: 'Testium butterflius',
      article: 'https://example.com/testium_butterflius'
    });
  });

  it('success - get butterfly with one rating', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    const butterfly = await getButterfly('wxyz98762');

    expect(butterfly).toEqual({
      id: 'wxyz98762',
      commonName: 'test-butterfly-with-one-rating',
      species: 'Testium butterflius ratingus',
      article: 'https://example.com/testium_butterflius_ratingus',
      ratingByUsers: {
        abcd1234: {
          rating: 4
        }
      }
    });
  });

  it('success - get butterfly with multiple ratings sorted', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    const butterfly = await getButterfly('wxyz98761');

    expect(butterfly).toEqual({
      id: 'wxyz98761',
      commonName: 'test-butterfly-with-multiple-ratings',
      species: 'Testium butterflius ratingus',
      article: 'https://example.com/testium_butterflius_ratingus',
      ratingByUsers: {
        abcd12345: {
          rating: 5,
          review: 'Great butterfly'
        },
        abcd123456: {
          rating: 3
        },
        abcd1234: {
          rating: 1,
          review: 'Bad butterfly'
        }
      }
    });
  });

  it('error - butterfly not found', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    expect(async () => {
      await getButterfly('bad-id');
    }).rejects.toThrow(new Error('Butterfly with id bad-id does not exist'));

  });
});

describe('create butterfly', () => {
  it('success - create butterfly', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    const butterfly = {
      id: 'new-butterfly-id',
      commonName: 'Boop',
      species: 'Boopi beepi',
      article: 'https://example.com/boopi_beepi'
    };

    const addedButterfly = await createButterfly(butterfly);

    expect(addedButterfly).toEqual({
      id: 'new-butterfly-id',
      commonName: 'Boop',
      species: 'Boopi beepi',
      article: 'https://example.com/boopi_beepi'
    });
  });
});

describe('post butterfly rating', () => {
  it('success - post butterfly rating', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });
    mockGetUser.mockImplementation(() => {
      return {
        id: 'abcd1234',
        username: 'test-user-1'
      };
    });

    const rating = {
      id: 'wxyz98762',
      userId: 'abcd1234',
      rating: 4
    };

    const buttterfly = await postButterflyRating(rating);

    expect(buttterfly).toEqual({
      id: 'wxyz98762',
      commonName: 'test-butterfly-with-one-rating',
      species: 'Testium butterflius ratingus',
      article: 'https://example.com/testium_butterflius_ratingus',
      ratingByUsers: {
        abcd1234: {
          rating: 4,
          review: undefined
        }
      }
    });
  });

  it('success - post butterfly rating with review', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });
    mockGetUser.mockImplementation(() => {
      return {
        id: 'abcd1234',
        username: 'test-user-1'
      };
    });

    const rating = {
      id: 'wxyz987623',
      userId: 'abcd1234',
      rating: 3,
      review: 'Decent butterfly'
    };

    const buttterfly = await postButterflyRating(rating);

    expect(buttterfly).toEqual({
      id: 'wxyz987623',
      commonName: 'test-butterfly-with-one-rating-and-review',
      species: 'Testium butterflius ratingus',
      article: 'https://example.com/testium_butterflius_ratingus',
      ratingByUsers: {
        abcd1234: {
          rating: 3,
          review: 'Decent butterfly'
        }
      }
    });
  });

  it('error - invalid butterfly', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    const rating = {
      id: 'bad-id',
      userId: 'abcd1234',
      rating: 4
    };

    expect(async () => {
      await postButterflyRating(rating);
    }).rejects.toThrow(new Error('Butterfly with id bad-id does not exist'));
  });

  it('error - invalid user', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });
    mockGetUser.mockImplementation(() => {
      throw new Error('User with id bad-id does not exist');
    });

    const rating = {
      id: 'wxyz98762',
      userId: 'bad-id',
      rating: 4
    };

    expect(async () => {
      await postButterflyRating(rating);
    }).rejects.toThrow(new Error('User with id bad-id does not exist'));
  });
});
