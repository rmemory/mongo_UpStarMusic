const Artist = require('../models/artist');

/**
 * Searches through the Artist collection
 * @param {object} criteria An object with a name, age, and yearsActive
 * @param {string} sortProperty The property to sort the results by
 * @param {integer} offset How many records to skip in the result set
 * @param {integer} limit How many records to return in the result set
 * @return {promise} A promise that resolves with the artists, count, offset, and limit
 */
module.exports = (criteria, sortProperty, offset = 0, limit = 20) => {
	/*
	 * age: {gte: 14, lte: 25}
	 *
	 */
	const theQuery = buildQuery(criteria);
	console.log(theQuery);

	const query = Artist.find(theQuery)
		.sort({ [sortProperty]: 1 })
		.skip(offset)
		.limit(limit);

	// One promise to perform the search, another to get the count of the search
	return Promise.all([query, Artist.find(theQuery).count()])
		.then((results) => {
			return {
				all: results[0],
				count: results[1],
				offset,
				limit
			};
		});
};

const buildQuery = (criteria) => {
	const query = {};

	if (criteria.name) {
		/*
		 * Note that with this alone, we haven't informed MongoDB that 
		 * $text cooresponds to the "name" field. Only a single field
		 * such as "name" can be indexed.
		 * 
		 * To add an index, at the command line, open a mongo shell
		 * 
		 * $ mongo
		 * > show dbs
		 * > use upstar_music
		 * > db.artists.createIndex({name: "text"})
		 * > quit()
		 */
		query.$text = { $search: criteria.name };
	}

	if (criteria.age) {
		query.age = {
			$gte: criteria.age.min,
			$lte: criteria.age.max
		};
	}

	if (criteria.yearsActive) {
		query.yearsActive = {
			$gte: criteria.yearsActive.min,
			$lte: criteria.yearsActive.max
		};
	}

	return query;
};
