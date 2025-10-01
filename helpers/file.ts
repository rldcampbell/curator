import * as FileSystem from "expo-file-system/legacy"

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

export const safeDeleteFile = async (uri: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true })
    return true // deleted or didn’t exist
  } catch (e: any) {
    // swallow — not worth crashing UX over a cleanup miss
    console.warn("[FS] delete failed:", uri, e?.message ?? e)
    return false
  }
}
