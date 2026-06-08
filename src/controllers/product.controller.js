const ProductService = require('../services/product.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/AsyncHandler');
const { uploadOnCloudinary } = require('../utils/cloudinary');

const addProduct = asyncHandler(async (req, res) => {
    let imageUrl = "";
    if (req.file) {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
        if (!cloudinaryResponse) {
            throw new ApiError(500, "Error while uploading image to Cloudinary");
        }
        imageUrl = cloudinaryResponse.url;
    }

    const product = await ProductService.addProduct({
        ...req.body,
        image: imageUrl
    });

    return res.status(201).json(
        new ApiResponse(201, product, 'Product added successfully')
    );
});

const getAllProducts = asyncHandler(async (req, res) => {
    const { category, minPrice, maxPrice, flavor, diet, sortBy } = req.query;
    
    const products = await ProductService.getAllProducts({
        category,
        minPrice,
        maxPrice,
        flavor,
        diet,
        sortBy
    });

    return res.status(200).json(
        new ApiResponse(200, products, 'Products fetched successfully')
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);
    return res.status(200).json(
        new ApiResponse(200, product, 'Product fetched successfully')
    );
});

const updateProduct = asyncHandler(async (req, res) => {
    let updateData = { ...req.body };

    if (req.file) {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
        if (!cloudinaryResponse) {
            throw new ApiError(500, "Error while uploading image to Cloudinary");
        }
        updateData.image = cloudinaryResponse.url;
    }

    const product = await ProductService.updateProduct(req.params.id, updateData);
    return res.status(200).json(
        new ApiResponse(200, product, 'Product updated successfully')
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
    await ProductService.deleteProduct(req.params.id);
    return res.status(200).json(
        new ApiResponse(200, null, 'Product deleted successfully')
    );
});

module.exports = {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
