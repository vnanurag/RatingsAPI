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
    const butterfly = await getButterfly(req.params.id);

    if (!butterfly) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(butterfly);
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

    const newButterfly = {
      id: shortid.generate(),
      ...req.body
    };

    const butterfly = await createButterfly(newButterfly);

    res.json(butterfly);
  });

  /**
   * Add Rating to a butterfly
   * POST
   */
  app.post('/butterflies/addRating', async (req, res) => {
    try {
      validateButterflyRating(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const butterflyRating = {
      ...req.body,
      date: new Date()
    };

    try {
      await postButterflyRating(butterflyRating);
    } catch (error) {
      return res.status(500).json({ error: error });
    }

    res.status(200).json('Rating added succesfully');
  });

  /**
  * Get all butterflies
  * GET
  */
  app.get('/butterflies', async (req, res) => {
    const butterfliesList = await getAllButterflies();

    if (!butterfliesList) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(butterfliesList);
  });


  /* ----- USERS ----- */

  /**
   * Get an existing user
   * GET
   */
  app.get('/users/:id', async (req, res) => {
    // const user = await db.get('users')
    //   .find({ id: req.params.id })
    //   .value();

    const user = await getUser(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(user);
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

    const newUser = {
      id: shortid.generate(),
      ...req.body
    };

    // await db.get('users')
    //   .push(newUser)
    //   .write();

    const user = await createUser(newUser);

    res.json(user);
  });

  /**
   * Get all users
   * GET
   */
  app.get('/users', async (req, res) => {
    const usersList = await getAllUsers();

    if (!usersList) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(usersList);
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
