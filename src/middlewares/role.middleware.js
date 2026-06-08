const { ApiError } = require('../utils/ApiError');

const authorizeRoles = (...roles) => {
    return (req, _, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, `Role: ${req.user.role} is not allowed to access this resource`);
        }
        next();
    };
};

module.exports = { authorizeRoles };
