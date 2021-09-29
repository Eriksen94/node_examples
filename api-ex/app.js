//include the required node modules
//express server, fs for handling the data file
const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());


//get route to return all names
app.get("/recipes", (req, res) => {
    //setup data structures
    let data = getData("data.json");
    let recipeList = {
        recipeNames: []
    };
    //loop through the names
    for (let i = 0; i < data.recipes.length; i++) {
        recipeList.recipeNames.push(data.recipes[i].name);
    }
    //respond
    res.status(200);
    res.json(recipeList);
});

//get route to take a name as a string and return ingredients and number of steps
app.get("/recipes/details/:name", (req, res) => {
    //setup data structures
    let name = req.params.name;
    let data = getData("data.json");
    let details = {};

    //if a match is found construct the return and respond
    let match = findRecipeNameIndex(data.recipes, name);
    if(match != -1){
        details.ingredients = data.recipes[match].ingredients.slice();
        details.numSteps = data.recipes[match].instructions.length;
    }

    //if there is a match or not, status code is 200 
    //details are updated on match
    res.status(200);
    res.json(details);
});

//post route to add additional recipes, error if name exists
app.post("/recipes", (req,res) => {
    //setup data structures
    let newRecipe = req.body;
    let data = getData("data.json");
    //check if the name in the body is already in the list of recipes
    let match = findRecipeNameIndex(data.recipes, newRecipe.name);

    //match, entry already exists --> error, otherwise add the entry
    if(match != -1){
        res.status(400);
        res.json({error: "Recipe already exists"});
    }
    else{
        data.recipes.push(newRecipe);
        updateData(data);
        res.sendStatus(201);
    }
});

//put route to update existing entries, error if name doesn't exist
app.put("/recipes", (req,res) => {
    //setup data structures
    let updateRecipe = req.body;
    let data = getData("data.json");
    //check if the name in the body is already in the list of recipes
    let match = findRecipeNameIndex(data.recipes, updateRecipe.name);

    //no match, nothing to update --> error, otherwise update the entry
    if(match === -1){
        res.status(404);
        res.json({error: "Recipe does not exist"});
    }
    else{
        data.recipes[match].ingredients = updateRecipe.ingredients.slice();
        data.recipes[match].instructions = updateRecipe.instructions.slice();
        updateData(data);
        res.sendStatus(204);
    }
});

//open server - listen to traffic on this port
app.listen(3000, () => {
    console.log("sever running on port 3000");
});

//find the index of the array element which has a name property matching the search key
//recipeList: a list of objects, each with a .name property
//name: the matching string to search the recipeList for
//return: array index of the first match found, or -1 if no matching name
function findRecipeNameIndex(recipeList, name){
    let match = -1;
    for(let i = 0; i < recipeList.length; i++){
        if(recipeList[i].name === name){
            match = i;
            break;
        }
    }
    return match;
}

//read the json data file and return a json object of all the data
function getData(fileName) {
    let filepath = __dirname + "/" + fileName;
    let file = fs.readFileSync(filepath, "utf8");
    return JSON.parse(file);
}

//write the object data as a JSON string to the data file
function updateData(data) {
    let filepath = __dirname + "/" + "data.json";
    return fs.writeFileSync(filepath, JSON.stringify(data));
}

module.exports = {
    app,
    getData,
    updateData
};