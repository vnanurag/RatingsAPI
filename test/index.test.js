'use strict';

const path = require('path');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const request = require('supertest');
const shortid = require('shortid');

const createApp = require('../src/index');

let app;

beforeAll(async () => {
  // Create a test database
  const testDbPath = path.join(__dirname, 'test.db.json');
  const db = await lowdb(new FileAsync(testDbPath));

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

  // Create an app instance
  app = await createApp(testDbPath);
});

describe('GET root', () => {
  it('success', async () => {
    const response = await request(app)
      .get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Server is running!'
    });
  });
});

// #region butterfly tests

describe('GET butterfly', () => {
  it('success - butterfly with no ratings', async () => {
    const response = await request(app)
      .get('/butterflies/wxyz9876');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'wxyz9876',
      commonName: 'test-butterfly',
      species: 'Testium butterflius',
      article: 'https://example.com/testium_butterflius'
    });
  });

  it('success - butterfly with ratings sorted', async () => {
    const response = await request(app)
      .get('/butterflies/wxyz98761');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
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
    const response = await request(app)
      .get('/butterflies/bad-id');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Butterfly with id bad-id does not exist'
    });
  });
});

describe('POST butterfly', () => {
  it('success', async () => {
    shortid.generate = jest.fn().mockReturnValue('new-butterfly-id');

    const postResponse = await request(app)
      .post('/butterflies')
      .send({
        commonName: 'Boop',
        species: 'Boopi beepi',
        article: 'https://example.com/boopi_beepi'
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
      id: 'new-butterfly-id',
      commonName: 'Boop',
      species: 'Boopi beepi',
      article: 'https://example.com/boopi_beepi'
    });

    const getResponse = await request(app)
      .get('/butterflies/new-butterfly-id');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: 'new-butterfly-id',
      commonName: 'Boop',
      species: 'Boopi beepi',
      article: 'https://example.com/boopi_beepi'
    });
  });

  it('error - empty body', async () => {
    const response = await request(app)
      .post('/butterflies')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - missing all attributes', async () => {
    const response = await request(app)
      .post('/butterflies')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - missing some attributes', async () => {
    const response = await request(app)
      .post('/butterflies')
      .send({ commonName: 'boop' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - internal server error', async () => {
    shortid.generate = jest.fn().mockReturnValue('new-butterfly-id')();

    const postResponse = await request(app)
      .post('/butterflies')
      .send({
        commonName: 'Boop',
        species: 'Boopi beepi',
        article: 'https://example.com/boopi_beepi'
      });

    expect(postResponse.status).toBe(500);
    expect(postResponse.body).toEqual({
      error: 'Internal Server error'
    });
  });
});

describe('POST butterfly rating', () => {
  it('success - rating posted successfully', async () => {
    const postResponse = await request(app)
      .post('/butterflies/addRating')
      .send({
        id: 'wxyz98762',
        userId: 'abcd1234',
        rating: 4
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
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

    const getResponse = await request(app)
      .get('/butterflies/wxyz98762');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
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

  it('success - rating posted successfully - butterfly ratings sorted', async () => {

    const postResponse = await request(app)
      .post('/butterflies/addRating')
      .send({
        id: 'wxyz98761',
        userId: 'abcd1234',
        rating: 1,
        review: 'Bad butterfly'
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
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

    const getResponse = await request(app)
      .get('/butterflies/wxyz98761');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
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

  it('success - rating posted successfully with a review', async () => {

    const postResponse = await request(app)
      .post('/butterflies/addRating')
      .send({
        id: 'wxyz987623',
        userId: 'abcd1234',
        rating: 3,
        review: 'Decent butterfly'
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
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

    const getResponse = await request(app)
      .get('/butterflies/wxyz987623');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
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
    const postResponse = await request(app)
      .post('/butterflies/addRating')
      .send({
        id: 'bad-id',
        userId: 'wxyz98762',
        rating: 4
      });

    expect(postResponse.status).toBe(500);
    expect(postResponse.body).toEqual({
      error: 'Butterfly with id bad-id does not exist'
    });
  });

  it('error - invalid user', async () => {
    const postResponse = await request(app)
      .post('/butterflies/addRating')
      .send({
        id: 'wxyz98762',
        userId: 'bad-id',
        rating: 4
      });

    expect(postResponse.status).toBe(500);
    expect(postResponse.body).toEqual({
      error: 'User with id bad-id does not exist'
    });
  });

  it('error - rating > 5', async () => {
    const response = await request(app)
      .post('/butterflies/addRating')
      .send({
        id: 'wxyz98762',
        userId: 'abcd1234',
        rating: 6
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body - Invalid rating/review'
    });
  });

  it('error - rating < 0', async () => {
    const response = await request(app)
      .post('/butterflies/addRating')
      .send({
        id: 'wxyz98762',
        userId: 'abcd1234',
        rating: -1
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body - Invalid rating/review'
    });
  });

  it('error - invalid rating - non integer', async () => {
    const response = await request(app)
      .post('/butterflies/addRating')
      .send({
        id: 'wxyz98762',
        userId: 'abcd1234',
        rating: '4'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body - Invalid rating/review'
    });
  });

  it('error - empty body', async () => {
    const response = await request(app)
      .post('/butterflies/addRating')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body - Invalid rating/review'
    });
  });

  it('error - missing all attributes', async () => {
    const response = await request(app)
      .post('/butterflies/addRating')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body - Invalid rating/review'
    });
  });

  it('error - missing some attributes', async () => {
    const response = await request(app)
      .post('/butterflies/addRating')
      .send({ rating: 4 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body - Invalid rating/review'
    });
  });

  // Optional test to check for reviews
  it('error - invalid review - non string', async () => {
    const response = await request(app)
      .post('/butterflies/addRating')
      .send({
        id: 'wxyz98762',
        userId: 'abcd1234',
        rating: 4,
        review: 100
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body - Invalid rating/review'
    });
  });
});

// #endregion butterfly tests

// #region user tests
describe('GET user', () => {
  it('success - user with no ratings', async () => {
    const response = await request(app)
      .get('/users/abcd1234567');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'abcd1234567',
      username: 'test-user-4'
    });
  });

  it('success - user with one rating', async () => {
    const response = await request(app)
      .get('/users/abcd12345');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'abcd12345',
      username: 'test-user-2',
      ratedButterflies: {
        wxyz98761: {
          rating: 5,
          review: 'Great butterfly'
        }
      }
    });
  });

  it('success - user with ratings sorted', async () => {
    const response = await request(app)
      .get('/users/abcd1234');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
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
    const response = await request(app)
      .get('/users/bad-id');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'User with id bad-id does not exist'
    });
  });
});

describe('POST user', () => {
  it('success', async () => {
    shortid.generate = jest.fn().mockReturnValue('new-user-id');

    const postResponse = await request(app)
      .post('/users')
      .send({
        username: 'Buster'
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
      id: 'new-user-id',
      username: 'Buster'
    });

    const getResponse = await request(app)
      .get('/users/new-user-id');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: 'new-user-id',
      username: 'Buster'
    });
  });

  it('error - empty body', async () => {
    const response = await request(app)
      .post('/users')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - missing all attributes', async () => {
    const response = await request(app)
      .post('/users')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - internal server error', async () => {
    shortid.generate = jest.fn().mockReturnValue('new-user-id')();

    const postResponse = await request(app)
      .post('/users')
      .send({
        username: 'Buster'
      });

    expect(postResponse.status).toBe(500);
    expect(postResponse.body).toEqual({
      error: 'Internal Server error'
    });
  });
});
// #endregion user tests
