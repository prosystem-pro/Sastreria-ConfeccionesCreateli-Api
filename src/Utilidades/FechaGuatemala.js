const { DateTime } = require('luxon');

const ZONA_GUATEMALA = 'America/Guatemala';

const convertirAGuatemala = (fecha) => {
    if (!fecha) return null;

    return DateTime.fromJSDate(new Date(fecha), { zone: 'utc' })
        .setZone(ZONA_GUATEMALA);
};

const formatearFechaHora = (fecha) => {
    const dt = convertirAGuatemala(fecha);
    if (!dt) return null;

    return dt.toFormat('dd/MM/yyyy HH:mm');
};

const formatearSoloFecha = (fecha) => {
    const dt = convertirAGuatemala(fecha);
    if (!dt) return null;

    return dt.toFormat('dd/MM/yyyy');
};

module.exports = {
    convertirAGuatemala,
    formatearFechaHora,
    formatearSoloFecha
};