import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GitHub API token (optional but recommended to avoid rate limits)
// Set via environment variable: GITHUB_TOKEN=your_token_here node fetch-github-stars.mjs
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Directories configuration - now pointing to individual file directories
const dirsConfig = [
  {
    directory: 'manifests/extensions',
    githubUrlField: 'communityUrls.github',
    type: 'nested'
  },
  {
    directory: 'manifests/ides',
    githubUrlField: 'communityUrls.github',
    type: 'nested'
  },
  {
    directory: 'manifests/clis',
    githubUrlField: 'communityUrls.github',
    type: 'nested'
  }
];

// Extract owner and repo from GitHub URL
function parseGithubUrl(url) {
  if (!url) return null;
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2]
  };
}

// Fetch stars from GitHub API
function fetchStars(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}`,
      method: 'GET',
      headers: {
        'User-Agent': 'acs-stars-fetcher',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const stars = json.stargazers_count;
            // Convert to k format (1 decimal place)
            const starsInK = parseFloat((stars / 1000).toFixed(1));
            resolve(starsInK);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else if (res.statusCode === 403) {
          reject(new Error('Rate limit exceeded. Please set GITHUB_TOKEN environment variable.'));
        } else if (res.statusCode === 404) {
          reject(new Error('Repository not found'));
        } else {
          reject(new Error(`GitHub API returned status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Get GitHub URL from item based on type
function getGithubUrl(item, type) {
  if (type === 'direct') {
    return item.githubUrl;
  } else {
    return item.communityUrls?.github;
  }
}

// Sleep function to avoid rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process a single JSON file
async function processFile(filePath, fileName, type) {
  const content = fs.readFileSync(filePath, 'utf8');
  const item = JSON.parse(content);

  const githubUrl = getGithubUrl(item, type);

  if (!githubUrl) {
    console.log(`  ⏭️  Skipping ${item.name || item.id} (no GitHub URL)`);
    return { updated: false, skipped: true, error: false };
  }

  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) {
    console.log(`  ❌ Failed to parse GitHub URL for ${item.name || item.id}: ${githubUrl}`);
    return { updated: false, skipped: false, error: true };
  }

  try {
    console.log(`  🔍 Fetching stars for ${item.name || item.id} (${parsed.owner}/${parsed.repo})...`);
    const stars = await fetchStars(parsed.owner, parsed.repo);
    item.githubStars = stars;

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(item, null, 2) + '\n', 'utf8');
    console.log(`  ✅ Updated ${item.name || item.id}: ${stars}k stars`);

    // Sleep for 1 second to avoid rate limiting
    await sleep(1000);
    return { updated: true, skipped: false, error: false };
  } catch (error) {
    console.log(`  ❌ Error fetching ${item.name || item.id}: ${error.message}`);
    return { updated: false, skipped: false, error: true };
  }
}

// Process all files in a directory
async function processDirectory(dirConfig) {
  const dirPath = path.join(__dirname, '..', dirConfig.directory);
  console.log(`\n📁 Processing ${dirConfig.directory}...`);

  if (!fs.existsSync(dirPath)) {
    console.log(`  ⚠️  Directory not found: ${dirPath}`);
    return;
  }

  // Get all JSON files in the directory
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    console.log(`  ⚠️  No JSON files found in ${dirConfig.directory}`);
    return;
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const result = await processFile(filePath, file, dirConfig.type);

    if (result.updated) updated++;
    if (result.skipped) skipped++;
    if (result.error) errors++;
  }

  console.log(`\n✨ ${dirConfig.directory} completed: ${updated} updated, ${skipped} skipped, ${errors} errors`);
}

// Main function
async function main() {
  console.log('🚀 Starting GitHub stars fetcher...\n');
  console.log('📝 Note: Now processing individual JSON files in directories\n');

  if (!GITHUB_TOKEN) {
    console.log('⚠️  Warning: No GITHUB_TOKEN set. You may hit rate limits (60 requests/hour).');
    console.log('   Set it with: GITHUB_TOKEN=your_token node fetch-github-stars.mjs\n');
  } else {
    console.log('✅ Using GitHub token for authentication\n');
  }

  for (const dirConfig of dirsConfig) {
    try {
      await processDirectory(dirConfig);
    } catch (error) {
      console.error(`❌ Failed to process ${dirConfig.directory}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 All directories processed!');
  console.log('='.repeat(50));
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
