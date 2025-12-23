import { compare, hash } from "bcrypt";
import { model, Schema } from "mongoose";
import { promisedJWTSign, tryCatchWrapper } from "../utils/index.js";

const baseUserSchema = new Schema(
	{
		kind: {
			type: String,
			required: true,
			enum: ["AnonUser", "User"],
		},
		refreshToken: {
			type: String,
			select: false,
		},
	},
	{
		timestamps: true,
		discriminatorKey: "kind",
		toJSON: {
			transform: (_, ret) => {
				delete ret.createdAt;
				delete ret.updatedAt;
				return ret;
			},
		},
	},
);

baseUserSchema.pre(
	"save",
	tryCatchWrapper(async function () {
		if (!this.isModified("password")) return;
		this.password = await hash(this.password, Number(process.env.SALT_ROUNDS));
	}),
);

baseUserSchema.methods.comparePassword = tryCatchWrapper(
	async function (password) {
		if (this.kind === "User") return await compare(password, this.password);
	},
);

baseUserSchema.methods.generateAccessToken = tryCatchWrapper(async function () {
	let details = {};
	if (this.kind === "User") {
		details = {
			kind: this.kind,
			userName: this.userName,
			email: this.email,
			_id: this._id,
		};
	} else {
		details = {
			kind: this.kind,
			_id: this._id,
		};
	}
	return await promisedJWTSign(details, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
	});
});

baseUserSchema.methods.generateRefreshToken = tryCatchWrapper(
	async function () {
		const TOKEN_EXPIRY =
			this.kind === "User"
				? process.env.REFRESH_TOKEN_EXPIRY
				: process.env.MAX_REFRESH_TOKEN_EXPIRY;
		return await promisedJWTSign(
			{
				_id: this._id,
				kind: this.kind,
			},
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: TOKEN_EXPIRY },
		);
	},
);

baseUserSchema.index(
	{ email: 1, userName: 1 },
	{
		partialFilterExpression: {
			email: {
				$exists: true,
			},
			userName: {
				$exists: true,
			},
		},
	},
);

const BaseUser = model("user", baseUserSchema);

export const AnonUser = BaseUser.discriminator("AnonUser", new Schema());
export const User = BaseUser.discriminator(
	"User",
	new Schema({
		fullName: {
			type: String,
			trim: true,
			required: true,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			index: true,
			unique: true,
		},
		userName: {
			type: String,
			trim: true,
			required: true,
			index: true,
			unique: true,
		},
		avatarUrl: String,
		password: {
			type: String,
			required: true,
			select: false,
		},
	}),
);
