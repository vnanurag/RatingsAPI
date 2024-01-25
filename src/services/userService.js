'use strict';

const { getDB } = require('../database');

/**
 * Gets the list of all users
 */
const getAllUsers = async () => {
    const db = getDB();
    const usersList = await db.get('users').value();

    return usersList;
};

/**
 * Gets the information of a user
 * @param id user id
 */
const getUser = async (id) => {
    const db = getDB();
    const user = await db.get('users')
        .find({ id: id })
        .value();

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

    return user;
};

/**
 * Adds the user's rating to the user's profile
 * @param rating user's rating of the butterfly
 */
const postUserRating = async () => {
};

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    postUserRating
};