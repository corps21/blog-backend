import { model, Schema } from "mongoose";
import { hash, compare } from 'bcrypt'
import { tryCatchWrapper, promisedJWTSign } from "../utils/index.js";

const userSchema = new Schema({
    fullName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        index: true
    },
    userName: {
        type: String,
        trim: true,
        required: true,
        index: true
    },
    avatarUrl: String,
    password: {
        type: String,
        required: true,
    },
    refreshToken: String
})

userSchema.pre("save", tryCatchWrapper(async function () {
    if (!this.isModified("password")) return;
    this.password = await hash(this.password,Number(process.env.SALT_ROUNDS))
}))

userSchema.methods.comparePassword = tryCatchWrapper(async function (password) {
    return await compare(password, this.password)
})

userSchema.methods.generateAccessToken = tryCatchWrapper(async function () {
    return await promisedJWTSign({
        userName: this.userName,
        email: this.email,
        _id: this._id
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
})

userSchema.methods.generateRefreshToken = tryCatchWrapper(async function () {
    return await promisedJWTSign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
})

export const User = model("user", userSchema)