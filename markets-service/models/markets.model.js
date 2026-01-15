export default (mongoose) => {
  const schema = new mongoose.Schema({
   name: { 
        type: String, 
        required: [true, 'Market name cannot be empty!'], 
        unique: true
      },
      description: { 
        type: String, 
        required: [true, 'Description is mandatory!'] 
      },
      imageUrl: { 
        type: String, 
        required: [true, 'Image URL is required!'] 
      },
      address: { 
        type: String, 
        required: [true, 'Address cannot be empty!'] 
      },
      latitude: { 
        type: Number, 
        required: [true, 'Latitude is required for the map!'] 
      },
      longitude: { 
        type: Number, 
        required: [true, 'Longitude is required for the map!'] 
      },
      openingHours: { 
        type: String, 
        required: [true, 'Opening hours must be defined!'] 
      },
      categories: { 
        type: [String], 
        required: [true, 'At least one category is required!'] 
      },
      sellers: { type: [String], default: [] },
      //ratings: [{ userId: String, rating: Number }]
    },
    { timestamps: true }
  );

  const Market = mongoose.model("Market", schema);
  return Market;
};