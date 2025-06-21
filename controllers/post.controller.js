import { ApiError, ApiResponse} from "../utils/index.js";
import {Post} from "../models/index.js"

// TODO: Check
async function createPost(req,res) {
    const user = req.user
    const {title, slug, body, isPublic} = req.body;

    const otherPostWithSameSlug = await Post.findOne({slug});
    if(otherPostWithSameSlug) throw new ApiError(400, "Post exists with same slug") 

    if([title,slug].some(field => !field)) throw new ApiError(400, "All necessary fields are required")
    
    const post = await Post.create({title,slug,body,isPublic, author: user._id});
    if(!post) throw new ApiError(500, "Error while creating the post")
    
    return res
        .status(201)
        .json(new ApiResponse("Post created successfully", {post}, 201))
}

// TODO: Check
async function updatePost(req,res) {
    const postId = req.params.id
    const {title, body, isPublic} = req.body

    if([title,body, isPublic].every(field => !field)) throw new ApiError(400, "Atleast one field is required")

    const post = await Post.findById(postId);
    if(!post) throw new ApiError(404, "Post not found")
    
    post.title = title ?? post.title
    post.body = body ?? post.body
    post.isPublic = isPublic ?? post.isPublic

    // Another approach
    // const updates = JSON.parse(JSON.stringify({title,body, isPublic}))
    // post = {...post,..updates}
    
    const newPost = await post.save({validateModifiedOnly: true});
    if(!newPost) throw new ApiError(500, "Error while updating post")

    return res
        .status(200)
        .json(new ApiResponse("Succesfully updated the post", {post: newPost}, 200))
}

async function uploadCoverImage(req,res) {
    const postId = req.params.id
    // todo 
}

export {createPost,updatePost}