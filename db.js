const mariadb = require('mariadb');
const env = require('./env.js');

const pool = mariadb.createPool({
	host: env.mariadb.host,
	user: env.mariadb.user,
	password: env.mariadb.password,
	database: env.mariadb.database,
	charset: 'utf8mb4',
});

module.exports = {
	getConnection: function(){
		return new Promise(function(resolve, reject){
			pool.getConnection().then(function(connection){
				resolve(connection);
			}).catch(function(error){
				reject(error);
			});
		});
	},
};
