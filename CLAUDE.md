# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Coding Stack is a comprehensive directory and metadata repository for the AI coding ecosystem. The project serves two purposes:
1. A public website at aicodingstack.io for discovering and comparing AI coding tools
2. A community-maintained metadata repository containing curated information about coding tools, models, and platforms

## Metadata Architecture

The core of this project is the `manifests/` directory containing JSON files that define metadata for various coding tools:

### Manifest Files Structure

Each manifest file follows a consistent schema pattern:

**ides.json** - Integrated Development Environments
- Fields: `name`, `id`, `vendor`, `description`, `websiteUrl`, `docsUrl`, `latestVersion`
- Examples: Visual Studio Code, Cursor, TRAE

**clis.json** - Command-line AI coding assistants
- Fields: `name`, `id`, `vendor`, `description`, `websiteUrl`, `docsUrl`, `latestVersion`
- Examples: Codex, Claude Code

**models.json** - Large Language Models for coding
- Fields: `name`, `vendor`, `id`, `size`, `totalContext`, `maxOutput`, `pricing`, `urls` (object containing `website`, `huggingface`, `artificialAnalysis`, `openrouter`)
- Examples: Kimi K2 0905, DeepSeek V3.1, GLM 4.5, Qwen3 Coder

**providers.json** - LLM API Providers
- Fields: `name`, `id`, `description`, `websiteUrl`, `docsUrl`
- Examples: DeepSeek, Moonshot, SiliconFlow, OpenRouter, Z.ai

## Development Commands

Currently, there are no build commands configured. The project is in early stages with only manifest data files.

## Contributing to Metadata

When adding or updating entries in manifest files:
1. Maintain the JSON format
2. Follow the exact field schema for each manifest type
3. Verify URLs are accessible before committing
4. Use consistent naming conventions (official product names)
5. Keep `id` values lowercase with hyphens for multi-word names

## Development Server

**IMPORTANT:** Do not start the development server (`npm run dev`) on your own. The user will start it manually when needed.

## Git Workflow

**IMPORTANT:** Do not autonomously create git commits unless explicitly requested by the user. Always ask the user before committing changes. The user prefers to review and commit changes manually.
