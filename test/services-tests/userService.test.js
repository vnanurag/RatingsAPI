'use strict';

const path = require('path');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const { getUser, createUser } = require('../../src/services/userService');

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

describe('get user', () => {
  it('success - get user without ratings', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    const user = await getUser('abcd1234567');

    expect(user).toEqual({
      id: 'abcd1234567',
      username: 'test-user-4'
    });
  });

  it('success - get user with one rating', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    const user = await getUser('abcd123456');

    expect(user).toEqual({
      id: 'abcd123456',
      username: 'test-user-3',
      ratedButterflies: {
        wxyz98761: {
          rating: 3
        }
      }
    });
  });

  it('success - get user with multiple ratings sorted', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    const user = await getUser('abcd1234');

    expect(user).toEqual({
      id: 'abcd1234',
      username: 'test-user-1',
      ratedButterflies: {
        wxyz98762: {
          rating: 4
        },
        wxyz987623: {
          rating: 3,
          review: 'Decent butterfly'
        },
        wxyz98761: {
          rating: 1,
          review: 'Bad butterfly'
        }
      }
    });
  });

  it('error - user not found', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    expect(async () => {
      await getUser('bad-id');
    }).rejects.toThrow(new Error('User with id bad-id does not exist'));

  });
});

describe('create user', () => {
  it('success - create user', async () => {
    mockDB.mockImplementation(() => {
      return db;
    });

    const user = {
      id: 'new-user-id',
      username: 'New user'
    };

    const addedUser = await createUser(user);

    expect(addedUser).toEqual({
      id: 'new-user-id',
      username: 'New user'
    });
  });
});

