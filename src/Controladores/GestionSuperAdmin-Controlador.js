// Controladores/Gestion-PanelMaestroControlador.js

const Servicio = require('../Servicios/GestionSuperAdmin-Servicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');
const { LanzarError } = require('../Utilidades/ErrorServicios');

const LimpiarBaseDatosPruebas = async (req, res) => {
  try {

    const { SuperAdmin } = req.Datos;

    // 🔒 Seguridad fuerte
    if (!SuperAdmin) {
      LanzarError('No autorizado para ejecutar limpieza de base de datos', 403);
    }

    // 🔥 Protección adicional (muy recomendada)
    if (process.env.NODE_ENV === 'production') {
      LanzarError('No se permite limpiar la base de datos en producción', 403);
    }

    const Resultado = await Servicio.LimpiarBaseDatosPruebas(SuperAdmin);

    return ResponderExito(
      res,
      'Base de datos limpiada correctamente.',
      Resultado
    );

  } catch (error) {
    return ManejarError(error, res, 'Error al limpiar la base de datos');
  }
};

module.exports = {
  LimpiarBaseDatosPruebas
};