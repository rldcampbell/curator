// Extracts the file extension from a URI (e.g., "jpg")
// Handles query params like ?token=abc and falls back to "jpg" if none found
export const getFileExtension = (uri: string): string => {
  try {
    const lastPart = uri.split(".").pop()
    return lastPart?.split("?")[0] || "jpg"
  } catch {
    return "jpg"
  }
}
