import mongoose, {Schema,Document, Mongoose, Types} from "mongoose";

export interface IToken extends Document {
    token: string,
    user: Types.ObjectId,
    createdAt: Date
}

const tokenSchema : Schema = new Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: String,
        ref: 'User'
    },
    expiresAt: {
        type: Date,
        default: Date.now(),
        expires: "10m"
        // expires: "1d"
    }
})

const Token = mongoose.model<IToken>('Token', tokenSchema)
 export default Token