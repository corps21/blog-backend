import { model, Schema } from "mongoose";

const postSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		body: {
			type: String,
			maxLength: 30000,
		},
		coverImageUrl: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		isPublic: {
			type: Boolean,
			default: true,
			select: false,
		},
		createdAt: { type: Date, select: false },
		updatedAt: { type: Date, select: false },
	},
	{ timestamps: true },
);

postSchema.index({ title: "text" });
const Post = model("post", postSchema);

export { Post };
