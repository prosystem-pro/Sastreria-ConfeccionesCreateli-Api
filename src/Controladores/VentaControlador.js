
const Servicio = require('../Servicios/VentaServicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');


//LISTADOS
const ListadoProducto = async (req, res) => {

    try {

        const Objeto = await Servicio.ListadoProducto();

        return ResponderExito(
            res,
            'Productos obtenidos correctamente.',
            Objeto || []
        );

    } catch (error) {

        return ManejarError(
            error,
            res,
            'Error al obtener productos'
        );

    }

};


module.exports = {
 ListadoProducto
};