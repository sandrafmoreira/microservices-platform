import swaggerAutogen from "swagger-autogen"; 

const doc = { 
    info: { 
        title: "Ratings Service API", 
        description: "Swagger documentation for Ratings Microservice",
    }, 
    host: "localhost:3004", 
    schemes: ["http"], 
    tags: [ 
       
        { name: "Ratings", description: "Endpoints related to ratings management" }, 
    ], 
    definitions: { 
       
        CreateRating: { 
            market_id: "6587f1a2b3c4d5e6f7a8b9c0",
            rating: 5, 
            comment: "Excelente feira, produtos muito frescos!" 
        },

        GetRating: { 
            _id: "6587f1a2b3c4d5e6f7a8b9c0",
            user_id: "69317c1d009c3bf3f0e6e464",
            market_id: "6587f1a2b3c4d5e6f7a8b9c0",
            rating: 5, 
            comment: "Excelente feira, produtos muito frescos!",
            createdAt: "2023-12-25T10:00:00.000Z",
            updatedAt: "2023-12-25T10:00:00.000Z",
            __v: 0
        },

        PostRating: {
            $ref: "#/definitions/GetRating"
        }
    } 
}; 
 
const outputFile = "./swagger-output.json"; 
const endpointsFiles = ["./app.js"]; 
 
swaggerAutogen(outputFile, endpointsFiles, doc);