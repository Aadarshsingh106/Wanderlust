if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}
const express=require("express");
const app=express();
// Trust the first proxy when running in production (e.g. Heroku, reverse proxies)
// This allows Express to read x-forwarded-proto and lets secure cookies work
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
const mongoose=require("mongoose");
//const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
//const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require('connect-mongo');
const flash=require("connect-flash");
//const {listingSchema,reviewSchema}=require("./schema.js");
//const Review=require("./models/review.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const helmet=require("helmet");

const listingRouter = require("./routes/listing.js"); //this is copied by gpt
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

//const review = require("./models/review.js");

const dbUrl=process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
    await mongoose.connect(dbUrl);
    
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
// app.engine("ejs",engine);
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",(err)=>{
  console.log("ERROR in MONGO SESSION STORE", err);
});

sessionOptions={
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    // expires must be a Date object
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },

};

// app.get("/",(req,res)=>{
//     res.send("hi,i am root");
// });
// const store=MongoStore.create({
//   mongoUrl:dbUrl,
//   crypto:{
//     secret:"mysupersecretcode",
//   },
//   touchAfter:24*3600,
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});



 app.use("/listings", listingRouter);
 app.use("/listings/:id/reviews",reviewRouter);
 app.use("/",userRouter);




app.all("*" , (req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});

    // res.status(statusCode).send(message);
});

const port = process.env.PORT || 8080;
app.listen(port,()=>{
    console.log(`server is listening to port ${port}`);
});






