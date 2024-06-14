require('dotenv').config();
module.exports = {
	user: process.env.PG_USER,
	host: 'localhost',
	database: 'inventory',
	password: process.env.PG_PASSWORD,
	port: 5432,
	dialect: "postgres",
	pool: {
	  max: 5,
	  min: 0,
	  acquire: 30000,
	  idle: 10000
	}
  };