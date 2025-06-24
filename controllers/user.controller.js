import { ApiError, ApiResponse, promisedJWTVerify } from "../utils/index.js";
import { User } from "../models/index.js";
import {
	cloudinaryImageUpload,
	cloudinaryImageRemove,
} from "../utils/index.js";
import { unlink } from "node:fs/promises";

/**
 * @param {Object} res
 * @param {String[]} cookieArray
 * @param {Object} options
 * I found that there are some repeating code for clearing cookies, so created custom function for it
 */

function clearCookies(
	res,
	cookieArray,
	options = {
		httpOnly: true,
		secure: true,
	},
) {
	cookieArray.forEach((cookie) => {
		res.clearCookie(cookie, options);
	});
}

async function generateAccessAndRefreshToken(userId) {
	// NOTE: The caller must validate *userId* before caliing this function
	const user = await User.findById(userId);
	const accessToken = await user.generateAccessToken();
	const refreshToken = await user.generateRefreshToken();

	if (!accessToken || !refreshToken)
		throw new ApiError(500, "Error while creating tokens");

	user.refreshToken = refreshToken;

	await user.save({ validateBeforeSave: false });

	return { accessToken, refreshToken };
}

async function registerUser(req, res) {
	const { fullName, email, userName, password } = req.body;

	const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
	if (existingUser) throw new ApiError(409, "Email or Username already exists");

	if ([fullName, email, userName, password].some((field) => !field)) {
		throw new ApiError(400, "All fields are required");
	}

	const user = await User.create({
		fullName,
		email,
		userName,
		password,
	});

	if (!user) throw new ApiError(500, "Error while creating user");

	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken",
	);
	return res
		.status(201)
		.json(new ApiResponse("Successfully created", createdUser, 201));
}

async function loginUser(req, res) {
	const { email, userName, password } = req.body;

	if (![email, userName].some((field) => field)) {
		throw new ApiError(400, "Email or Username is required");
	}

	if (!password) throw new ApiError(400, "All fields are required");

	const user = await User.findOne({ $or: [{ email }, { userName }] });
	if (!user) throw new ApiError(404, "User not found");

	const isPasswordCorrect = await user.comparePassword(password);

	if (!isPasswordCorrect) throw new ApiError(400, "Password is incorrect");

	const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
		user._id,
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(new ApiResponse("Successfully logged in", {}, 200));
}

async function logoutUser(req, res) {
	const user = req.user;

	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ $unset: { refreshToken: "" } },
		{ new: true },
	);
	if (!updatedUser) throw new ApiError(500, "Error while updating user");

	clearCookies(res, ["accessToken", "refreshToken"]);

	return res
		.status(200)
		.json(new ApiResponse("Logged out successfully", {}, 200));
}

async function refreshAccessToken(req, res) {
	const incomingRefreshToken =
		req.cookies.refreshToken || req.header.Authorization.replace("Bearer ");
	if (!incomingRefreshToken) throw new ApiError(401, "Need refresh token");

	const decodedUser = await promisedJWTVerify(
		incomingRefreshToken,
		process.env.REFRESH_TOKEN_SECRET,
	);
	if (!decodedUser) throw new ApiError(401, "Invalid token");

	// Check against action after deletion of user
	const user = await User.findById(decodedUser._id);
	if (!user) throw new ApiError(404, "User not found");

	const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
		await generateAccessAndRefreshToken(user._id);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.cookie("accessToken", newAccessToken, options)
		.cookie("refreshToken", newRefreshToken, options)
		.json(new ApiResponse("Rotated tokens succesfully", {}, 200));
}

async function getCurrentUser(req, res) {
	const user = req.user;
	return res
		.status(200)
		.json(new ApiResponse("Successfully fetched current user", { user }, 200));
}

async function changeUserPassword(req, res) {
	const { oldPassword, newPassword } = req.body;
	const user = await User.findById(req.user._id);

	if (!oldPassword || !newPassword)
		throw new ApiError(400, "All fields are required");

	const isPasswordCorrect = await user.comparePassword(oldPassword);
	if (!isPasswordCorrect) throw new ApiError(401, "Invalid password");

	user.password = newPassword;
	user.refreshToken = null;

	const isUserUpdated = await user.save({ validateModifiedOnly: true });
	if (!isUserUpdated)
		throw new ApiError(500, "Something went wrong while updating user");

	clearCookies(res, ["accessToken", "refreshToken"]);

	return res
		.status(200)
		.json(new ApiResponse("Successfully changed the user's password", {}, 200));
}

async function updateUserDetails(req, res) {
	const { email, avatarUrl, fullName } = req.body;
	const user = req.user;
	if ([email, avatarUrl, fullName].every((field) => !field))
		throw new ApiError(400, "Atleast 1 field is required");

	user.email = email ?? user.email;
	user.avatarUrl = avatarUrl ?? user.avatarUrl;
	user.fullName = fullName ?? user.fullName;

	// Another method
	// const updates = JSON.parse(JSON.stringify({email,avatarUrl,fullName}))
	// JSON removes all undefined values
	// user = {...user, ...updates}

	const newUser = await user.save(
		{ validateModifiedOnly: true },
		{ new: true },
	);
	if (!newUser)
		throw new ApiError(500, "Something went wrong while updating user details");
	return res
		.status(200)
		.json(new ApiResponse("Successfully updated user details", newUser, 200));
}

async function updateAvatar(req, res) {
	const user = req?.user;
	const avatar = req?.file;

	if (!avatar) throw new ApiError(400, "Avatar is required");
	const { path } = avatar;

	const uploadedAvatar = await cloudinaryImageUpload(path);
	if (!uploadedAvatar) throw new ApiError(500, "Error while uploading avatar");

	const isFileDeleted = await unlink(path);
	if (isFileDeleted) throw new ApiError(500, "error while deleting avatar");

	const oldAvatarUrl = user.avatarUrl;
	user.avatarUrl = uploadedAvatar.url;

	if (oldAvatarUrl) {
		// delete previous image
		const publicId = oldAvatarUrl.split("/").at(-1).split(".")[0];

		const isCloudinaryDelete = await cloudinaryImageRemove([publicId]);
		if (!isCloudinaryDelete)
			throw new ApiError(500, "Error while deleting previous avatar");
	}

	const newUser = await user.save({ validateModifiedOnly: true });
	if (!newUser) throw new ApiError("500", "Error while updating user");

	return res
		.status(200)
		.json(
			new ApiResponse(
				"Succesfully uploaded avatar url",
				{ url: newUser.avatarUrl },
				200,
			),
		);
}

export {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	getCurrentUser,
	changeUserPassword,
	updateUserDetails,
	updateAvatar,
};
