const Product = require('../models/product.model');
const { ApiError } = require('../utils/ApiError');

class ProductService {
    static async addProduct(productData) {
        const product = await Product.create(productData);
        return product;
    }

    static async getAllProducts(filters = {}) {
        const query = { isAvailable: true };

        if (filters.category) {
            query.categoryId = filters.category;
        }

        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
            if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
        }

        if (filters.flavor) {
            query.flavorProfile = { $in: [new RegExp(filters.flavor, 'i')] };
        }

        if (filters.diet) {
            query.dietaryTags = { $in: [new RegExp(filters.diet, 'i')] };
        }

        let sortOptions = { createdAt: -1 };
        if (filters.sortBy === 'popularity') {
            sortOptions = { salesCount: -1 };
        } else if (filters.sortBy === 'priceLowHigh') {
            sortOptions = { price: 1 };
        }

        return await Product.find(query)
            .populate('categoryId', 'name')
            .sort(sortOptions);
    }

    static async getProductById(productId) {
        const product = await Product.findById(productId).populate('categoryId', 'name');
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }
        return product;
    }

    static async updateProduct(productId, updateData) {
        const product = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true }
        );
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }
        return product;
    }

    static async deleteProduct(productId) {
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }
        return true;
    }
}

module.exports = ProductService;
