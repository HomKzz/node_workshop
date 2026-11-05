const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isApproved: {type: Boolean, default: false},
    role: {type: String, enum: ['user', 'admin'], default: 'user'}
},
{
    timestamps: true
}
);

module.exports = mongoose.model('users', userSchema);