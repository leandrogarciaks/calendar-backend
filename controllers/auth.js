const { response } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');

const holaMundo = (req, res) => {
  res.json({
    ok: true,
    msg: 'Hola Mundo',
  });
};

const crearUsuario = async (req, res = response) => {
  //console.log(req.body);

  const { email, password } = req.body;
  try {
    let usuario = await Usuario.findOne({
      email: email,
    });

    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: 'El usuario ya existe con ese correo.',
      });
    }

    usuario = new Usuario(req.body);

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();

    // Generar JWT
    const token = await generarJWT(usuario.id, usuario.name);

    res.status(201).json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: 'Por favor hable con el administrador crearUsuario.',
    });
  }
};

const loginUsuario = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({
      email: email,
    });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: 'El usuario no existe con ese correo.',
      });
    }

    // Confirmar los password
    const validPassword = bcrypt.compareSync(password, usuario.password);

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: 'Contraseña no valida.',
      });
    }

    // Generar nuestro JWT
    const token = await generarJWT(usuario.id, usuario.name);

    res.status(200).json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: 'Por favor hable con el administrador loginUsuario.',
    });
  }
};

const revalidarToken = async (req, res) => {
  const uid = req.uid;
  const name = req.name;

  const token = await generarJWT(uid, name);

  res.json({
    ok: true,
    msg: 'revalidarToken',
    token: token,
  });
};

module.exports = {
  holaMundo,
  crearUsuario,
  loginUsuario,
  revalidarToken,
};
