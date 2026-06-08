const Category = require('../models/category.model');
const { ApiError } = require('../utils/ApiError');

class CategoryService {
    static async createCategory(categoryData) {
        return await Category.create(categoryData);
    }

    static async getAllCategories() {
        return await Category.find();
    }

    static async updateCategory(categoryId, categoryData) {
        const category = await Category.findByIdAndUpdate(
            categoryId,
            { $set: categoryData },
            { new: true }
        );
        if (!category) {
            throw new ApiError(404, 'Category not found');
        }
        return category;
    }

    static async deleteCategory(categoryId) {
        // Check if any products are associated with this category
        const Product = require('../models/product.model');
        const associatedProducts = await Product.countDocuments({ categoryId });

        if (associatedProducts > 0) {
            throw new ApiError(400, `Cannot delete category. There are ${associatedProducts} products associated with it.`);
        }

        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            throw new ApiError(404, 'Category not found');
        }
        return true;
    }
}

module.exports = CategoryService;
