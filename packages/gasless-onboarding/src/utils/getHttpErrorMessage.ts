const DEFAULT_INTERNAL_ERROR_MESSAGE = "Internal Error";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getHttpErrorMessage = (error: any) => {
  return (
    error.response?.data?.message ??
    error.message ??
    DEFAULT_INTERNAL_ERROR_MESSAGE
  );
};
