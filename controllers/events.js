const { response } = require('express');
const Evento = require('../models/Evento');

/*
 */
const getEventos = async (req, res = response) => {
  const eventos = await Evento.find().populate('user', 'name');

  try {
    res.status(200).json({
      ok: true,
      msg: eventos,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: `${error} Error getEventos`,
    });
  }
};

/*
 */
const crearEvento = async (req, res = response) => {
  // console.log(req.body);
  const evento = new Evento(req.body);

  try {
    evento.user = req.uid;

    const eventoGuardado = await evento.save();

    res.status(201).json({
      ok: true,
      msg: 'crearEvento',
      evento: eventoGuardado,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: `${error} Error crearEvento`,
    });
  }
};

/*
 */
const actualizarEvento = async (req, res = response) => {
  const eventoId = req.params.id;

  try {
    const evento = await Evento.findById(eventoId);
    const uid = req.uid;

    if (!evento) {
      return res.status(404).json({
        ok: false,
        msg: 'Evento no existe por ese id',
      });
    }

    if (evento.user.toString() !== uid) {
      return res.status(401).json({
        ok: false,
        msg: 'No tiene privilegio de editar este evento.',
      });
    }

    const nuevoEvento = {
      ...req.body,
      user: uid,
    };

    const eventoActualizado = await Evento.findByIdAndUpdate(eventoId, nuevoEvento, { new: true });

    res.status(200).json({
      ok: true,
      msg: 'actualizarEvento',
      evento: eventoActualizado,
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      ok: false,
      msg: `${error} actualizarEvento`,
    });
  }
};

/*
 */
const eliminarEvento = async (req, res = response) => {
  const eventoId = req.params.id;
  const uid = req.uid;

  try {
    const evento = await Evento.findById(eventoId);

    if (!evento) {
      return res.status(404).json({
        ok: false,
        msg: 'Evento no existe por ese id',
      });
    }

    if (evento.user.toString() !== uid) {
      return res.status(401).json({
        ok: false,
        msg: 'No tiene privilegio de eliminar este evento.',
      });
    }

    await evento.deleteOne();

    res.status(200).json({
      ok: true,
      msg: `El evento con ${eventoId} fue eliminado`,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: `${error} eliminarEvento`,
    });
  }
};

module.exports = {
  getEventos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
};
