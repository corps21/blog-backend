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
		embedding: {
			type: [Number],
			default: [],
			index: "knnVector",
			dimensions: 768,
			similarity: "consine",
			select: false,
		},
		body: {
			type: String,
		},
		coverImageUrl: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		isPublic: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (_, ret) => {
				delete ret.createdAt;
				delete ret.updatedAt;
				return ret;
			},
		},
	},
);

postSchema.index({ isPublic: 1, createdAt: -1 });
postSchema.index(
	{ title: "text", body: "text" },
	{ weights: { title: 10, body: 1 } },
);

const Post = model("post", postSchema);

export { Post };
