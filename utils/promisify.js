export function promisify(fn) {
	return async (...args) => {
		return new Promise((resolve, reject) => {
			fn(...args, (err, data) => {
				if (err) return reject(err);
				return resolve(data);
			});
		});
	};
}
