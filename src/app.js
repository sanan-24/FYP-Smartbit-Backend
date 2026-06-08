const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middlewares/error.middleware');


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
// app.use(express.static("public"));
app.use(cookieParser());

// Routes import
const authRouter = require('./routes/auth.routes');
const profileRouter = require('./routes/profile.routes');
const categoryRouter = require('./routes/category.routes');
const productRouter = require('./routes/product.routes');
const ingredientRouter = require('./routes/ingredient.routes');
const recommendationRouter = require('./routes/recommendation.routes');
const orderRouter = require('./routes/order.routes');
const riderRouter = require('./routes/rider.routes');
const userRouter = require('./routes/user.routes');
const dashboardRouter = require('./routes/dashboard.routes');
const aiRouter = require('./routes/ai.routes');
const paymentRouter = require('./routes/payment.routes');
const reviewRouter = require('./routes/review.routes');
const favoriteRouter = require('./routes/favorite.routes');

// Routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/ingredients", ingredientRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/riders", riderRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", dashboardRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/favorites", favoriteRouter);

// Error handler middleware
app.use(errorHandler);

module.exports = app;
