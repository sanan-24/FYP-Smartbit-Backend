const Product = require('../models/product.model');
const Profile = require('../models/profile.model');
const { ApiError } = require('../utils/ApiError');

class RecommendationService {
    /**
     * Get personalized recommendations for a user
     * @param {string} userId - The ID of the user
     * @returns {Promise<Array>} - List of recommended products
     */
    static async getRecommendations(userId) {
        const profile = await Profile.findOne({ user: userId });

        if (!profile) {
            throw new ApiError(404, 'User profile not found');
        }

        const {
            budgetLimit,
            calorieLimit,
            dietType,
            allergies,
            healthConditions
        } = profile;

        // Build the query
        let query = {
            isAvailable: true
        };

        // 1. Budget Constraint
        if (budgetLimit > 0) {
            query.price = { $lte: budgetLimit };
        }

        // 2. Calorie Limit
        if (calorieLimit > 0) {
            query['nutrition.calories'] = { $lte: calorieLimit };
        }

        // 3. Allergies (Avoid products containing these allergens)
        if (allergies && allergies.length > 0) {
            query.allergens = { $nin: allergies };
        }

        // 4. Health Conditions (Simple business logic)
        if (healthConditions && healthConditions.length > 0) {
            // Future implementation: Add specific nutrition filters based on conditions
        }

        // 5. Diet Type Filtering
        if (dietType && dietType !== 'none') {
            switch (dietType) {
                case 'low-carb':
                    query['nutrition.carbohydrates'] = { $lte: 20 };
                    break;
                // Add more cases as needed
            }
        }

        // Fetch products and sort by salesCount (trending)
        const recommendations = await Product.find(query)
            .populate('categoryId', 'name')
            .sort({ salesCount: -1 })
            .limit(20);

        return recommendations;
    }

    /**
     * Get trending products across the platform
     * @returns {Promise<Array>}
     */
    static async getTrendingProducts() {
        return await Product.find({ isAvailable: true })
            .populate('categoryId', 'name')
            .sort({ salesCount: -1 })
            .limit(10);
    }
}

module.exports = RecommendationService;
