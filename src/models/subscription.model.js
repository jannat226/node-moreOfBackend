import { Schema } from "mongoose"
import mongoose from mongoose

const subscriptionSchema = new Schema({
    subscriber:{
        //the one who is subscribing
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        // The one who is subscribed
         type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
export const Subscription = mongoose.model("Subscription",subscriptionSchema)