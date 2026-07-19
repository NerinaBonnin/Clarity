const router = require('express').Router();
const auth = require('../middleware/auth');
const { register, login, google, apple, me } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', google);
router.post('/apple', apple);
router.get('/me', auth, me);

module.exports = router;
