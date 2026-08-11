import DOMPurify from "isomorphic-dompurify";
import { Post } from "../models/index.js";
import { redisClient } from "../redis/createRedisClient.js";
import { embeddingService } from "../services/embedding.service.js";
import { markdownService } from "../services/markdown.service.js";
import { summaryService } from "../services/summary.service.js";
import { postSearchFields, postAutocompleteFields, postReccomendationFields } from "../utils/constants.js";
import {
	ApiError,
	ApiResponse,
	asyncReqHandler,
	deleteHandler,
	uploadHandler,
} from "../utils/index.js";

// TODO: Add rate limiter for post
const createPost = asyncReqHandler(async (req, res) => {
	const user = req.user;
	const { title, slug, body, isPublic } = req.body;

	if ([title, slug].some((field) => !field))
		throw new ApiError(400, "All necessary fields are required");

	const cleanBody = DOMPurify.sanitize(body);
	const strippedBody = await markdownService.convert(cleanBody);
	const embedding = await embeddingService.getEmbedding(strippedBody);

	if (!embedding.length)
		throw new ApiError(500, "Error while creating embeddings for post");

	const createdPost = await Post.create({
		title,
		slug,
		body: cleanBody,
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

	if (title) {
		post.title = title;
	}

	if (isPublic !== undefined) {
		post.isPublic = isPublic;
	}

	if (body) {
		const cleanBody = DOMPurify.sanitize(body);
		const strippedBody = await markdownService.convert(cleanBody);
		const embedding = await embeddingService.getEmbedding(strippedBody);
		post.body = cleanBody;
		post.embedding = embedding;
	}

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

	const searchTextEmbedding = await embeddingService.getEmbedding(searchText);
	if (!searchTextEmbedding)
		throw new ApiError(500, "Something went wrong : Embedding Service");

	const posts = await Post.aggregate([
		{
			$rankFusion: {
				input: {
					pipelines: {
						lexical: [
							{
								$search: {
									index: "post_search_index",
									text: {
										query: searchText,
										path: ["title", "body"],
										fuzzy: {
											maxEdits: 2,
											prefixLength: 1,
										},
									},
								},
							},
							{ $limit: 20 },
						],
						semantic: [
							{
								$vectorSearch: {
									index: "post_vector_search_index",
									path: "embedding",
									queryVector: searchTextEmbedding,
									numCandidates: 200,
									limit: 20,
								},
							},
						],
					},
				},
				combination: {
					weights: {
						lexical: 0.65,
						semantic: 0.35,
					},
				},
			},
		},

		{
			$match: {
				isPublic: true,
			},
		},

		{
			$limit: 10,
		},

		{
			$project: postSearchFields,
		},
	]);

	return res
		.status(200)
		.json(new ApiResponse("Succesfully fetched search result", { posts }, 200));
});

const getSearchSuggestions = asyncReqHandler(async (req, res) => {
	const searchText = req.query?.search;
	if (!searchText) throw new ApiError(400, "search is required");

	const suggestions = (await Post.aggregate([
		{
			$search: {
				index: "post_autocomplete_index",
				autocomplete: {
					query: searchText,
					path: "title"
				}
			}
		},
		{ $limit: 10 },
		{
			$project: postAutocompleteFields
		}
	])).map((post) => post.title);

	return res.status(200).json(new ApiResponse("Successfully fetched suggestions", { suggestions }, 200));
})

const getPostSummary = asyncReqHandler(async (req, res) => {
	const slug = req.params?.slug;
	if (!slug) throw new ApiError(400, "slug is required");

	const summaryRedisKey = `summary:${slug}`;
	const cachedSummary = await redisClient.get(summaryRedisKey);

	if (cachedSummary) {
		return res
			.status(200)
			.json(
				new ApiResponse(
					"Successfully fetched summary",
					{ summary: cachedSummary },
					200,
				),
			);
	} else {
		const post = await Post.findOne({ slug, isPublic: true });
		if (!post) throw new ApiError(404, "Post not found");

		const strippedBody = await markdownService.convert(post.body);

		const summary = await summaryService.getSummary(strippedBody);

		if (!summary)
			throw new ApiError(500, "Something went wrong : Summary Service");

		await redisClient.set(summaryRedisKey, summary, { EX: 60 * 60 * 24 });
		return res
			.status(200)
			.json(
				new ApiResponse("Sucessfully summarized the post", { summary }, 200),
			);
	}
});

const getPostRecommendations = asyncReqHandler(async (req, res) => {
	const user = req.user;
	if (!user) throw new ApiError(401, "Unauthorized request");
	const post = await Post.findOne({
		isPublic: true,
		slug: req.params?.slug,
	}).select("+embedding");
	if (!post) throw new ApiError(404, "Post not found");

	const recommendationsRedisKey = `recommendations:${post.slug}`;
	const cachedRecommendations = await redisClient.get(recommendationsRedisKey);

	if (cachedRecommendations) {
		const parsedRecommendations = JSON.parse(cachedRecommendations);
		return res
			.status(200)
			.json(
				new ApiResponse(
					"Successfully fetched recommendations",
					{ recommendations: parsedRecommendations },
					200,
				),
			);
	} else {
		const embedding = post.embedding;
		const recommendations = await Post.aggregate([
			{
				$vectorSearch: {
					index: "post_vector_search_index",
					path: "embedding",
					queryVector: embedding,
					numCandidates: 10,
					limit: 4,
					filter: {
						isPublic: true,
					},
				},
			},
			{
				$match: {
					_id: {
						$ne: post._id,
					},
				},
			},
			{
				$project: postReccomendationFields,
			},
		]);

		const stringifiedRecommendations = JSON.stringify(recommendations);
		await redisClient.set(recommendationsRedisKey, stringifiedRecommendations, {
			EX: 60 * 60 * 24,
		});

		return res
			.status(200)
			.json(
				new ApiResponse(
					"Successfully fetched all posts",
					{ recommendations },
					200,
				),
			);
	}
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
	getPostRecommendations,
	getSearchSuggestions
};
