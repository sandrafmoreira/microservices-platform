export default (mongoose) => {
    const schema = new mongoose.Schema(
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: [true, "user ID required"]
            },
            
            market_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Market",
                required: [true, "market ID required"]
            },
    
            rating: {
                type: Number,
                required: [true, "Rating is required"],
                min: [1, "Minimum rating is 1"],
                max: [5, "Maximum rating is 5"],
                validate: {
                    validator: Number.isInteger,
                    message: "Rating must be an integer value"
                }
            },
            
            comment: {
                type: String,
                trim: true,
                maxlength: [500, "Comment cannot exceed 500 characters"]
            }
        }, {
        timestamps: true 
    });

    const Rating = mongoose.model('rating', schema);
    return Rating;
} 