const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require("multer");
const {storage}= require("../cloudConfig.js");
const upload = multer({storage});


router.route("/")
.get( wrapAsync(listingController.index))
.post(
    isLoggedIn ,
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.createListing)
); 

//search route

router.get("/search", wrapAsync(async (req, res) => {
    const query = req.query.q;
    if (!query) {
        req.flash("error", "Please enter something to search!");
        return res.redirect("/listings");
    }

    const allListings = await Listing.find({
        $or: [
            { title: new RegExp(query, "i") },
            { location: new RegExp(query, "i") },
            { country: new RegExp(query, "i") }
        ]
    });

    res.render("listings/index.ejs", { allListings });
}));


//new Route
router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,
isOwner,
 upload.single("listing[image][url]"),
validateListing, 
wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing)
);




//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm)
);


module.exports = router;