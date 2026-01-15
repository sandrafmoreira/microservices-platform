const swaggerAutogen = require("swagger-autogen")(); 

const doc = { 
    info: { 
        title: "Users Service API", 
        description: "Swagger documentation for Users Microservice", 
    }, 
    host: "localhost:3000", 
    schemes: ["http"], 
    tags: [ // the sections that will be presented in swagger page 
        { name: "Users", description: "Endpoints related to users" }, 
        { name: "Sellers", description: "Endpoints related to sellers"},
        { name: "Questionnaires", description: "Endpoints related to questionnaires"}
    ], 
    definitions: { // the objects used in the request and response bodies 
        GetUser: { // GET response bodies come with id 
            user_id: 123, 
            full_name: "Example Name", 
            email: "example@mail.com",
            role: "buyer/seller"
        }, 
        CreateUser: { // POST/PUT request bodies are sent without id 
            full_name: "Example Name", 
            email: "example@mail.com",
            role: "buyer/seller",
            accessToken: 'super-secret-token'
        },

        GetSeller: {
            seller_id: 123, 
            description: "A beautiful description", 
            product_type_id: 321,
            avatar: "url/to/avatar",
            alert: 'I am not selling oranges tomorrow! :('
        },
        CreateSeller: {
            description: "A beautiful description", 
            product_type_id: 321,
            avatar: "url/to/avatar",
            alert: 'I am not selling oranges tomorrow! :('
        },

        GetQuestionnaire: {
            user_id: 123,
            current_location: "Beach Town",
            product_type_id: 321
        },
        CreateQuestionnaire: {
            current_location: "Beach Town",
            product_type_id: 321
        }
    } 
}; 
 
const outputFile = "./swagger-output.json"; 
const endpointsFiles = ["./app.js"]; 
 
swaggerAutogen(outputFile, endpointsFiles, doc);