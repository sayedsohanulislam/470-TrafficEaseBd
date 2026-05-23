const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDatabase } = require('./config/database');

const databaseReady = connectDatabase();

const start = async () => {
  await databaseReady;
  const port = process.env.PORT || 5000;
  return app.listen(port, () => console.log(`Server running on port ${port}`));
};

if (require.main === module) {
  start();
}

module.exports = app;
module.exports.start = start;
module.exports.databaseReady = databaseReady;
