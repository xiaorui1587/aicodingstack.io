# CLI Manifest Validation & Improvement Report
**Date:** 2025-12-03
**Scope:** All 17 CLI manifests in `manifests/clis/`

---

## Executive Summary

✅ **Schema Validation:** All 17 CLI manifests pass schema validation
⚠️ **i18n Completeness:** 0/17 manifests have German (de) translations
✅ **Updated:** 1/17 manifests updated with latest data (GitHub Copilot CLI)

---

## Critical Findings

### 1. Missing German (de) Translations
**Impact:** VIOLATES project i18n requirements (CLAUDE.md requires EN + ZH-HANS + DE minimum)

**Affected Manifests:** ALL 17 CLI manifests
```
❌ amazon-q-developer-cli.json
❌ amp-cli.json
❌ augment-code-cli.json
❌ claude-code-cli.json
❌ cline-cli.json
❌ codebuddy-cli.json
❌ codex-cli.json
❌ continue-cli.json
❌ droid-cli.json
❌ gemini-cli.json
✅ github-copilot-cli.json (FIXED)
❌ kilo-code-cli.json
❌ kimi-cli.json
❌ kode.json
❌ neovate-code.json
❌ opencode.json
❌ qoder-cli.json
```

**Status:** 16 manifests still need German translations

---

## Completed Updates

### GitHub Copilot CLI (`github-copilot-cli.json`)
**Changes Applied:**
- ✅ Added German (de) translation
- ✅ Updated version: `0.0.334` → `0.0.365`
- ✅ Added Free tier pricing ($0/month)
- ✅ Updated pricing tier names (removed "Copilot" prefix)
- ✅ Verified license: Proprietary (GitHub Pre-release License Terms)
- ✅ Confirmed all URLs and metadata

**Change Summary:**
```diff
+ Free tier: $0/month
  Pro: $10/month (was "Copilot Pro")
  Pro+: $39/month (was "Copilot Pro+")
  Business: $19/user/month (was "Copilot Business")
  Enterprise: Custom pricing

+ German translation added
+ Version updated to 0.0.365
```

---

## Recommended Next Steps

### Phase 1: Add German Translations (HIGH PRIORITY)
**Estimated Time:** 2-3 hours for all 16 manifests

**Approach Options:**

1. **Manual Translation** (Most Accurate)
   - Translate each description manually
   - Ensures cultural appropriateness
   - Time-intensive but highest quality

2. **AI-Assisted Translation** (Recommended)
   - Use AI to generate initial German translations
   - Manual review for accuracy
   - Faster while maintaining quality

3. **Professional Translation Service**
   - Highest quality guarantee
   - Most expensive option
   - Consider for verified products only

**Template for German Translation:**
```json
"translations": {
  "zh-Hans": {
    "description": "现有中文描述"
  },
  "de": {
    "description": "German description here"
  }
}
```

### Phase 2: Version & Data Updates (MEDIUM PRIORITY)
**Manifests Needing Version Checks:**

High-Priority CLIs (active development):
- `claude-code-cli.json` - Check for version updates
- `continue-cli.json` - Verify latest version
- `cline-cli.json` - Version shows "Preview"
- `amazon-q-developer-cli.json` - Check AWS releases

**Verification Method:**
1. Check GitHub releases page
2. Verify npm package version
3. Confirm from official website
4. Update `latestVersion` field

### Phase 3: Enhance Metadata Completeness (LOW PRIORITY)

**Common Missing Fields:**
- `communityUrls.linkedin` - Missing in most manifests
- `communityUrls.discord` - Missing in several
- `resourceUrls.mcp` - Check if CLI tools support MCP

**Enhancement Checklist per Manifest:**
```
□ Verify all community URLs are current
□ Check if MCP support exists (add resourceUrls.mcp)
□ Validate pricing accuracy
□ Confirm license information
□ Check for related products
```

---

## Automation Recommendations

### Using manifest-automation Skill

**For Bulk Updates:**
```bash
# Update specific manifests with latest data
node .claude/skills/manifest-automation/scripts/automate.mjs update cli claude-code-cli
node .claude/skills/manifest-automation/scripts/automate.mjs update cli continue-cli
node .claude/skills/manifest-automation/scripts/automate.mjs update cli amazon-q-developer-cli
```

**Benefits:**
- Automated version checking
- Pricing updates from official sources
- Smart merge preserves manual edits
- 3-attempt retry logic per field
- Comprehensive change reports

**Limitations:**
- Cannot auto-generate German translations (requires manual review)
- May not catch all metadata nuances
- Requires internet access for live data

---

## Quality Metrics

### Current State
| Metric | Status | Count |
|--------|--------|-------|
| Schema Valid | ✅ | 17/17 |
| English Descriptions | ✅ | 17/17 |
| Chinese (zh-Hans) Translations | ✅ | 17/17 |
| German (de) Translations | ❌ | 1/17 |
| Latest Version Verified | ⚠️ | 1/17 |
| Complete Community URLs | ⚠️ | ~8/17 |

### Target State (Recommended)
| Metric | Target | Priority |
|--------|--------|----------|
| Schema Valid | 17/17 | ✅ Done |
| German Translations | 17/17 | 🔴 HIGH |
| Latest Version Verified | 17/17 | 🟡 MEDIUM |
| Complete Community URLs | 15/17 | 🟢 LOW |

---

## Manifest-by-Manifest Analysis

### High-Priority Updates Needed

1. **claude-code-cli.json**
   - ❌ Missing German translation
   - ⚠️ Version may be outdated (check latest)
   - ✅ Well-documented, comprehensive metadata

2. **continue-cli.json**
   - ❌ Missing German translation
   - ⚠️ Verify latest version (1.5.7)
   - ⚠️ Missing community URLs (LinkedIn, Twitter)

3. **amazon-q-developer-cli.json**
   - ❌ Missing German translation
   - ⚠️ Verify latest version (v1.18.1)
   - ⚠️ Install command may be outdated (uses `brew install --cask` for all platforms)

4. **cline-cli.json**
   - ❌ Missing German translation
   - ❌ Version shows "Preview" (need actual version number)
   - ⚠️ Missing GitHub URL

### Medium-Priority Updates

5-10. **amp-cli, augment-code-cli, codebuddy-cli, codex-cli, droid-cli, gemini-cli**
   - Primary issue: Missing German translations
   - Secondary: Verify versions and pricing

### Lower-Priority (Less Active Projects)

11-17. **kilo-code-cli, kimi-cli, kode, neovate-code, opencode, qoder-cli**
   - Add German translations when time permits
   - Verify these projects are still active
   - Consider archiving if abandoned

---

## Implementation Plan

### Week 1: Critical i18n Compliance
- [ ] Add German translations to all 16 remaining manifests
- [ ] Validate all manifests after updates
- [ ] Commit i18n updates

### Week 2: Data Freshness
- [ ] Update top 5 CLI tools (Claude Code, Continue, Amazon Q, Cline, GitHub Copilot)
- [ ] Verify versions from GitHub releases
- [ ] Update pricing from official websites

### Week 3: Metadata Enhancement
- [ ] Fill missing community URLs
- [ ] Add MCP support information where applicable
- [ ] Review and update descriptions for clarity

### Week 4: Verification & Documentation
- [ ] Set `verified: true` for manually verified manifests
- [ ] Document verification process
- [ ] Create maintenance schedule for quarterly updates

---

## Validation Commands

**Check Schema Compliance:**
```bash
node scripts/validate/validate-manifests.mjs
```

**Check i18n Completeness:**
```bash
for file in manifests/clis/*.json; do
  filename=$(basename "$file")
  has_de=$(jq -r '.translations.de // "MISSING"' "$file")
  echo "$filename: DE=$([[ "$has_de" == "MISSING" ]] && echo "❌" || echo "✅")"
done
```

**Check Version Fields:**
```bash
jq -r '.name + ": " + .latestVersion' manifests/clis/*.json | sort
```

---

## Conclusion

The CLI manifests are **schema-compliant** but **critically incomplete** in terms of i18n requirements. The primary focus should be adding German translations to achieve compliance with project requirements as specified in CLAUDE.md.

**Immediate Action Required:**
1. Add German (de) translations to all 16 remaining CLI manifests
2. Update versions for actively developed CLIs (Claude Code, Continue, Cline)
3. Review and enhance metadata completeness

**Success Criteria:**
- ✅ All manifests have EN + ZH-HANS + DE translations
- ✅ Top 10 CLI tools have current version numbers
- ✅ All manifests pass schema validation
- ✅ At least 5 high-priority manifests marked as verified

---

**Report Generated By:** manifest-automation skill
**Next Review:** 2025-03-03 (Quarterly)
