const express = require('express');
const blogController = require('../controllers/blogController')

const router = express.Router();

router.get('/create-blog', blogController.blog_create_get);
router.post('/', blogController.blog_create_post);
router.get('/:id', blogController.blog_details);
router.delete('/:id', blogController.blog_delete);
router.get('/:id/checkforlike', blogController.blog_check_for_like);
router.get('/:id/bloglikenum', blogController.blog_like_num);
router.post('/:id/toggle-like', blogController.blog_toggle_like);
router.post('/:id/post-comment', blogController.blog_post_comment);
router.get('/:id/view-comments', blogController.blog_view_comments);
router.get('/:id/editblog', blogController.edit_blog);

module.exports = router;
