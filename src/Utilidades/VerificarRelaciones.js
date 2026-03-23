const Path = require('path');

// Conexión a la base de datos
const BaseDatos = require(Path.join(__dirname, '..', 'BaseDatos', 'ConexionBaseDatos'));

// Importamos el archivo donde están las relaciones, que ya devuelve los modelos vinculados
const Modelos = require(Path.join(__dirname, '..', 'Relaciones', 'relaciones'));

async function verificarRelaciones() {
  console.log('Iniciando verificación de relaciones...\n');

  for (const [nombreModelo, Modelo] of Object.entries(Modelos)) {
    if (!Modelo) {
      console.log(`⚠️  ${nombreModelo}: Modelo no definido`);
      continue;
    }

    const associations = Object.values(Modelo.associations || {});
    if (associations.length === 0) {
      console.log(`ℹ️  ${nombreModelo}: No tiene asociaciones`);
      continue;
    }

    for (const assoc of associations) {
      try {
        await Modelo.findAll({ limit: 1, include: [assoc] });
        console.log(`✅ ${nombreModelo} -> ${assoc.as} funciona`);
      } catch (error) {
        console.log(`❌ ${nombreModelo} -> ${assoc.as} FALLÓ`);
        console.log(`   Error: ${error.message.split('\n')[0]}`);
      }
    }
  }

  console.log('\nVerificación finalizada.');
  process.exit(0);
}

BaseDatos.authenticate()
  .then(() => {
    console.log('Conectado a la base de datos');
    verificarRelaciones();
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
    process.exit(1);
  });