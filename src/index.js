'use strict';

const express = require('express');
const shortid = require('shortid');

const { validateButterfly, validateButterflyRating, validateUser } = require('./validators');
const { getButterfly, createButterfly, getAllButterflies, postButterflyRating } = require('./services/butterflyService');
const { getUser, createUser, getAllUsers } = require('./services/userService');

async function createApp() {
  const app = express();
  app.use(express.json());

  const db = require('./database');
  await db.loadDB();

  app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  /* ----- BUTTERFLIES ----- */

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
      return res.status(500).json({ error: error });
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
        ...req.body,
        date: new Date()
      };
      const butterfly = await postButterflyRating(butterflyRating);

      res.json(butterfly);
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  });

  /* -- Optional end point to get all butterflies -- */
  /**
  * Get all butterflies
  * GET
  */
  app.get('/butterflies', async (req, res) => {
    try {
      const butterfliesList = await getAllButterflies();

      res.json(butterfliesList);
    } catch (error) {
      return res.status(404).json({ error: error });
    }
  });


  /* ----- USERS ----- */

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
      return res.status(500).json({ error: error });
    }
  });

  /* -- Optional end point to get all users -- */
  /**
   * Get all users
   * GET
   */
  app.get('/users', async (req, res) => {
    try {
      const usersList = await getAllUsers();
  
      res.json(usersList);
    } catch (error) {
      return res.status(404).json({ error: error });
    }
  });

  return app;
}

/* istanbul ignore if */
if (require.main === module) {
  (async () => {
    const app = await createApp();
    const port = process.env.PORT || 8000;

    app.listen(port, () => {
      console.log(`Butterfly API started at http://localhost:${port}`);
    });
  })();
}

module.exports = createApp;
