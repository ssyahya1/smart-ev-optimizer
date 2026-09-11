export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }
        console.log("ROLE CHECK:", req.user.role, "ALLOWED:", allowedRoles);

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};