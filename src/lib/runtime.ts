/**
 * Runtime URL mapping utility
 * Maps runtime names to their official website URLs
 */

const RUNTIME_URLS: Record<string, string> = {
  'Node.js': 'https://nodejs.org/',
  Python: 'https://www.python.org/',
  Docker: 'https://www.docker.com/',
  // Add more runtimes as needed
}

/**
 * Get the URL for a given runtime
 * @param runtime - The runtime name (e.g., "Node.js", "Python")
 * @returns The URL for the runtime, or undefined if not found
 */
export function getRuntimeUrl(runtime: string): string | undefined {
  return RUNTIME_URLS[runtime]
}

/**
 * Check if a runtime has a URL mapping
 * @param runtime - The runtime name
 * @returns True if the runtime has a URL mapping
 */
export function hasRuntimeUrl(runtime: string): boolean {
  return runtime in RUNTIME_URLS
}
