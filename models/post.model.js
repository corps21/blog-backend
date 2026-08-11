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
		autoSearchIndex: true,
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

postSchema.searchIndex({
	name: "post_search_index",
	definition: {
		mappings: {
			dynamic: false,
			fields: {
				title: {
					type: "string",
					analyzer: "lucene.english",
				},
				body: {
					type: "string",
					analyzer: "lucene.english",
				},
			},
		},
	},
});

postSchema.searchIndex({
	name: "post_autocomplete_index",
	definition: {
		mappings: {
			dynamic: false,
			fields: {
				title: {
					type: "autocomplete",
					tokenization: "edgeGram",
					minGrams: 2,
					maxGrams: 15,
					foldDiacritics: true,
				},
			},
		},
	},
});

const Post = model("post", postSchema);

export { Post };
