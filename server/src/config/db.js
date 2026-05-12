const { Pool } = require('pg');
const { POSTGRES_URL } = require('./env');

const pool = new Pool({
  connectionString: POSTGRES_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
