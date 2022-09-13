const express = require('express');
const app = express();
app.use(express.static('public'));

const mongoose = require('mongoose');
const Blog = require('../models/blog');
const BlogLike = require('../models/blogLike');
const BlogComment = require('../models/blogComment');
const User = require('../models/user');

// renders the "create a new blog" page
const blog_create_get = (req, res) => {
    res.render('create', {title: 'Create a New Blog'});
}

// creates a new blog and adds it to the blog database
const blog_create_post = async (req, res) => {
    if (req.files === null) {
        const blog_details = {
            author: req.body.author,
            title: req.body.title,
            snippet: req.body.snippet,
            body: req.body.body,
            header_image: 'null',
            content_image: 'null',
        }
        console.log(blog_details);

        try{
            await Blog.create(blog_details);
            res.status(201).json({ success: 'Your blog has been created!' });
        }
        catch (err) {
            res.status(400).json({ error: 'There was a problem in posting your blog', err });
        }
    } else{
        const blog_details = {
            author: req.body.author,
            title: req.body.title,
            snippet: req.body.snippet,
            body: req.body.body,
            header_image: req.files.header_image,
            content_image: req.files.content_image,
        }
        console.log(blog_details);

        header_image_gen = blog_details.header_image;
        content_image_gen = blog_details.content_image;

        try{
            await Blog.create(blog_details);
            header_image_gen.mv('./header_images/' + header_image_gen.name);
            content_image_gen.mv('./content_images/' + content_image_gen.name);
            res.status(201).json({ success: 'Your blog was posted successfully!' });
        }
        catch (err){
            res.status(400).json({ error: 'There was a problem in posting your blog', err });
        }
    }
}
 
// renders the full details of a blog, i.e. the body of the blog
const blog_details = (req, res) => {
    const id = req.params.id;
    Blog.findById(id)
        .then((result) => {
            res.render('details', { blog: result, title: 'Blog Details' })
        })
        .catch((err) => {
            console.log(err);
            res.status(404).render('404', {title: '404'});
        })
}

// deletes a blog from the blog database based on the given id
const blog_delete = (req, res) => {
    const id = req.params.id;

    Blog.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/' })
        })
        .catch(err => {
            console.log(err);
        })
}

// on rendering a certain blogs' details, this checks to see if the current user has liked the blog before
const blog_check_for_like = (req, res) => {
    const id = req.params.id;

    BlogLike.findOne({
        blog_id: id,
        user_id: req.user
    }).then((blog_like) => {
        if (blog_like){
            return res.send({
                message: 'Exists'
            });
        } else{
            return res.send({
                message: 'Does not exist'
            });
        }
    }).catch((err) => {
        res.status(400).send({
            message: err.message,
        })
    })
}

// checks the number of likes a blog post has
const blog_like_num = (req, res) => {
    const id = req.params.id;

    BlogLike.find({
        blog_id: id,
    }).then((blog) => {
        blog_likes = blog.length;
        res.send({ message: blog_likes });
    });
}

// this handles the liking and unliking of a blog
const blog_toggle_like = async(req, res) => {
    const id = req.params.id; // get the id of the blog

    if (!mongoose.Types.ObjectId.isValid(id)) { // checks if the blog's id is valid or not
        return res.status(400).send({
            message: 'Invalid blog id',
            data: {}
        })
    } else {
        console.log('valid');

        Blog.findOne({_id: id}).then(async(blog) => { // checks for a blog in the blog collection for a blog with the given id
            if(!blog) { // if there are no blogs like send a msg confirming that
                return res.status(400).send({
                    message: 'No blog found',
                    data: {}
                });
            }else { // if there are do the ffg...
                let current_user = req.user; // the id of the user who liked the blog
    
                User.findById(current_user) // finds the details of the user using the user's id
                .then(async(result) => {
                    const username = result.username;
                    
                    BlogLike.findOne({ // checks to see if the current user has liked the blog before by a checking for a bloglike doc in the bloglike col
                        username: username,
                        blog_id: id,
                        user_id: current_user
                    }).then(async(blog_like) => { // gets the results for the above request
                        try{
                            if(!blog_like) { // if there isn't a doc confirming that the user has liked the blog before...
                                let blogLikeDoc = new BlogLike({ // then register the bloglike data
                                    username: username,
                                    blog_id: id,
                                    user_id: current_user
                                });
                                let likeData = await blogLikeDoc.save();

                                await Blog.updateOne({ // update the bloglikes array of that particular blog, by adding the bloglike data
                                    _id: id
                                }, {
                                    $push: {blog_likes: likeData.user_id}
                                })
                                return res.status(200).send({ // return a msg confirming that the like has been recorded
                                    message: 'Liked',
                                    data: {}
                                });
                            }else { // if there is a doc confirming that the user has liked the blog before...
                                await BlogLike.deleteOne({ // find the doc using the provided data and delete it
                                    _id: blog_like._id
                                });

                                await Blog.updateOne({ // update the bloglikes array of that particular blog, by removing the bloglike data
                                    _id: blog_like.blog_id
                                }, {
                                    $pull: {blog_likes: blog_like.user_id}
                                })

                                return res.status(200).send({ // return a msg confirming that the like has been removed
                                    message: 'Unliked',
                                    data: {}
                                });
                            }
                        }catch(err) { // get any errors if there are
                            return res.status(400).send({
                                message: err.message,
                                data: err
                            })
                        }
                    }).catch((err) => { // get any errors if there are
                        return res.status(400).send({
                            message: err.message,
                            data: err
                        })
                    })
                })
            }
        }).catch((err) => { // get any errors if there are
            return res.status(400).send({
                message: err.message,
                data: err
            })
        })
    }    
}

const blog_post_comment = async (req, res) => {
    const comment = req.body.comment; // passing in the comment
    const user_id = req.user;
    const blog_id = req.params.id;
    // console.log(comment);
    User.findById(user_id)
        .then(async(result) => {
            console.log(result);
            const username = result.username;
            console.log(username);

            try{
                const commentDoc = await BlogComment.create({ username, comment, blog_id, user_id });
                console.log(commentDoc);
                await Blog.updateOne({
                    _id: blog_id
                }, {
                    $push: {blog_comments: commentDoc.user_id}
                })
                res.status(201).json({ commentDoc: commentDoc });
            } catch (err){
                console.log(err);
            }
        })
        .catch(err => {
            console.log(err);
        })
}

const blog_view_comments = (req, res) => {
    const blog_id = req.params.id;
    BlogComment.find({blog_id: blog_id}).sort({ createdAt: -1 })
        .then((result) => {
            res.send({comments: result});
        })
        .catch((err) => {
            console.log(err);
        });
}

const edit_blog = (req, res) => {
    const blog_id = req.params.id;
    console.log(blog_id);
    Blog.findById(blog_id)
    .then((result) => {
        res.render('edit', {blog: result, title: 'Edit Blog'})
    })
    .catch((err) => {
        console.log(err);
    });
}

module.exports = {
    blog_create_get,
    blog_create_post,
    blog_details,
    blog_delete,
    blog_check_for_like,
    blog_like_num,
    blog_toggle_like,
    blog_post_comment,
    blog_view_comments,
    edit_blog
}
