import { ApiError, ApiResponse, cloudinaryImageUpload } from "../utils/index.js";
import { Post } from "../models/index.js"
import { unlink } from "node:fs/promises"

// TODO: Check 
async function createPost(req, res) {
    const user = req.user
    const { title, slug, body, isPublic } = req.body;
    const coverImage = req?.file
    let coverImageUrl;

    const otherPostWithSameSlug = await Post.findOne({ slug });
    if (otherPostWithSameSlug) throw new ApiError(400, "Post exists with same slug")

    if ([title, slug].some(field => !field)) throw new ApiError(400, "All necessary fields are required")

    if (coverImage) {
        const { path } = coverImage
        const uploadedImage = await cloudinaryImageUpload(path);
        if (!uploadedImage) throw new ApiError(500, "Error while uploading cover image")
        coverImageUrl = uploadCoverImage.url
        const isFileDeleted = await unlink(path);
        if (isFileDeleted) throw new ApiError(500, "Error while unlinking cover image")
    }

    const post = await Post.create({ title, slug, body, isPublic, author: user._id, coverImageUrl });
    if (!post) throw new ApiError(500, "Error while creating the post")

    return res
        .status(201)
        .json(new ApiResponse("Post created successfully", { post }, 201))
}
// TODO: Check
async function updatePost(req, res) {
    const user = req?.user
    const postId = req.params.id
    const { title, body, isPublic } = req.body

    if ([title, body, isPublic].every(field => !field)) throw new ApiError(400, "Atleast one field is required")

    const post = await Post.find({$and: [{_id: postId}, {author: user?._id}]});
    if (!post) throw new ApiError(404, "Post not found")

    post.title = title ?? post.title
    post.body = body ?? post.body
    post.isPublic = isPublic ?? post.isPublic

    // Another approach
    // const updates = JSON.parse(JSON.stringify({title,body, isPublic}))
    // post = {...post,..updates}

    const newPost = await post.save({ validateModifiedOnly: true });
    if (!newPost) throw new ApiError(500, "Error while updating post")

    return res
        .status(200)
        .json(new ApiResponse("Succesfully updated the post", { post: newPost }, 200))
}
// TODO: Check
async function updateCoverImage(req, res) {
    const user = req?.user
    
    const postId = req.params?.id
    if(!postId) throw new ApiError(400, "Post id is required")
    
    const coverImage = req?.file
    if (!coverImage) throw new ApiError(400, "Cover Image is required")

    const post = await Post.findOne({$and: [{_id: postId}, {author: user?._id}]})
    if(!post) throw new ApiError(404, "Post not found")
    
    
    const { path } = coverImage
    const uploadedCoverImage = await cloudinaryImageUpload(path)
    if (!uploadedCoverImage) throw new ApiError(500, "Error while uploading cover image")

    const isFileDeleted = await unlink(path);
    if (isFileDeleted) throw new ApiError(500, "error while deleting cover image")
    
    const oldCoverImageUrl = post.coverImageUrl
    post.coverImageUrl = uploadedCoverImage.url

    if (oldCoverImageUrl) {
        // delete previous image
        const publicId = oldCoverImageUrl.split("/").at(-1).split(".")[0]
        const isCloudinaryDelete = await cloudinaryImageRemove([publicId]);
        if (!isCloudinaryDelete) throw new ApiError(500, "Error while deleting previous cover image")
    }

    return res
        .status(200)
        .json(new ApiResponse("Succesfully uploaded avatar url", { url: uploadedCoverImage.url }, 200))
}


export { createPost, updatePost, updateCoverImage}