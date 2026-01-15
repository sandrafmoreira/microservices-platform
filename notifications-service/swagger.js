const swaggerAutogen = require("swagger-autogen")(); 

const doc = { 
    info: { 
        title: "Notifications Service API", 
        description: "Swagger documentation for Notifications Microservice", 
    }, 
    host: "localhost:3002", 
    schemes: ["http"], 
    tags: [ // the sections that will be presented in swagger page 
        { name: "Notifications", description: "Endpoints related to notifications" }, 
    ], 
    definitions: { // the objects used in the request and response bodies 
        GetNotification: { // GET response bodies come with id 
            id: 123, 
            user_id: "1", 
            type: "example type",
            content: "This is a notification.",
            createdAt: "2025-11-01T12:34:56.789Z"
        }, 

        CreateNotification: { // POST/PUT request bodies are sent without id 
            user_id: "1", 
            type: "example type",
            content: "This is a notification."
        },

    } 
}; 
 
const outputFile = "./swagger-output.json"; 
const endpointsFiles = ["./app.js"]; 
 
swaggerAutogen(outputFile, endpointsFiles, doc);