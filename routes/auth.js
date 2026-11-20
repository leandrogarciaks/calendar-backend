/*
    /api/auth
    Rutas de Usuarios / Auth
    host + /api/auth
*/

const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { validarCampos } = require('../middlewares/validar-campos');

const { holaMundo, crearUsuario, loginUsuario, revalidarToken } = require('../controllers/auth');

const { validarJWT } = require('../middlewares/validar-jwt');

router.get('/', holaMundo);

/*
 * /renew
 */
router.get('/renew', validarJWT, revalidarToken);

/*
 * /
 */
router.post(
  '/',
  [
    // Middlewares
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
    validarCampos,
  ],
  loginUsuario,
);

/*
 * /new
 */
router.post(
  '/new',
  [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
    validarCampos,
  ],
  crearUsuario,
);

module.exports = router;
