import { Post } from "../models/index.js";
import {
	postExcludedFields,
	postSearchExcludedFields,
} from "../utils/constants.js";
import {
	ApiError,
	ApiResponse,
	asyncReqHandler,
	deleteHandler,
	uploadHandler,
} from "../utils/index.js";

const createPost = asyncReqHandler(async (req, res) => {
	const user = req.user;
	const { title, slug, body, isPublic } = req.body;

	const otherPostWithSameSlug = await Post.findOne({ slug });
	if (otherPostWithSameSlug)
		throw new ApiError(400, "Post exists with same slug");

	if ([title, slug].some((field) => !field))
		throw new ApiError(400, "All necessary fields are required");

	const post = await Post.create({
		title,
		slug,
		body,
		isPublic,
		author: user._id,
	}).select(postExcludedFields);
	if (!post) throw new ApiError(500, "Error while creating the post");

	return res
		.status(201)
		.json(new ApiResponse("Post created successfully", { post }, 201));
});

const updatePost = asyncReqHandler(async (req, res) => {
	const user = req?.user;
	const slug = req.params?.slug;
	const { title, body, isPublic } = req.body;

	if ([title, body, isPublic].every((field) => !field))
		throw new ApiError(400, "Atleast one field is required");

	const post = await Post.findOne({
		$and: [{ slug }, { author: user?._id }],
	}).select(postExcludedFields);
	if (!post) throw new ApiError(404, "Post not found");

	post.title = title ?? post.title;
	post.body = body ?? post.body;
	post.isPublic = isPublic ?? post.isPublic;

	// Another approach
	// const updates = JSON.parse(JSON.stringify({title,body, isPublic}))
	// post = {...post,..updates}

	const newPost = await post.save({ validateModifiedOnly: true });
	if (!newPost) throw new ApiError(500, "Error while updating post");

	return res
		.status(200)
		.json(
			new ApiResponse("Succesfully updated the post", { post: newPost }, 200),
		);
});

const updateCoverImage = asyncReqHandler(async (req, res) => {
	const user = req?.user;

	const slug = req.params?.slug;
	if (!slug) throw new ApiError(400, "slug is required");

	const coverImage = req?.file;
	if (!coverImage) throw new ApiError(400, "Cover Image is required");

	const post = await Post.findOne({
		$and: [{ slug }, { author: user?._id }],
	});
	if (!post) throw new ApiError(404, "Post not found");

	const { path } = coverImage;
	const uploadedCoverImage = await uploadHandler(path);

	const oldCoverImageUrl = post.coverImageUrl;
	post.coverImageUrl = uploadedCoverImage.url;

	if (oldCoverImageUrl) {
		// delete previous image
		await deleteHandler(oldCoverImageUrl);
	}

	const newPost = await post.save({ validateModifiedOnly: true });
	if (!newPost) throw new ApiError(500, "Error while updating post");

	return res
		.status(200)
		.json(
			new ApiResponse(
				"Succesfully uploaded cover image url",
				{ url: uploadedCoverImage.url },
				200,
			),
		);
});

const getPublicPostBySlug = asyncReqHandler(async (req, res) => {
	const slug = req.params?.slug;
	if (!slug) throw new ApiError(400, "slug is required");
	const post = await Post.findOne({ slug }).select(postExcludedFields);
	if (!post) throw new ApiError(404, "Post not found");

	return res
		.status(200)
		.json(new ApiResponse("Succesfully fetched the post", { post }, 200));
});

// all public posts
const getAllPublicPosts = asyncReqHandler(async (_req, res) => {
	const posts = await Post.find({ isPublic: true }).select(postExcludedFields);
	return res
		.status(200)
		.json(
			new ApiResponse("Successfully fetched all public posts", { posts }, 200),
		);
});

// public posts of a specific user
const getPublicPosts = asyncReqHandler(async (req, res) => {
	const userId = req.params?.id;
	if (!userId) throw new ApiError(400, "UserId is required");
	const posts = await Post.find({
		$and: [{ isPublic: true }, { author: userId }],
	}).select(postExcludedFields);
	return res
		.status(200)
		.json(
			new ApiResponse("Succesfully fetched all public posts", { posts }, 200),
		);
});

// public and private post of loggedin user
const getAllPosts = asyncReqHandler(async (req, res) => {
	const user = req.user;
	if (!user) throw new ApiError(401, "Unauthorized request");
	const posts = await Post.find({ author: user?._id }).select(
		postExcludedFields,
	);
	return res
		.status(200)
		.json(new ApiResponse("Successfully fetched all posts", { posts }, 200));
});

// try aggregate
// only give author info, title, cover image
const searchPosts = asyncReqHandler(async (req, res) => {
	const searchText = req.query?.search;
	if (!searchText) throw new ApiError(400, "search is required");
	// const posts = await Post.find({ $text: { $search: searchText } }).select(postExcludedFields);
	const posts = await Post.aggregate()
		.search({
			text: {
				query: searchText,
				path: ["title", "body"],
			},
		})
		.project(postSearchExcludedFields);

	return res
		.status(200)
		.json(new ApiResponse("Succesfully fetched search result", { posts }, 200));
});

export {
	createPost,
	updatePost,
	updateCoverImage,
	getAllPublicPosts,
	getPublicPosts,
	getAllPosts,
	searchPosts,
	getPublicPostBySlug,
};
