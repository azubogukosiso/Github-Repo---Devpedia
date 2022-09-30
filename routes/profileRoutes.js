const { Router } = require('express');
const profileController = require('../controllers/profileController');
const router = Router();

router.get('/', profileController.profile_get);
router.post('/:id/changeusername', profileController.profile_change_username);
router.post('/:id/changeuseremail', profileController.profile_change_useremail);
router.put('/:id/changeuserpassword', profileController.profile_change_userpassword);

module.exports = router;
