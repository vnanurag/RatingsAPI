'use strict';

const express = require('express');
const shortid = require('shortid');

const { validateButterfly, validateButterflyRating, validateUser } = require('./validators');
const { getButterfly, createButterfly, postButterflyRating } = require('./services/butterflyService');
const { getUser, createUser } = require('./services/userService');
const constants = require('./constants');

async function createApp(dbPath) {
  const app = express();
  app.use(express.json());

  const db = require('./database');
  await db.loadDB(dbPath);

  app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  // #region BUTTERFLIES

  /**
   * Get an existing butterfly
   * GET
   */
  app.get('/butterflies/:id', async (req, res) => {
    try {
      const butterfly = await getButterfly(req.params.id);

      res.json(butterfly);
    } catch (error) {
      return res.status(404).json({ error: error });
    }
  });

  /**
   * Create a new butterfly
   * POST
   */
  app.post('/butterflies', async (req, res) => {
    try {
      validateButterfly(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
      const newButterfly = {
        id: shortid.generate(),
        ...req.body
      };
      const butterfly = await createButterfly(newButterfly);

      res.json(butterfly);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server error' });
    }
  });

  /**
   * Add Rating to a butterfly
   * POST
   */
  app.post('/butterflies/addRating', async (req, res) => {
    try {
      validateButterflyRating(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body - Invalid rating/review' });
    }

    try {
      const butterflyRating = {
        ...req.body
        // date: new Date() // Optional date field for future use if needed
      };
      const butterfly = await postButterflyRating(butterflyRating);

      res.json(butterfly);
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  });

  // #region Optional end point to get all butterflies

  /**
  * Get all butterflies
  * GET
  */
  // app.get('/butterflies', async (req, res) => {
  //   try {
  //     const butterfliesList = await getAllButterflies();

  //     res.json(butterfliesList);
  //   } catch (error) {
  //     return res.status(404).json({ error: error });
  //   }
  // });
  // #endregion Optional end point to get all butterflies

  // #endregion BUTTERFLIES


  // #region USERS

  /**
   * Get an existing user
   * GET
   */
  app.get('/users/:id', async (req, res) => {
    try {
      const user = await getUser(req.params.id);

      res.json(user);
    } catch (error) {
      return res.status(404).json({ error: error });
    }
  });

  /**
   * Create a new user
   * POST
   */
  app.post('/users', async (req, res) => {
    try {
      validateUser(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
      const newUser = {
        id: shortid.generate(),
        ...req.body
      };

      const user = await createUser(newUser);

      res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server error' });
    }
  });

  // #region Optional end point to get rated butterflies of a user

  /** Optional end point to get rated butterflies of a user
   * This can be used if we don't need the ratings list on GET user/:id request
   * We currently get the rated list on GET user:id request
  */

  /**
  * Get a user's rated butterflies
  * GET
  */
  // app.get('/users/:id/ratings', async (req, res) => {
  //   try {
  //     const ratings = await getUserRatedButterflies(req.params.id);
  //     if (!ratings) {
  //       return res.json('No ratings yet');
  //     }

  //     res.json(ratings);
  //   } catch (error) {
  //     return res.status(404).json({ error: error });
  //   }
  // });
  // #endregion Optional end point to get rated butterflies of a user

  // #region Optional end point to get all users
  /**
   * Get all users
   * GET
   */
  // app.get('/users', async (req, res) => {
  //   try {
  //     const usersList = await getAllUsers();

  //     res.json(usersList);
  //   } catch (error) {
  //     return res.status(404).json({ error: error });
  //   }
  // });
  // #endregion Optional end point to get all users


  // #endregion USERS

  return app;
}

/* istanbul ignore if */
if (require.main === module) {
  (async () => {
    const app = await createApp(constants.DB_PATH);
    const port = process.env.PORT || 8000;

    app.listen(port, () => {
      console.log(`Butterfly API started at http://localhost:${port}`);
    });
  })();
}

module.exports = createApp;
