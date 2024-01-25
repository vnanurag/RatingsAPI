'use strict';

const { getDB } = require('../database');

/**
 * Gets the list of all butterflies
 */
const getAllButterflies = async () => {
    const db = getDB();
    const butterfliesList = await db.get('butterflies').value();

    return butterfliesList;
};

/**
 * Gets the information of a butterfly
 * @param id butterfly id
 */
const getButterfly = async (id) => {
    const db = getDB();
    const butterfly = await db.get('butterflies')
        .find({ id: id })
        .value();

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

    return butterfly;
};

/**
 * Posts rating to butterfly profile given by users
 * @param rating user's rating of the butterfly
 */
const postButterflyRating = async (butterflyRating) => {
    const db = getDB();

    // Rating object on each butterfly
    const rating = {
        userId: butterflyRating?.userId,
        rating: butterflyRating?.rating,
        review: butterflyRating?.review,
        date: butterflyRating?.date
    }

    try {
        const butterfly = await getButterfly(butterflyRating?.id);
        if (!butterfly) {
            throw `Butterfly with id ${butterflyRating?.id} does not exist`;
        }

        // Add the rating to the existing array if ratings exist
        // If no ratings exist, Set the ratings array
        butterfly['ratingsByUser'] = butterfly['ratingsByUser']?.length > 0
            ? [...butterfly['ratingsByUser'], rating]
            : [rating];
    } catch (error) {
        console.error("Ratings Error", error);
        throw error;
    }

    await db.write();
};

module.exports = {
    getAllButterflies,
    getButterfly,
    createButterfly,
    postButterflyRating
};