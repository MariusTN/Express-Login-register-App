require("dotenv").config();
let express = require("express");
let mongoose = require("mongoose");
let bodyParser = require("body-parser");
let ejs = require("ejs");
let session = require("express-session");
let passport = require("passport");
let passportlocalmongoose = require("passport-local-mongoose");

let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(session({
    secret: process.env.SUPER_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.CONNECTION , {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

let userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportlocalmongoose);
let User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res)
{
    res.render("home");
});

app.get("/secrets", (req,res) =>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.route("/login")
.get((req,res) =>{
    res.render("login");
})
.post((req,res) => {

    const user = new User ({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
});

app.route("/register")
.get((req,res) =>{
    res.render("register");
})
.post((req,res) => {

    User.register({username: req.body.username}, req.body.password, (function(err,user){
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            })
        }
    }));
});

app.get("/logout", (req,res) =>{
    req.logout();
    res.redirect("/login");
})

let port = process.env.port || 5000;

app.listen(port, () => {
    console.log(`up and running at ${port}`);
});