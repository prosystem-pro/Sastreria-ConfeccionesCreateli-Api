require('dotenv').config();

process.env.TZ = 'UTC';

require('./src/Relaciones/Relaciones');

const App = require('./src/app');

const PORT = process.env.PORT || 3000;

App.listen(PORT, '0.0.0.0', () => {
  console.log(`API disponible en: http://localhost:${PORT}/api`);
});

module.exports = App;