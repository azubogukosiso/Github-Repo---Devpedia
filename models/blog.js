const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    snippet: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    header_image: {
        data: Buffer,
        contentType: String,
    },
    blog_likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogLike'
    }],
    blog_comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogComment'
    }]
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;