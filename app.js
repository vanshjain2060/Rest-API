// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.set("view engine" , "ejs");

app.use(bodyParser.urlencoded({extended : true}));

app.use(express.static("public"));

// Connect to MongoDB
const dbURI = "mongodb+srv://admin-vansh:<password>@cluster0.ki3p5of.mongodb.net/wikiDB";
mongoose.connect(dbURI, { useNewUrlParser: true});


// Making Sechema and then model {note : string inside the model is going to be lowercased and pluralized 
// and that automodified name is going to be saved as collection name inside the database}
const articleSchema = {
    title : String,
    content : String
}
const Article = mongoose.model("Article" , articleSchema);


// --------------------------------------------  Requests Targetting All Articles ---------------------------------------------
// Chain Routing of get , post , delete methods on a common route
app.route("/articles")

.get((req, res) => {
    Article.find({})
        .then(foundArticles => {
            console.log("Found articles:", foundArticles);
            res.send(foundArticles); // Send the articles as JSON response
        })
        .catch(err => {
            console.error("Error fetching articles:", err);
            res.status(500).send("Internal server error");
        });
})

.post(function(req, res) {
    
    // creating real object using mongoose model that contains the data feilds and it is going to be saved in the database
    const newArticle = new Article ({
        title : req.body.title ,
        content : req.body.content
    })

    newArticle.save() 
        .then(() => {
            res.send("Successfuly added a new article.");
        })
        .catch((err) => {
            res.send(err);
        });
})

.delete(function(req, res) {

    Article.deleteMany({})
        .then(() => {
            res.send("All articles deleted successfully.");
        })
        .catch((err) => {
            console.error("Error deleting articles:", err);
            res.status(500).send("Internal server error");
        });
});


//  ------------------------------------------- Requests Targetting a Specific Article --------------------------------
app.route("/articles/:arti")

.get(function(req, res) {
    const articleName = req.params.arti ;
    Article.findOne({title : articleName})
    .then(foundArticle => {
        res.send(foundArticle);
    })
    .catch(err => {
        res.status(500).send("Some Error Occured");
    });
})

.put(function(req, res) {
    Article.updateOne({title : req.params.arti} , {title : req.body.title , content : req.body.content} , {overwrite : true})
        .then(() => {
            res.send("Successfully Updated the article.")
        })
        .catch(err => {
            res.status(500).send("Some Error Occured");
        });
})

.patch(function(req, res) {
    // since req.body will gives the js object which contains all the fields that user has givern to update 
    // in the syntax we need a js obl=ject with the $set flag
    Article.updateOne({title : req.params.arti} , {$set : req.body})
    .then(() => {
        res.send("Successfully Updated the given fields");
    })
    .catch(err => {
        res.status(500).send("Some Error Occured");
    })
})

.delete(function(req, res) {
    Article.deleteOne({title : req.params.arti})
    .then(() =>{
        res.send("Article named " + req.params.arti + " is Successfully Deleted");
    })
    .catch((err) => {
        res.status(500).send("Internal server error");
    })
});


app.listen(3000, function() {
    console.log("Server Started on port 3000");
});
