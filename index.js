require('dotenv').config();

process.env.TZ = 'UTC';

require('./src/Relaciones/Relaciones');

const os = require('os');

const App = require('./src/app');

const PORT = process.env.PORT || 3000;


const networkInterfaces = os.networkInterfaces();
let ipLocal = 'localhost';
for (const interfaceName in networkInterfaces) {

  const interfaces = networkInterfaces[interfaceName];

  for (const iface of interfaces) {

    if (
      iface.family === 'IPv4' &&
      !iface.internal
    ) {
      ipLocal = iface.address;
      break;
    }

  }

}

App.listen(PORT, '0.0.0.0', () => {
  console.log(`http://localhost:${PORT}/api`);
  console.log(`http://${ipLocal}:${PORT}/api`);
});

module.exports = App;