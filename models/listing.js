const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");
const { required } = require("joi");
const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image: {
      url: String,
      filename: String,
    
    // image:{
    //     type:String,
    //     default:
    //         "https://unsplash.com/photos/a-tree-in-a-field-under-a-purple-and-blue-sky-_0eKilj7LGo",
    //     set:(v)=>
    //         v===""
    //     ?"https://unsplash.com/photos/a-tree-in-a-field-under-a-purple-and-blue-sky-_0eKilj7LGo"
    //     :v,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
      {
        type:Schema.Types.ObjectId,
        ref:"Review",
      },
    ],
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User",
    },
    geometry:  {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
  },
  

});

listingSchema.post("findOneAndDelete",async (listing)=>{
  if(listing){
    await Review.deleteMany({ _id:{$in: listing.reviews}});
  }
});

// listingSchema.post("findOneAndDelete", async function(doc) {
//     if (doc) {
//         const Review = mongoose.model('Review');
//         await Review.deleteMany({ _id: { $in: doc.reviews } });
//     }
// });

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;