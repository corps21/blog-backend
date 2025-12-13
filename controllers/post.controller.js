import { Post } from "../models/index.js";
import { embeddingService } from "../services/embedding.service.js";
import { summaryService } from "../services/summary.service.js";
import { postSearchExcludedFields } from "../utils/constants.js";
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

	if ([title, slug].some((field) => !field))
		throw new ApiError(400, "All necessary fields are required");

	const embedding = await embeddingService.getEmbedding(body);
	if (!embedding.length)
		throw new ApiError("500", "Error while creating embeddings for post");

	const createdPost = await Post.create({
		title,
		slug,
		body,
		isPublic,
		embedding,
		author: user._id,
	});
	if (!createdPost) throw new ApiError(500, "Error while creating the post");

	const post = await Post.findById(createdPost._id);
	if (!post) throw new ApiError(404, "Post not found");

	return res
		.status(201)
		.json(new ApiResponse("Post created successfully", { post }, 201));
});

const updatePost = asyncReqHandler(async (req, res) => {
	const user = req?.user;
	const slug = req.params?.slug;
	const { title, body, isPublic } = req.body;

	if (
		[title, body, isPublic].every(
			(field) => field === undefined || field === null,
		)
	)
		throw new ApiError(400, "Atleast one field is required");

	const post = await Post.findOne({
		$and: [{ slug }, { author: user?._id }],
	});
	if (!post) throw new ApiError(404, "Post not found");

	post.title = title ?? post.title;
	post.body = body ?? post.body;
	post.isPublic = isPublic ?? post.isPublic;
	post.embedding = body
		? await embeddingService.getEmbedding(body)
		: post.embedding;

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

const deletePost = asyncReqHandler(async (req, res) => {
	const user = req?.user;

	const slug = req.params?.slug;
	if (!slug) throw new ApiError(400, "slug is required");

	const isDeleted = await Post.findOneAndDelete({
		$and: [{ slug }, { author: user?._id }],
	});
	if (!isDeleted) throw new ApiError(404, "Post not found");

	return res
		.status(200)
		.json(new ApiResponse("Succesfully deleted the post", {}, 200));
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
	const post = await Post.findOne({ slug });
	if (!post) throw new ApiError(404, "Post not found");

	return res
		.status(200)
		.json(new ApiResponse("Succesfully fetched the post", { post }, 200));
});

// all public posts
const getAllPublicPosts = asyncReqHandler(async (_req, res) => {
	const posts = await Post.find({ isPublic: true });
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
	});
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
	const posts = await Post.find({ author: user?._id });
	return res
		.status(200)
		.json(new ApiResponse("Successfully fetched all posts", { posts }, 200));
});

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
		.match({ isPublic: true })
		.project(postSearchExcludedFields);

	return res
		.status(200)
		.json(new ApiResponse("Succesfully fetched search result", { posts }, 200));
});

const getPostSummary = asyncReqHandler(async (req, res) => {
	const slug = req.params?.slug;
	if (!slug) throw new ApiError("400", "slug is required");

	const post = await Post.findOne({ slug });
	if (!post) throw new ApiError("404", "Post not found");

	if (!post.isPublic) throw new ApiError("403", "Unauthorized Access");

	const summary = await summaryService.getSummary(post.body);
	if (!summary)
		throw new ApiError("500", "Something went wrong : Summary Service");

	return res
		.status(200)
		.json(new ApiResponse("Sucessfully summarized the post", { summary }, 200));
});

const suggestPostsSemantic = asyncReqHandler(async () => {
	const searchText = req.query?.search;
	if (!searchText) throw new ApiError(400, "search is required");
	const textEmbedding = await embeddingService.getEmbedding(searchPosts);
	if (!textEmbedding)
		throw new ApiError("500", "Something went wrong : Summary Service");

	return res
		.status(200)
		.json(
			new ApiResponse(
				"Sucessfully summarized the post",
				{ textEmbedding },
				200,
			),
		);
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
	getPostSummary,
	deletePost,
	suggestPostsSemantic,
};
