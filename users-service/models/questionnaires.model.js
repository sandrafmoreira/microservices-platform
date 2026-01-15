module.exports = (mongoose) => {
    const schema = new mongoose.Schema(
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: [true, 'User ID cannot be empty or null!']
            },

            current_location: {
                type: String,
                default: null
            },
            //preferred_product_type: {}
        }
    );
    const Questionnaire = mongoose.model('questionnaire', schema);
    return Questionnaire
}