const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogLikeSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    blog_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const BlogLike = mongoose.model('BlogLike', blogLikeSchema);

module.exports = BlogLike;