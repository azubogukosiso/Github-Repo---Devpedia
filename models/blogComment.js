const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogCommentSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    comment: {
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

const BlogComment = mongoose.model('BlogComment', blogCommentSchema);

module.exports = BlogComment;