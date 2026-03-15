const { clerkMiddleware, requireAuth } = require('@clerk/express');

// Clerk middleware initializer — call once in app setup
const initClerk = clerkMiddleware();

// Route-level auth guard
const protect = requireAuth();

module.exports = { initClerk, protect };
