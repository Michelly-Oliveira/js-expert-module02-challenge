const { readFile } = require('fs/promises');

class BaseRepository {
	// since our database is file based, we need to pass a file to look up the data
	// the file is equivalent to a db table (model)
	constructor({ file }) {
		this.file = file;
	}

	async find(itemId) {
		const file = await readFile(this.file);
		const content = JSON.parse(file);

		// If we don't need to filter the content by id, selecting a specific object in the file content
		if (!itemId) {
			return content;
		}

		return content.find(({ id }) => id === itemId);
	}
}

module.exports = BaseRepository;
