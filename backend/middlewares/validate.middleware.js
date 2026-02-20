export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    try {
      const data = req[property];
      schema.parse(data);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          details: error.errors
        }
      });
    }
  };
};