const userController = require('../controllers/userController');
const express = require('express');
const router = express.Router();
router.get('/editor', userController.userEditorCreate);
router.get('/editor/:room', userController.userEditor);
module.exports = router;