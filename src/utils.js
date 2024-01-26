/**
 * Sorts an array. Default by rating and descending
 * @param ratings ratings array to be sorted
 * @param sortBy field on which sorting needs to be done
 * @param sortType ascending or descending
 */
const sortRatings = (
    ratings, 
    sortBy = "rating",
    sortType = "dsc"
) => {
    ratings?.sort(([key1, val1], [key2, val2]) => {
        
        // Sort by rating
        if(sortBy === "rating"){
            return sortType === "dsc"
                ? val2?.rating - val1?.rating
                : sortType === "asc"
                ? val1?.rating - val2?.rating
                : 0
        };

        // Sort by date
        if(sortBy === "date"){
            return sortType === "dsc"
                ? new Date(val2?.date).getMilliseconds() - new Date(val1?.date).getMilliseconds()
                : sortType === "asc"
                ? new Date(val1?.date).getMilliseconds() - new Date(val2?.date).getMilliseconds()
                : 0
        }
    });

    return ratings;
};

module.exports = {
    sortRatings
};