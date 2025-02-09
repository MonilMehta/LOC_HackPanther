import mongoose, { Schema } from "mongoose"; 

const attendanceSchema = new mongoose.Schema({
    officer: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    status:{
        type:String,
        enum: ["present","absent"],
        required: [true, "Type of status is required"]
    },
    date:{
        type:String
    },
    in_time:{
        type:String,
        required: [true, "Time is required"],
        trim: true
    },
    out_time:{
        type:String,
        required: [true, "Time is required"],
        trim: true
    }
})

export const Attendance = mongoose.model('Attendance',attendanceSchema);

