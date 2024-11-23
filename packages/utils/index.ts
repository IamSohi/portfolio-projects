import { logger } from "./logger";
import { createResponse } from "./response";

// Utility functions shared across projects
function calculateDiff(oldText: string, newText: string): string {
    // Implement diff calculation logic (e.g., using a diff library)
    // ...
    return ""; // Placeholder - return actual diff
}

export { logger, createResponse, calculateDiff }; // Export the logger and createResponse utilities
