const express = require("express");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const _ = require("lodash");

const uri = "mongodb+srv://Admin-Mitadru:DB1234@clustermg.e4fjgoy.mongodb.net/todolistDB";
mongoose.connect(uri);

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
app.set("view engine", "ejs");

const itemSchema = mongoose.Schema ({ name: String });
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({ name: "Hello there!" });
const item2 = new Item({ name: "Hit the + button to add new items." });
const item3 = new Item({ name: "Mark the checkboxes to delete." });

const listSchema = new mongoose.Schema ({ name: String, items: [itemSchema] });
const List = mongoose.model("List", listSchema);

app.listen(3000, function (){

    console.log("\nServer Info:\n\nStatus: Active\nPort: 3000\n");
});

app.get("/", function (req, res){

    var defaultTitle = "Today";
    
    Item.find()
        .then(function (foundItems){
            
            if(foundItems.length === 0){

                Item.insertMany([ item1, item2, item3 ])
                    .then(function (){console.log("Successfully Inserted to todolistDB!\n")})
                    .catch(function (error){console.log(error)});

                res.redirect("/");
            }

            else{

                res.render("list", {
     
                    listTitle: defaultTitle,
                    listItem: foundItems
                });
            }
        })
        .catch(function (error){ console.log(error); });
});

app.post("/", function (req, res){

    const listTitle = req.body.submitType;      // To get the value of <%= listTitle %>.
    const newListItem = req.body.listItem;

    const item = new Item({ name: newListItem });

    if(listTitle === "Today") {
        
        item.save();
        
        console.log("Default List - New List Item:\n" + newListItem + "\n");
        res.redirect("/");
    }

    else {

        List.findOne({ name: listTitle })
            .then(function (foundList){

                foundList.items.push(item);
                foundList.save();
            })
            .catch(function (error){console.log(error);});

        console.log(listTitle + " - New List Item:\n" + newListItem + "\n");
        res.redirect("/" + listTitle);
    }
});

app.post("/delete", function (req, res){

    const listTitle = req.body.listName; 

    let id = req.body.checkbox;
    console.log("ID: " + id);

    if(listTitle === "Today"){

        Item.deleteOne({ _id: id })
            .then(function (){console.log("Successfully Deleted from todolistDB!\n");})
            .catch(function (error){console.log(error);});

        res.redirect("/");
    }

    else{

        Item.findOneAndUpdate({ name: listTitle }, { $pull: { items: { _id: id } } })    // Check MongoDB Docs for $pull.
            .then(function (){console.log("Successfully Deleted from todolistDB!\n");})
            .catch(function (error){console.log(error);});

        res.redirect("/" + listTitle);  
    }
});

// Using Express Route Parameter.
app.get("/:customList", function (req, res){

    const customListName = _.capitalize(req.params.customList);
    
    List.findOne({name: customListName})
        .then(function (foundList){
            
            if(foundList){
             
                // Rendering Existing List.

                console.log("Existing List Rendered!\nName: " + customListName + "\n");

                res.render("list", {

                    listTitle: foundList.name,
                    listItem: foundList.items
                });
            }

            else{

                // Creating a New List.

                const list = new List({name: customListName, items: [item1, item2, item3]});
                list.save();

                console.log("New List Created!\nName: " + customListName + "\n");
                res.redirect("/" + customListName);
            }

        })
        .catch(function (){console.log(error);});
});

app.get("/about", function (req, res){

    res.render("about");
});

// MongoDB Atlas:

// Username: Admin-Mitadru
// Password: DB1234