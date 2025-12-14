import { model, Schema } from "mongoose";

const noteBookSchema = new Schema({
    title: {
        type: String,
        required: true,
        default: "Untitled",
    },
    description: String,
    embeddings: [Integer],
    authorId: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

noteBookSchema.index({title: 1, authorId: 1}, {
    unique: true
})

export const Notebook = model("notebook", noteBookSchema)