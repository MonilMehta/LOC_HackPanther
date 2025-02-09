import mongoose, { Schema } from "mongoose";

const alertSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String
    },
    date:{
        type: String
    }
})

const Alert = mongoose.model('Alert',alertSchema);

export default Alert