export const postRecommendationFields = {
	_id: 1,
	title: 1,
	slug: 1,
	coverImageUrl: 1,
	author: {
		_id: 1,
		fullName: 1,
		avatarUrl: 1,
		userName: 1,
	},
	isPublic: 1,
	createdAt: 1,
	updatedAt: 1,
};

export const postSearchFields = {
	_id: 1,
	title: 1,
	slug: 1,
	body: 1,
	author: 1,
	isPublic: 1,
	coverImageUrl: 1,
	createdAt: 1,
	updatedAt: 1,
};

export const postAutocompleteFields = {
	_id: 0,
	title: 1,
};
