import { model, Schema } from "mongoose";
import { hash, compare } from 'bcrypt'
import { promisify, tryCatchWrapper } from "../utils/index.js";
import jwt from "jsonwebtoken"

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
    }
})

userSchema.pre("save", tryCatchWrapper(async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await hash(this.password,Number(process.env.SALT_ROUNDS))
    console.log(this.password)
    return next()
}))

userSchema.methods.comparePassword = tryCatchWrapper(async function (password) {
    return await compare(password, this.password)
})

const generateJWT = promisify(jwt.sign)

userSchema.methods.generateAccessToken = tryCatchWrapper(async function () {
    return await generateJWT({
        userName: this.userName,
        email: this.email,
        id: this._id
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
})

userSchema.methods.generateRefreshToken = tryCatchWrapper(async function () {
    return await generateJWT({
        id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
})

export const User = model("user", userSchema)