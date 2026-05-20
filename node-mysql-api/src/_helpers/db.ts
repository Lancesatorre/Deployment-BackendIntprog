import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account-model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

initialize();

async function initialize() {
    const appConfig: any = config;
    const host = process.env.DB_HOST || appConfig.database?.host;
    const port = Number(process.env.DB_PORT || appConfig.database?.port || 3306);
    const user = process.env.DB_USER || appConfig.database?.user;
    const password = process.env.DB_PASSWORD || appConfig.database?.password;
    const database = process.env.DB_NAME || appConfig.database?.database;

    if (!host || !user || !database) {
        throw new Error('Database configuration is missing. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.');
    }

    const allowCreate = process.env.DB_ALLOW_CREATE === 'true' || (!process.env.DB_ALLOW_CREATE && process.env.NODE_ENV !== 'production');
    if (allowCreate) {
        const connection = await mysql.createConnection({ host, port, user, password });
        // Create DB if it doesn't exist (skip in managed production by default)
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();
    }

    // Connect to DB
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql', host, port, logging: false });

    // Init models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    // Define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // Sync models with database
    await sequelize.sync();
}