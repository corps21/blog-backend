import { ApiError, ApiResponse } from "../utils/index.js";
import { User } from "../models/index.js";

async function generateAccessAndRefreshToken(userId) {
    // NOTE: The caller must validate *userId* before caliing this function
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    if(! accessToken || !refreshToken) throw new ApiError(500, "Error while creating tokens") 

    user.refreshToken = refreshToken;

    user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
}

async function registerUser(req, res) {
    
    const { fullName, email, userName, avatarUrl, password } = req.body

    const existingUser = await User.findOne({ $or: [{ userName }, { email }] })

    if (existingUser) throw new ApiError(400, "Email or Username already exists")

    if ([fullName, email, userName, password].some(field => !field)) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.create({ fullName, email, userName, avatarUrl, password })
    if (!user) throw new ApiError(500, "Error while creating user")

    const createdUser = await User.findById(user._id)
    return res.status(201).json(new ApiResponse("Successfully created", createdUser, 201))
}

async function loginUser(req, res) {
    const { email, userName, password } = req.body

    if (![email, userName].some(field => field)) {
        throw new ApiError(400, "Email or Username is required")
    }
    
    if (!password) throw new ApiError(400, "All fields are required")
    
    const user = await User.findOne({ $or: [{ email }, { userName }] })
    if (!user) throw new ApiError(404, "User not found")
    
    const isPasswordCorrect = await user.comparePassword(password)
    console.log(await user.comparePassword(password))
    if (!isPasswordCorrect) throw new ApiError(400, "Password is incorrect")
    
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken,options)
    .json(new ApiResponse("Successfully logged in", {}, 200))
    
}
export { registerUser, loginUser }