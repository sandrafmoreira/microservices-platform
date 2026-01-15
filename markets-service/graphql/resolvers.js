import logger from '../utils/logger.js';
import axios from 'axios';
//db
import db from '../models/db.js';
//auth middleware
import { authorizeRole } from '../middlewares/auth.middleware.js';


const resolvers = {
    Query: {
        // logger.info("Fetching all markets")
        markets: async () => {
            try {
                return await db.Market.find();
            } catch (error) {
                logger.error(`Failed to fetch markets: ${error.message}`);
                throw new Error("Error fetching markets");
            }
        },

        market: async (_, { id }) => {
            try {
                logger.info("Fetching market by ID: " + id);
                return await db.Market.findById(id);
            } catch (error) {
                throw new Error("Market not found");
            }
        },
    },
    Market: {
        //connect to users-service to get sellers info
        sellers: async (market) => {
            if (!market.sellers || market.sellers.length === 0) return [];
            try {
                const requests = market.sellers.map(id => axios.get(`http://${process.env.HOST}:${process.env.USERS_SERVICE_PORT}/users/sellers/${id}`));
                const responses = await Promise.all(requests);
                return responses.map(res => (
                    {
                        ...res.data,
                        id: res.data.id  // Map "id" to "id" for GraphQL schema 
                    }));
            } catch (error) {
                logger.error(`Failed URL: http://localhost:${process.env.USERS_SERVICE_PORT}/users/sellers/...`);
                logger.error(`External Service Error (Users): ${error.message} on market ${market._id}`);
                return [];
            }
        },
        //connect to ratings-service to get ratings info
        ratings: async (market) => {
            if (!market) return null;
            try {
                const response = await axios.get(`http://${process.env.HOST}:${process.env.RATINGS_SERVICE_PORT}/ratings/markets/${market.id}`);
                logger.info(`Fetching ratings for market ${market.id} from external service...`);

                const ratingsData = response.data.data.marketRatings;

                return ratingsData.map(rating => ({
                    ...rating,
                    id: rating._id  // Map "_id" to "id" for GraphQL schema
                }));
            } catch (error) {
                logger.error(`External Service Error (Ratings): ${error.message} on market ${market.id}`);
                return [];
            }
        },
        averageRating: async (market) => {
            if (!market) return null;
            try {
                const response = await axios.get(`http://${process.env.HOST}:${process.env.RATINGS_SERVICE_PORT}/ratings/markets/${market.id}`);
                logger.info(`Fetching ratings for market ${market.id} from external service...`);
                return response.data.data.averageRating;

            } catch (error) {
                logger.error(`External Service Error (Ratings): ${error.message} on market ${market.id}`);
                return 0;
            }
        },
    },
    Mutation: {
        addMarket: async (_, args, context) => {
            try {
                authorizeRole(context.user, 'admin');// Only admin can add markets

                logger.info(`Admin [${context.user.id}] is creating market: '${args.name}'`);

                const existingMarket = await db.Market.findOne({ name: args.name, address: args.address })
                if (existingMarket) {
                    logger.warn(`Duplicate creation attempt by [${context.user.id}]: Market '${args.name}' exists.`);
                    throw new Error("Market already exists.");
                }
                const new_market = await new db.Market(args).save();

                logger.info(`Market created [ID: ${new_market._id}]`);
                return new_market;

            } catch (error) {
                logger.error(`Create Market Failed: ${error.message}`);
                throw new Error(`Error creating market: ${error.message}`);
            }
        },
        updateMarket: async (_, { id, ...args }, context) => {
            try {
                authorizeRole(context.user, 'admin');// Only admin can update markets
                logger.info(`Admin [${context.user.id}] updating market [${id}]`)

                const updatedMarket = await db.Market.findByIdAndUpdate(id, { $set: args }, { new: true });
                if (!updatedMarket) throw new Error(`Market not found`);

                logger.info(`Market with ID ${id} updated successfully.`);
                return updatedMarket;
            } catch (error) {
                logger.error(`Update Market Failed [${id}]: ${error.message}`);
                throw error;
            }
        },
        deleteMarket: async (_, { id }, context) => {
            authorizeRole(context.user, 'admin');// Only admin can delete markets
            logger.info(`Admin [${context.user.id}] deleting market [${id}]`);
            try {
                const deletedMarket = await db.Market.findByIdAndDelete(id);
                if (!deletedMarket) throw new Error(`Market not found`);

                logger.info(`Market with ID ${id} deleted successfully.`);
                return true;
            } catch (error) {
                logger.error(`Delete Market Failed [${id}]: ${error.message}`);
                throw error;
            }
        },

        addCategoryToMarket: async (_, { marketId, category }, context) => {
            try {
                authorizeRole(context.user, 'admin');// Only admin can modify categories
                logger.info(`Admin [${context.user.id}] updating category for market [${marketId}]`);
                return await db.Market.findByIdAndUpdate(
                    marketId,
                    { $addToSet: { categories: category } },//$addToSet prevent duplicates
                    { new: true }
                );
            } catch (error) {
                logger.error(`Error adding category to market: ${error.message}`);
                throw new Error(`Error adding category + ${error.message}`);
            }
        },
        removeCategoryFromMarket: async (_, { marketId, category }, context) => {
            try {
                authorizeRole(context.user, 'admin');// Only admin can modify categories
                logger.info(`Admin [${context.user.id}] removing category for market [${marketId}]`);
                return await db.Market.findByIdAndUpdate(
                    marketId,
                    { $pull: { categories: category } },
                    { new: true }
                );
            } catch (error) {
                logger.error(`Error removing category from market: ${error.message}`);
                throw new Error(`Error removing category + ${error.message}`);
            }
        },

        addSellerToMarket: async (_, { marketId, sellerId }, context) => {
            try {
                authorizeRole(context.user, 'admin');// Only admin can modify sellers
                logger.info(`Admin [${context.user.id}] adding seller [${sellerId}] to market [${marketId}]`);
                try {
                    await axios.get(`http://${process.env.HOST}:${process.env.USERS_SERVICE_PORT}/users/sellers/${sellerId}`);
                } catch (err) {
                    throw new Error("Seller not found in User Service or Service is Down.");
                }
                const updatedMarket = await db.Market.findByIdAndUpdate(
                    marketId,
                    { $addToSet: { sellers: sellerId } },
                    { new: true }
                );

                if (!updatedMarket) throw new Error("Market not found.");

                return updatedMarket;
            } catch (error) {
                logger.error(`Error adding seller to market: ${error.message}`);
                throw new Error(`Error adding seller + ${error.message}`);
            }
        },
        removeSellerFromMarket: async (_, { marketId, sellerId }, context) => {
            try {
                authorizeRole(context.user, 'admin');// Only admin can modify sellers
                logger.info(`Admin [${context.user.id}] removing seller [${sellerId}] from market [${marketId}]`);
                const updatedMarket = await db.Market.findByIdAndUpdate(
                    marketId,
                    { $pull: { sellers: sellerId } },
                    { new: true }
                );

                if (!updatedMarket) throw new Error("Market not found.");

                return updatedMarket;
            } catch (error) {
                logger.error(`Error removing seller from market: ${error.message}`);
                throw new Error(`Error removing seller + ${error.message}`);
            }
        }
    }
};

export default resolvers;