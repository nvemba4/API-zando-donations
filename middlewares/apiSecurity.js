const apiSecurityMiddleware = (allowedMethods = ["POST"]) => {
    return (req, res, next) => {
        // 1. Handle CORS preflight requests (OPTIONS)
        if (req.method === "OPTIONS") {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "));
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            return res.status(204).send("");
        }

        // 2. Method Validation
        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({
                error: `Only ${allowedMethods.join(", ")} requests allowed`,
                allowedMethods,
                secureToken: false
            });
        }

        // 3. Continue to next middleware if validation passes
        next();
    };
};

module.exports = apiSecurityMiddleware;