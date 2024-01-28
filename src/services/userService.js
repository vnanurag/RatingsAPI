'use strict';

const { getDB } = require('../database');
const { sortRatings } = require('../utils');

/**
 * Gets the information of a user
 * @param id user id
 */
const getUser = async (id) => {
  const db = getDB();
  const user = await db.get('users')
    .find({ id: id })
    .value();

  if (!user) {
    throw new Error(`User with id ${id} does not exist`);
  }

  // Sort the ratings based on user's rating, top rated first
  if (user['ratedButterflies']) {
    user['ratedButterflies'] = Object.fromEntries(
      sortRatings(Object.entries(user['ratedButterflies']))
    );
  }

  return user;
};

/**
 * Creates a user
 * @param user user information
 */
const createUser = async (user) => {
  const db = getDB();
  await db.get('users')
    .push(user)
    .write();

  const addedUser = await getUser(user.id);
  return addedUser;
};

/**
 * Gets the rated butterflies list of a user
 * @param id user id
 */
// const getUserRatedButterflies = async (id) => {
//   const user = await getUser(id);
//   if (!user) {
//     throw new Error(`User with id ${id} does not exist`);
//   }

//   if (!user['ratedButterflies']) {
//     return null;
//   }

//   return user['ratedButterflies'];
// };

/**
 * Gets the list of all users
 */
// const getAllUsers = async () => {
//   const db = getDB();
//   const usersList = await db.get('users').value();
//   if (!usersList) {
//     throw new Error('No users found');
//   }

//   usersList.forEach((user) => {
//     // Sort the ratings based on user's rating, top rated first
//     if (user['ratedButterflies']) {
//       user['ratedButterflies'] = Object.fromEntries(
//         sortRatings(Object.entries(user['ratedButterflies']))
//       );
//     }
//   });

//   return usersList;
// };

module.exports = {
  getUser,
  createUser
//   getUserRatedButterflies
//   getAllUsers
};
