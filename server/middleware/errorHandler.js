const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error("🔴 Error:", {
    name: err.name,
    message: err.message,
    code: err.code,
    path: req.path,
    method: req.method,
    body: req.body,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle different types of errors
  switch (err.name) {
    case 'ValidationError':
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      });

    case 'MongoServerError':
      if (err.code === 11000) {
        return res.status(400).json({
          error: "Duplicate Error",
          details: {
            field: Object.keys(err.keyPattern)[0],
            message: `This ${Object.keys(err.keyPattern)[0]} is already taken`
          }
        });
      }
      break;

    case 'JsonWebTokenError':
    case 'TokenExpiredError':
      return res.status(401).json({
        error: "Authentication Error",
        message: "Invalid or expired token"
      });

    case 'CastError':
      return res.status(400).json({
        error: "Invalid ID",
        message: "The provided ID is not valid"
      });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : "An unexpected error occurred"
  });
};

module.exports = errorHandler;