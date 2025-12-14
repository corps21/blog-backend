import {Schema} from 'mongoose'
import {User, Post, Notebook} from './index'

const saveSchema = new Schema({
    postId : {
        type: Schema.Types.ObjectId,
        ref: Post,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    notebookId: {
        type: Schema.Types.ObjectId,
        ref: Notebook,
        required:true
    }
}, {timestamps: true, toJSON: {
    transform: (_,ret) => {
        delete ret.createdAt
        delete ret.updatedAt
        return ret
    }
}})

saveSchema.index({postId: 1, userId: 1, notebookId: 1}, {unique: true})