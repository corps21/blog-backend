import { unlink } from "node:fs/promises";
import { Post } from "../models/index.js";
import {
	ApiError,
	ApiResponse,
	cloudinaryImageRemove,
	cloudinaryImageUpload,
} from "../utils/index.js";

async function createPost(req, res) {
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
	});
	if (!post) throw new ApiError(500, "Error while creating the post");

	return res
		.status(201)
		.json(new ApiResponse("Post created successfully", { post }, 201));
}

async function updatePost(req, res) {
	const user = req?.user;
	const postId = req.params.id;
	const { title, body, isPublic } = req.body;

	if ([title, body, isPublic].every((field) => !field))
		throw new ApiError(400, "Atleast one field is required");

	const post = await Post.findOne({
		$and: [{ _id: postId }, { author: user?._id }],
	});
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
}

async function updateCoverImage(req, res) {
	const user = req?.user;

	const postId = req.params?.id;
	if (!postId) throw new ApiError(400, "Post id is required");

	const coverImage = req?.file;
	if (!coverImage) throw new ApiError(400, "Cover Image is required");

	const post = await Post.findOne({
		$and: [{ _id: postId }, { author: user?._id }],
	});
	if (!post) throw new ApiError(404, "Post not found");

	const { path } = coverImage;
	const uploadedCoverImage = await cloudinaryImageUpload(path);
	if (!uploadedCoverImage)
		throw new ApiError(500, "Error while uploading cover image");

	const isFileDeleted = await unlink(path);
	if (isFileDeleted)
		throw new ApiError(500, "error while deleting cover image");

	const oldCoverImageUrl = post.coverImageUrl;
	post.coverImageUrl = uploadedCoverImage.url;

	if (oldCoverImageUrl) {
		// delete previous image
		const publicId = oldCoverImageUrl.split("/").at(-1).split(".")[0];
		const isCloudinaryDelete = await cloudinaryImageRemove([publicId]);
		if (!isCloudinaryDelete)
			throw new ApiError(500, "Error while deleting previous cover image");
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
}

async function getAllPublicPosts(_req, res) {
	const posts = await Post.find({ isPublic: true });
	return res
		.status(200)
		.json(
			new ApiResponse("Successfully fetched all public posts", { posts }, 200),
		);
}

async function getPublicPosts(req, res) {
	const userId = req.params?.id;
	if (!userId) throw new ApiError(400, "UserId is required");
	const posts = await Post.find({
		$and: [{ isPublic: true }, { author: userId }],
	});
	return res
		.status(200)
		.json(
			new ApiResponse("Succesfully fetched all public posts", { posts }, 200),
		);
}

async function getAllPosts(req, res) {
	const user = req.user;
	if (!user) throw new ApiError(401, "Unauthorized request");
	const posts = await Post.find({ author: user?._id });
	return res
		.status(200)
		.json(new ApiResponse("Successfully fetched all posts", { posts }, 200));
}

// TODO: return all public posts for a search text
// try aggregate
// only give author info, title, cover image

async function searchPosts(req, res) {
	const searchText = req.query?.search;
	if (!searchText) throw new ApiError(400, "search is required");
	const posts = await Post.find({ $text: { $search: searchText } });
	return res
		.status(200)
		.json(new ApiResponse("Succesfully fetched search result", { posts }, 200));
}

export {
	createPost,
	updatePost,
	updateCoverImage,
	getAllPublicPosts,
	getPublicPosts,
	getAllPosts,
	searchPosts,
};
