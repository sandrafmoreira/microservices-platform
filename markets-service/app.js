import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import 'dotenv/config';

// IMPORT typeDefs / resolvers
import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';

// Logger
import logger from './utils/logger.js';

//Auth Middleware
import { authenticateToken } from './middlewares/auth.middleware.js';

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.GRAPHQL_PORT },
  context: async ({ req }) => {
    const user = authenticateToken(req);
    // if (user) logger.info(`Request from User: ${user.id}`);
    return { user };
  }
});

logger.info(`GraphQL Markets Service running at: ${url}`);