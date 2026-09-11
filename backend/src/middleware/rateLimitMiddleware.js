import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
    message: "Too many login attempts. Please try again later."
}
});
export { loginLimiter };