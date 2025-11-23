---
name: manifest-creator
description: Create manifest files for AI coding tools by extracting information from their websites
---

# Manifest Creator Skill

Automatically create manifest JSON files for AI coding tools, models, providers, and vendors by intelligently extracting information from their websites.

## Overview

This skill automates the creation of manifest files in the `manifests/` directory. It uses web scraping and AI to extract structured information from product websites, following the project's JSON schema requirements.

## Usage

To create a new manifest, provide:

1. **Manifest type**: cli, extension, ide, model, provider, or vendor
2. **Product name**: The filename to create (without .json extension)
3. **Website URL**: The official website URL (becomes the `websiteUrl` field)

**Example:**

```
Create a manifest for:
- Type: cli
- Name: copilot-cli
- URL: https://github.com/github/copilot-cli
```

## How It Works

The skill follows this workflow:

### 1. Schema Validation

First, it identifies the correct JSON schema based on the manifest type:

- `cli` → `manifests/schemas/clis.schema.json`
- `extension` → `manifests/schemas/extensions.schema.json`
- `ide` → `manifests/schemas/ides.schema.json`
- `model` → `manifests/schemas/models.schema.json`
- `provider` → `manifests/schemas/providers.schema.json`
- `vendor` → `manifests/schemas/vendors.schema.json`

### 2. Web Content Extraction

The skill uses the WebFetch tool to:

- Visit the provided website URL
- Extract text content and structure
- Identify key information (description, version, pricing, etc.)
- Follow relevant links to find additional details

**Important Rules:**

- The `description` field MUST be summarized from actual website content
- Never generate descriptions - always extract from the source
- If information isn't found on the main page, the skill will explore subpages

### 3. Platform URL Discovery

For models and providers, the skill will search for third-party platform URLs:

- **HuggingFace**: Search for model/org pages on huggingface.co
- **Artificial Analysis**: Search for performance benchmarks
- **OpenRouter**: Search for model availability

Each platform URL is discovered using the WebSearch tool.

### 4. Manifest Generation

The skill creates a complete JSON manifest file with:

- All required fields from the schema
- Properly formatted URLs (HTTPS only)
- Validated structure
- Appropriate null values for unavailable fields

### 5. File Output

The manifest is written to: `manifests/<type>/<name>.json`

### 6. Validation

After creating the manifest file, the skill **MUST** run validation:

```bash
node scripts/validate-manifests.mjs
```

This validation script will:
- Check schema compliance
- Verify all required fields are present
- Validate field formats (URLs, enums, etc.)
- Ensure filename matches the `id` field
- Report any errors with detailed messages

**If validation fails**, the errors must be fixed before completing the task.

## Supported Manifest Types

### CLI Tools

**Schema**: Extends app.schema.json (product → vendor-entity → entity)

**Key Fields**:
- Basic: id, name, description, websiteUrl, docsUrl
- Vendor: vendor
- Product: latestVersion, githubUrl, license, pricing, resourceUrls, communityUrls, relatedProducts
- App: platforms (macOS, Windows, Linux with install/launch commands)

**Example**: `manifests/clis/claude-code.json`

### Extensions

**Schema**: Extends product.schema.json + supportedIdes

**Key Fields**:
- Same as CLI (except platforms)
- Additional: supportedIdes (array with ideId, marketplaceUrl, installUri)

**Example**: `manifests/extensions/claude-code.json`

### IDEs

**Schema**: Extends app.schema.json (same as CLI)

**Key Fields**:
- Identical to CLI structure
- Focuses on IDE-specific features

**Example**: `manifests/ides/cursor.json`

### Models

**Schema**: Extends vendor-entity.schema.json

**Key Fields**:
- Basic: id, name, description, websiteUrl, docsUrl, vendor
- Model-specific: size, totalContext, maxOutput, tokenPricing (input, output, cache)
- platformUrls: huggingface, artificialAnalysis, openrouter

**Example**: `manifests/models/claude-sonnet-4-5.json`

### Providers

**Schema**: Extends vendor-entity.schema.json

**Key Fields**:
- Basic: id, name, description, websiteUrl, docsUrl, vendor
- Provider-specific: type (foundation-model-provider | model-service-provider), applyKeyUrl
- platformUrls, communityUrls

**Example**: `manifests/providers/openrouter.json`

### Vendors

**Schema**: Extends entity.schema.json

**Key Fields**:
- Basic: id, name, description, websiteUrl, docsUrl
- Additional: communityUrls

**Example**: `manifests/vendors/anthropic.json`

## Field Extraction Guidelines

### Description Field

**CRITICAL**: Never generate descriptions. Always extract from website content.

- Must be concise (max 200 characters)
- Summarize the product's key features
- Use content from the homepage or about page
- Keep original tone and terminology

### URLs

All URLs must:
- Use HTTPS protocol
- Be valid and accessible
- Match schema patterns (e.g., GitHub URLs must start with `https://github.com/`)

### Pricing

For products (CLI, IDE, Extension):
- Extract actual pricing tiers
- Include: name, value (number or null), currency, per (billing period), category
- Use null for custom/enterprise pricing

For models:
- Extract token pricing ($/M tokens)
- Include: input, output, cache (null if not applicable)

### Platform URLs

Use WebSearch to find:
- HuggingFace: Model or organization page
- Artificial Analysis: Benchmark/comparison page
- OpenRouter: Model availability page

Set to null if not found.

### Community URLs

Search for official social media presence:
- LinkedIn (company page)
- Twitter/X
- GitHub (organization)
- YouTube (channel)
- Discord (server invite)
- Reddit (official subreddit)
- Blog (official blog)

Set to null if not found.

## Workflow Example

**User Request:**
```
Create a manifest for the Cursor IDE
URL: https://cursor.sh
```

**Skill Actions:**

1. Identify schema: `manifests/schemas/ides.schema.json`
2. Fetch main page: Extract name, description, key features
3. Search for documentation: Find docs URL
4. Search for GitHub: Find repository URL
5. Extract version: Check for latest release
6. Find pricing: Navigate to pricing page
7. Gather community URLs: Search for social media links
8. Generate manifest: Create `manifests/ides/cursor.json`
9. **Run validation**: `node scripts/validate-manifests.mjs`
10. Fix any validation errors if found

## File Structure

```
.claude/skills/manifest-creator/
├── SKILL.md              # This documentation
└── scripts/
    └── create.mjs        # Main creation script
```

## Important Notes

1. **Never Auto-Generate Content**: Always extract from actual website sources
2. **Verify URLs**: All URLs should be tested for accessibility
3. **Follow Schema**: Strictly adhere to the JSON schema for each type
4. **Use Null Appropriately**: Set unavailable fields to null (not empty string)
5. **ID Format**: Always use lowercase-with-hyphens (e.g., `claude-code`, not `Claude Code`)
6. **Verified Field**: Default to `false` unless explicitly verified by maintainers
7. **ALWAYS Validate**: Run `node scripts/validate-manifests.mjs` after creating any manifest file

## Error Handling

If the skill cannot find required information:
- Ask the user for manual input
- Suggest alternative URLs to search
- Provide partial manifest for user completion
- Log missing fields clearly

## Contributing

When improving this skill:
- Update schema mappings if new manifest types are added
- Enhance web scraping patterns for better extraction
- Add more platform URL sources
- Improve description summarization

## License

This skill is part of the AI Coding Stack project and follows the project's license.
