const Groq = require('groq-sdk');
const Product = require('../models/product.model');
const { ApiError } = require('../utils/ApiError');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

class AIService {
    /**
     * Get AI recommendations based on RAG
     * @param {string} userQuery - The question or preference from user
     * @returns {Promise<string>} - AI generated recommendation
     */
    static async getAISuggestion(userQuery) {
        try {
            // 1. Retrieval: Fetch all products with relevant details
            const products = await Product.find({ isAvailable: true }).populate('categoryId', 'name');
            
            // 2. Context Building: Convert product data to a string context for AI
            const productContext = products.map(p => {
                const categoryName = p.categoryId ? p.categoryId.name : 'General';
                return `Name: ${p.name}, Category: ${categoryName}, Price: ${p.price}, Description: ${p.description}, Calories: ${p.nutrition.calories}, Protein: ${p.nutrition.protein}, Allergens: ${p.allergens.join(', ')}, Popularity: ${p.salesCount} sales.`;
            }).join('\n');

            // 3. Prompt Engineering
            const systemPrompt = `
                You are "Smart Bite AI", a helpful food recommendation expert for a restaurant called "Smart Bite".
                Your goal is to suggest the best food item from our menu based on the user's query.
                
                Guidelines:
                - Use the provided context to answer. Do NOT suggest items not in the list.
                - Be friendly, professional, and helpful.
                - If the user asks for something trending or popular, look at the 'salesCount'.
                - Mention why you are recommending a specific item (e.g., ingredients, price, or health benefits).
                - Use a conversational tone.
                - You can speak in English or Roman Urdu if the user asks in it.

                Our Menu Context:
                ${productContext}
            `;

            // 4. Generation: Call Groq API
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userQuery }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.5,
                max_tokens: 300
            });

            return chatCompletion.choices[0].message.content;

        } catch (error) {
            console.error("Groq AI Error:", error);
            throw new ApiError(500, "AI Recommendation failed. Please try again later.");
        }
    }
}

module.exports = AIService;
