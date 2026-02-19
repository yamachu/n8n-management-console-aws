export const stringIsNullOrEmpty = (
  str: string | null | undefined,
): boolean => {
  return str === null || str === undefined || str.trim() === "";
};
