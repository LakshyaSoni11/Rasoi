export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    // Zod 4 uses `issues` instead of `errors`
    const issueList = result.error.issues || [];
    const errorMessages = issueList.map((issue) => issue.message).join(", ");
    return res.status(400).json({ 
      message: `Validation failed: ${errorMessages}`,
      details: issueList 
    });
  }
  next();
};
