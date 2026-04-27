// const sequelize = require('./src/BaseDatos/ConexionBaseDatos');
require('dotenv').config();
// process.env.TZ = 'UTC';
// 🔥 AQUÍ
console.log('TZ env:', process.env.TZ);
console.log('Offset:', new Date().getTimezoneOffset());
console.log('Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

require('./src/Relaciones/Relaciones'); 

const App = require('./src/app');
const PORT = process.env.PORT || 3000;

App.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = App;
