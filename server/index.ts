const express = require('express');
const app = express();
const cors = require("cors");
const port = 3001;

const config = require("./db.config.ts");
const { DataTypes } = require('sequelize');

const corsOptions = {
	origin: "http://localhost:5173"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
	next();
});

// Sequelize models
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
	config.database,
	config.user,
	config.password,
	{
		logging: false,

		host: config.host,
		dialect: config.dialect,
		pool: {
			max: config.pool.max,
			min: config.pool.min,
			acquire: config.pool.acquire,
			idle: config.pool.idle
		}
	}
);
const warehouses = sequelize.define("warehouses", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
});
const zones = sequelize.define("zones", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	warehouse_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	label: {
		type: DataTypes.INTEGER,
		allowNull: false,
	}
});
const shelves = sequelize.define("shelves", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	zone_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: zones,
			key: 'id',
		}
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	}
});

warehouses.hasMany(zones, {
	foreignKey: 'warehouse_id',
});
zones.belongsTo(warehouses, {
	foreignKey: 'warehouse_id',
});

zones.hasMany(shelves, {
	foreignKey: 'zone_id',
});
shelves.belongsTo(zones, {
	foreignKey: 'zone_id',
});

sequelize.sync({ alter: true });

// Types
type Warehouse = {
	id:		number;
	zones:	Zone[];
}

type Zone = {
	id:				number;
	label:			number;
	warehouse_id:	number;
	shelves:		Shelf[];
}

type Shelf = {
	id:			number;
	name:		string;
	zone_id:	number;
}

const addWarehouse = (req, res) => {
	// Server-side validations
	let valid = true;

	const zoneLabels = new Map();
	const shelfNames = new Map();
	req.body.forEach((zone: Zone) => {
		// Check if there are 12 zones labeled 1-12
		if ((zoneLabels.get(zone.label)) || (zone.label < 0) || (zone.label > 12)) {
			valid = false;
		} else {
			zoneLabels.set(zone.label, true);
		}
		let count = 0;
		zone.shelves.forEach((shelf: Shelf) => {
			count += 1;
			// Make sure there aren't more than 10 shelves per zone
			if (count > 10) valid = false;
			
			// Check if shelf names are unique
			// (assuming there can be the same shelf names across different warehouses)
			if (shelfNames.get(shelf.name)) {
				valid = false;
			} else {
				shelfNames.set(shelf.name, true);
			}
		})
	})
	if (zoneLabels.size != 12) valid = false;

	// Insert data into postgres db
	if (valid) {
		warehouses.create()
		.then((result) => {
			req.body.forEach((zone: Zone) => {
				zones.create({
					label: zone.label,
					warehouse_id: result.id,
				}).then((result) => {
					zone.shelves.forEach((shelf: Shelf) => {
						shelves.create({
							name: shelf.name,
							zone_id: result.id,
						})
					})
				})
			})
		})
		.then(res.status(200).send({ message: "Warehouse added successfully!" }))
		.catch(err => {
			res.status(500).send({ message: err.message });
		})
	} else {
		res.status(400).send({ message: "Malformed warehouse request" });
	}

}

app.get('/', (req, res) => {
	res.send('cool server');
});

app.post('/api/addwarehouse', addWarehouse);

app.listen(port, () => {
	console.log(`App running on port ${port}.`)
})