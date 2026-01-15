// include PRODUCT TYPE SERVICE!!
module.exports = (mongoose) => {
    const schema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: [true, 'User ID cannot be empty or null!']
        },

        description: {
            type: String,
            required: [true, 'Description cannot be empty or null!'],
            min: [10, "Description must have at least 10 characters"],
            max: [150, "Descriptin cannot have more than 150 characters"]
        },
        // product_type_id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'product_type'
        // }, 
        avatar: {
            type: String,  
            default: null
        },
        alert: {
            type: String,
            min: [4, 'Alert must have at least 4 characters.'],
            max: [60, 'Alert cannot have more than 60 characters.'],
            default: null
        }
    },
    { timeStamps: false }
    );
    const Seller = mongoose.model('seller', schema);
    return Seller;

}
