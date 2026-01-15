const mongoose = require("mongoose");

const Schema = new mongoose.Schema({

    user_id: {
        
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },

    type: {

        type: String,
        enum: ["event_reminder", "promotion"],
        required: true
    },

    content: {
        
        type: String,
        required: true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Notification', Schema);