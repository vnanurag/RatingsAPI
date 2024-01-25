'use strict';

const { getDB } = require('../database');

/**
 * Gets the information of a user
 * @param id user id
 */
const getUser = async (id) => {
    try {
        const db = getDB();
        const user = await db.get('users')
            .find({ id: id })
            .value();

        if (!user) {
            throw `User with id ${id} does not exist`;
        }

        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Creates a user
 * @param user user information
 */
const createUser = async (user) => {
    try {
        const db = getDB();
        await db.get('users')
            .push(user)
            .write();

        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Gets the list of all users
 */
const getAllUsers = async () => {
    try {
        const db = getDB();
        const usersList = await db.get('users').value();
        if (!usersList) {
            throw 'No users found';
        }

        return usersList;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllUsers,
    getUser,
    createUser
};