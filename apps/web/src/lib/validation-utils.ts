interface ValidationError {
  field: string;
  message: string;
}

export const formatValidationErrors = (
  validationErrors: ValidationError[]
): Record<string, string[]> => {
  return validationErrors.reduce(
    (acc: Record<string, string[]>, curr: ValidationError) => {
      if (!acc[curr.field]) {
        acc[curr.field] = [];
      }
      acc[curr.field].push(curr.message);
      return acc;
    },
    {}
  );
};
