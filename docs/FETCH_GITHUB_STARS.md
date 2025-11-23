# GitHub Stars Fetcher

This script fetches GitHub star counts for all projects in the manifest files and updates the `githubStars` field.

## Features

- Fetches star counts from GitHub API for all projects with GitHub URLs
- Converts star counts to 'k' format (e.g., 1.5k, 23.4k)
- Handles different JSON structures (direct `githubUrl` field vs nested `communityUrls.github`)
- Supports GitHub authentication to avoid rate limits
- Automatic retry delay to avoid hitting API rate limits

## Prerequisites

```bash
npm install
# or if you only need the built-in Node.js modules, no installation needed
```

## Usage

### Using npm script (Recommended)

#### Without GitHub Token (Rate Limited)
```bash
npm run fetch:github-stars
```

⚠️ **Warning**: Without authentication, you're limited to 60 requests per hour.

#### With GitHub Token (Recommended)
```bash
GITHUB_TOKEN=your_github_token_here npm run fetch:github-stars
```

With authentication, you get 5,000 requests per hour.

### Using Node.js directly

#### Without GitHub Token
```bash
node scripts/fetch/index.mjs github-stars
```

#### With GitHub Token
```bash
GITHUB_TOKEN=your_github_token_here node scripts/fetch/index.mjs github-stars
```

## Getting a GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "acs-stars-fetcher")
4. Select scopes: Only need `public_repo` (or no scopes for public repos)
5. Click "Generate token"
6. Copy the token and use it in the command above

## What It Does

The script processes these files:
- `manifests/terminals.json` (uses `communityUrls.github` field)
- `manifests/extensions.json` (uses `communityUrls.github` field)
- `manifests/ides.json` (uses `communityUrls.github` field)
- `manifests/clis.json` (uses `communityUrls.github` field)
- `manifests/providers.json` (uses `communityUrls.github` field)
- `manifests/vendors.json` (uses `communityUrls.github` field)

For each project:
1. Extracts the GitHub URL
2. Parses owner/repo from the URL
3. Fetches star count from GitHub API
4. Converts to 'k' format (1 decimal place)
5. Updates the `githubStars` field

## Output Format

The `githubStars` field will be populated with numbers in 'k' format:
- `1500` stars → `1.5`
- `23456` stars → `23.5`
- `123` stars → `0.1`

## Example Output

```
🚀 Starting GitHub stars fetcher...

✅ Using GitHub token for authentication

  🔍 Fetching stars for Playwright (microsoft/playwright)...
  ✅ Updated Playwright: 65.3k stars
  🔍 Fetching stars for Context7 (upstash/context7)...
  ✅ Updated Context7: 2.1k stars


==================================================
🎉 All files processed!
==================================================
```

## Error Handling

The script handles:
- ❌ Invalid GitHub URLs
- ❌ Repositories not found (404)
- ❌ Rate limit errors (403)
- ❌ Network errors
- ⏭️ Projects without GitHub URLs (skipped)

## Rate Limiting

The script includes a 1-second delay between requests to avoid hitting rate limits. You can adjust this in the code if needed.

## Notes

- Star counts are rounded to 1 decimal place in 'k' format
- Projects without GitHub URLs are skipped
- The script preserves all other fields in the JSON files
- JSON files are formatted with 2-space indentation
