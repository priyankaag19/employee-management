const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const depthLimit = require('graphql-depth-limit');
require('dotenv').config();

const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const { createContext } = require('./utils/context');
const { initializeDatabase } = require('./database/connection');
const logger = require('./utils/logger');

async function startServer() {
    const app = express();
    
    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));
    
    // Compression middleware
    app.use(compression());
    
    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/graphql', limiter);
    
    // CORS configuration
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' 
            ? process.env.FRONTEND_URL 
            : ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
    }));
    
    // Initialize database
    await initializeDatabase();
    
    // Create Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: createContext,
        plugins: [
            {
                requestDidStart() {
                    return {
                        didEncounterErrors({ errors }) {
                            errors.forEach(error => {
                                logger.error('GraphQL Error:', error);
                            });
                        },
                    };
                },
            },
        ],
        validationRules: [
            depthLimit(10),
        ],
        formatError: (error) => {
            logger.error('GraphQL Error:', error);
            
            // Don't expose internal errors in production
            if (process.env.NODE_ENV === 'production') {
                return new Error('Internal server error');
            }
            
            return error;
        },
        introspection: process.env.NODE_ENV !== 'production',
        playground: process.env.NODE_ENV !== 'production',
    });
    
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });
    
    // Error handling middleware
    app.use((error, req, res, next) => {
        logger.error('Express Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
        });
    });

    app.use((req, res, next) => {
  console.log(`[GraphQL] Incoming: ${req.method} ${req.url}`);
  next();
});
    
    const PORT = process.env.PORT || 4000;
    
    app.listen(PORT, () => {
        logger.info(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
        logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
});