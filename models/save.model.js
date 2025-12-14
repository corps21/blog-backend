import { model, Schema } from "mongoose";

const saveSchema = new Schema(
	{
		postId: {
			type: Schema.Types.ObjectId,
			ref: "posts",
			required: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		notebookId: {
			type: Schema.Types.ObjectId,
			ref: "notebooks",
			required: true,
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

saveSchema.index({ postId: 1, userId: 1, notebookId: 1 }, { unique: true });

export const Save = model("saves", saveSchema);
