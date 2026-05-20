import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Load template so TypeScript is happy and we have default keys
import template from '../../config.example.json';

let localConfig: any = {};
try {
    const configPath = path.join(__dirname, '../../config.json');
    if (fs.existsSync(configPath)) {
        localConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
} catch (e) {
    // Ignore if config.json does not exist
}

const config: any = {
    ...template,
    ...localConfig,
    database: {
        ...template.database,
        ...(localConfig.database || {})
    }
};

// Environment variables take highest priority
if (process.env.DB_HOST) config.database.host = process.env.DB_HOST;
if (process.env.DB_PORT) config.database.port = Number(process.env.DB_PORT);
if (process.env.DB_USER) config.database.user = process.env.DB_USER;
if (process.env.DB_PASSWORD) config.database.password = process.env.DB_PASSWORD;
if (process.env.DB_NAME) config.database.database = process.env.DB_NAME;

if (process.env.JWT_SECRET) config.secret = process.env.JWT_SECRET;
if (process.env.EMAIL_FROM) config.emailFrom = process.env.EMAIL_FROM;
if (process.env.RESEND_API_KEY) config.resendApiKey = process.env.RESEND_API_KEY;
if (process.env.RESEND_FROM) config.resendFrom = process.env.RESEND_FROM;

export default config;
