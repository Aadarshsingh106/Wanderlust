const mongoose=require("mongoose");
//const { create } = require("./listing");  this line is changed by gpt code
const Schema=mongoose.Schema;

const reviewSchema=new Schema({
    comment:String,
    rating:{
        type:Number,
        required:true, //this line is added
        min:1,
        max:5,
    },
    createAt:{
        type:Date,
        default:Date.now(),
    },
    author:{
        type: Schema.Types.ObjectId,
        ref:"User",
    },
});

module.exports=mongoose.model("Review",reviewSchema);
