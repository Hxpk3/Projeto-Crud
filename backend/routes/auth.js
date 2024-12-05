const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require('../middlewares/auth.js');


router.post('/registrar', authController.registrar);
router.post('/login', authController.login);


router.get('/perfil', authMiddleware, (req, res) => {
    
    res.json({ message: 'Perfil acessado com sucesso' });
});

module.exports = router;