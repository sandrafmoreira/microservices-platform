module.exports = (mongoose) => {
    const schema = new mongoose.Schema(
        {
            full_name: {
                type: String,
                required: [true, 'Name cannot be empty or null'],
                min: [4, 'Name must have at least 4 characters'],
                man: [60, 'Name cannot have more than 60 characters']
            },

            email: {
                type: String,
                required: [true, 'Email cannot be empty or null'],
                min: [6, 'Email must have at least 6 characters'],
                man: [40, 'Email cannot have more than 40 characters']
            },

            role: {
                type: String,
                enum: {
                    values: ['buyer', 'seller'],
                    message: '{VALUE} is not supported! Role must be buyer or seller!'
                },
                required: [true, 'User role cannot be empty or null'],
                default: 'buyer'
            },

            admin: {
                type: Boolean,
                default: false
            },

            password: {
                type: String,
                required: [true, 'Password can not be empty or null!']
            }
        },
        { timeStamps: false }
    );

    const User = mongoose.model('user', schema);
    return User;
} 