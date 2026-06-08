const mongoose = require('mongoose');
const Category = require('./src/models/category.model');
const Product = require('./src/models/product.model');
const Ingredient = require('./src/models/ingredient.model');
const ProductIngredient = require('./src/models/productIngredient.model');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Ingredient.deleteMany({});
        await ProductIngredient.deleteMany({});

        // 1. Create Categories
        const catBurger = await Category.create({ name: 'Burger' });
        const catPizza = await Category.create({ name: 'Pizza' });
        const catShawarma = await Category.create({ name: 'Shawarma' });

        // 2. Create Ingredients
        const ingChicken = await Ingredient.create({ name: 'Chicken', nutritionPer100g: { calories: 239, protein: 27 }, allergens: [] });
        const ingBeef = await Ingredient.create({ name: 'Beef', nutritionPer100g: { calories: 250, protein: 26 }, allergens: [] });
        const ingCheese = await Ingredient.create({ name: 'Cheese', nutritionPer100g: { calories: 402, protein: 25 }, allergens: ['Dairy'] });
        const ingFlour = await Ingredient.create({ name: 'Flour', nutritionPer100g: { calories: 364, protein: 10 }, allergens: ['Gluten'] });
        const ingJalapeno = await Ingredient.create({ name: 'Jalapeno', nutritionPer100g: { calories: 29, protein: 1 }, allergens: [] });

        // 3. Create Products
        const products = [
            // Burgers (3)
            { name: 'Zinger Burger', categoryId: catBurger._id, price: 550, description: 'Crispy chicken fillet with lettuce and mayo', nutrition: { calories: 450, protein: 30 }, allergens: ['Gluten'], salesCount: 150 },
            { name: 'Beef Smash Burger', categoryId: catBurger._id, price: 750, description: 'Double beef patty with melted cheese', nutrition: { calories: 650, protein: 45 }, allergens: ['Gluten', 'Dairy'], salesCount: 120 },
            { name: 'Jalapeno Fire Burger', categoryId: catBurger._id, price: 600, description: 'Spicy chicken burger with jalapenos', nutrition: { calories: 480, protein: 32 }, allergens: ['Gluten'], salesCount: 90 },
            
            // Shawarmas (4)
            { name: 'Classic Chicken Shawarma', categoryId: catShawarma._id, price: 250, description: 'Traditional wrap with garlic sauce', nutrition: { calories: 350, protein: 25 }, allergens: ['Gluten'], salesCount: 200 },
            { name: 'Cheese Blast Shawarma', categoryId: catShawarma._id, price: 350, description: 'Extra cheesy chicken shawarma', nutrition: { calories: 450, protein: 28 }, allergens: ['Gluten', 'Dairy'], salesCount: 180 },
            { name: 'Platter Shawarma', categoryId: catShawarma._id, price: 500, description: 'Deconstructed shawarma with pita and salad', nutrition: { calories: 550, protein: 35 }, allergens: ['Gluten'], salesCount: 80 },
            { name: 'Spicy Mexican Shawarma', categoryId: catShawarma._id, price: 300, description: 'Shawarma with spicy salsa and jalapenos', nutrition: { calories: 370, protein: 24 }, allergens: ['Gluten'], salesCount: 110 },

            // Pizzas (3)
            { name: 'Chicken Tikka Pizza', categoryId: catPizza._id, price: 1200, description: 'Local favorite with spicy chicken tikka', nutrition: { calories: 250, protein: 15 }, allergens: ['Gluten', 'Dairy'], salesCount: 300 },
            { name: 'Pepperoni Feast', categoryId: catPizza._id, price: 1500, description: 'Loaded with beef pepperoni and cheese', nutrition: { calories: 300, protein: 18 }, allergens: ['Gluten', 'Dairy'], salesCount: 250 },
            { name: 'Veggie Supreme', categoryId: catPizza._id, price: 1000, description: 'Garden fresh vegetables and olives', nutrition: { calories: 180, protein: 8 }, allergens: ['Gluten', 'Dairy'], salesCount: 50 }
        ];

        for (const p of products) {
            await Product.create(p);
        }

        console.log("Seed data created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
