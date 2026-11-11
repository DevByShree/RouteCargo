export function handleValidation(req, res, next) {
  // Validation errors are attached by express-validator.
  import("express-validator").then(({ validationResult }) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ message: "Validation failed.", errors: result.array() });
    }
    next();
  }).catch(next);
}
