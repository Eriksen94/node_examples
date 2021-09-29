//test dependencies
const request = require("supertest");
//main app to be tested
const {app, getData, updateData} = require("../app");

//test get route to return list of all recipe names
describe("GET /recipes", () => {
    it("list all recipe names", (done) => {
        request(app).get("/recipes")
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});

//test get route to return details of a specific recipe name
describe("GET /recipes/details", () => {

    it("item exists: list ingredients and number of instruction steps", (done) => {
        request(app).get("/recipes/details/garlicPasta")
            .expect((res) => {
                res.body.numSteps = 5;
            })
            .expect(200, done);
    });

    it("item does not exist: return empty object", (done) => {
        request(app).get("/recipes/details/garlicPasta")
            .expect((res) => {
                res.body = {};
            })
            .expect(200, done);
    });
});


//test post route to add a new recipe
describe("POST /recipes", () => {

    after(() => {
        resetData();
    });

    it("item does not exist: add", (done) => {
        request(app).post("/recipes")
            .send(newRecipeTemplate("newName"))
            .expect(201, done);
    });

    it("item exists: error can't add", (done) => {
        request(app).post("/recipes")
            .send(existingRecipeTemplate())
            .expect((res) => {
                res.body.error = "Recipe already exists";
            })
            .expect(400, done);
    });

});


//test put route for updating an existing recipe
describe("PUT /recipes", () => {

    after(() => {
        resetData();
    });

    it("item exists: update", (done) => {
        request(app).put("/recipes")
            .send(existingRecipeTemplate())
            .expect(204, done);
    });

    it("item does not exist: error can't update", (done) => {
        request(app).put("/recipes")
            .send(newRecipeTemplate("differentName"))
            .expect((res) => {
                res.body.error = "Recipe does not exist";
            })
            .expect(404, done);
    });
});

//convenience setup for testing adding a new recipe
function newRecipeTemplate(name) {
    let rt = {
        name: name,
        ingredients: [
            "1 bagel",
            "2 tbsp butter"
        ],
        instructions: [
            "cut the bagel",
            "spread butter on bagel"
        ]
    };
    return rt;
}

//convenience setup for testing an existing recipe
function existingRecipeTemplate() {
    let rt = {
        name: "scrambledEggs",
        ingredients: ["1 tsp oil", "2 eggs", "salt"],
        instructions: ["Beat eggs with salt", "Heat oil in pan", "Add eggs to pan when hot", "Gather eggs into curds, remove when cooked", "Salt to taste and enjoy"]

    };
    return rt;
}

//cleanup function to reset data after testing
function resetData() {
    updateData(getData("defaultData.json"));
}