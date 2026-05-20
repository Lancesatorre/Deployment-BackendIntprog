import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './src/_middlerware/error-handler';
import accountsController from './src/accounts/accounts.controller';
import swaggerDocs from './src/_helpers/swagger';

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Request logger with immediate output
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    process.stdout.write(`[${timestamp}] ${req.method} ${req.path}\n`);
    if (req.body && Object.keys(req.body).length > 0) {
        process.stdout.write('Body: ' + JSON.stringify(req.body).substring(0, 200) + '\n');
    }
    next();
});

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('/(.*)', cors(corsOptions));

// api routes
app.use('/accounts', accountsController);

// swagger docs route
app.use('/swagger', swaggerDocs);

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? Number(process.env.PORT || 80) : 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}/`));