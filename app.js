let express = require('express');
let mongoose = require("mongoose");
let bodyParser = require("body-parser");

let app = express();

app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs');
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

let userSchema = {
    email: String,
    password: String
};

let User = new mongoose.model("User", userSchema);

app.get("/", function(req, res)
{
    res.render("home");
});

app.get("/login", function(req, res)
{
    res.render("login");
});

app.get("/register", function(req, res)
{
    res.render("register");
});

app.post("/register", (req,res) =>{
    let newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save( (err) =>{
        if(err) {
            console.log(err)
        } else {
            res.render("secrets");
        }
    });
});

app.post("/login", function(req, res)
{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, fUser) =>{
        if (err) {
            console.log(err);
            
        } else {
            if(fUser){
                if(fUser.password === password){
                    res.render("secrets");
                }
            }
        }
    })
});


let port = process.env.port || 5000;

app.listen(port, () => {
    console.log(`up and running at ${port}`);
})