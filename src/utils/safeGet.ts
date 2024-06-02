/**
 * Safely retrieves a value from an object based on a given path.
 * If the value is not found, a default value can be provided.
 * If path is not provided, the default value is returned.
 *
 * @param obj - The object to retrieve the value from.
 * @param path - The path to the value, using dot notation (e.g., "property.subproperty").
 * @param defaultValue - The default value to return if the value is not found.
 * @returns The value at the specified path, or the default value if not found.
 */
export function safeGet(obj: any, path?: string | null, defaultValue?: any) {
  if (!path) return defaultValue;
  return (
    path
      .split(".")
      .reduce(
        (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
        obj
      ) ?? defaultValue
  );
}
