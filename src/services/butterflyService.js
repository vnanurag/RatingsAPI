'use strict';

const { getDB } = require('../database');
const { sortRatings } = require('../utils');
const { getUser } = require('./userService');

/**
 * Gets the information of a butterfly
 * @param id butterfly id
 */
const getButterfly = async (id) => {
  const db = getDB();
  const butterfly = await db.get('butterflies')
    .find({ id: id })
    .value();

  if (!butterfly) {
    throw new Error(`Butterfly with id ${id} does not exist`);
  }

  // Sort the ratings based on user's rating, top rated first
  if (butterfly['ratingByUsers']) {
    butterfly['ratingByUsers'] = Object.fromEntries(
      sortRatings(Object.entries(butterfly['ratingByUsers']))
    );
  }

  return butterfly;
};

/**
 * Creates a butterfly
 * @param butterfly butterfly information
 */
const createButterfly = async (butterfly) => {
  const db = getDB();
  await db.get('butterflies')
    .push(butterfly)
    .write();

  const addedButterfly = await getButterfly(butterfly.id);
  return addedButterfly;
};

/**
 * Posts rating to butterfly profile given by users
 * @param butterflyRating user's rating of the butterfly
 */
const postButterflyRating = async (butterflyRating) => {
  const db = getDB();
  const butterfly = await getButterfly(butterflyRating.id);
  if (!butterfly) {
    throw new Error(`Butterfly with id ${butterflyRating.id} does not exist`);
  }

  const user = await getUser(butterflyRating.userId);
  if (!user) {
    throw new Error(`User with id ${butterflyRating.userId} does not exist`);
  }

  const rating = {
    rating: butterflyRating.rating
  };

  // Optional for future use
  if (butterflyRating.review){
    rating['review'] = butterflyRating.review;
  }

  // Optional for future use
  //   if (butterflyRating.date){
  //     rating['date'] = butterflyRating.date;
  //   }

  // Rating is set as an object with the userId as key
  // Assuming only one rating per user. If a rating exists,
  // latest rating will overwrite the previous rating
  butterfly['ratingByUsers'] = {
    ...butterfly['ratingByUsers'],
    [butterflyRating.userId]: rating
  };

  // Add the user's rating to the user's profile
  user['ratedButterflies'] = {
    ...user['ratedButterflies'],
    [butterflyRating.id]: rating
  };

  await db.write();

  return butterfly;
};

/**
 * Gets the list of all butterflies
 */
// const getAllButterflies = async () => {
//   const db = getDB();
//   const butterfliesList = await db.get('butterflies').value();

//   if (!butterfliesList) {
//     throw new Error('No butterflies found');
//   }

//   butterfliesList.forEach((butterfly) => {
//     // Sort the ratings based on user's rating, top rated first
//     if (butterfly['ratingByUsers']) {
//       butterfly['ratingByUsers'] = Object.fromEntries(
//         sortRatings(Object.entries(butterfly['ratingByUsers']))
//       );
//     }
//   });

//   return butterfliesList;
// };

module.exports = {
  getButterfly,
  createButterfly,
  postButterflyRating
//   getAllButterflies
};
