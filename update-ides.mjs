#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// IDE updates: versions and German translations
const updates = {
  cursor: {
    version: '2.1.46',
    de: 'Ein KI-gestützter Code-Editor auf Basis von VS Code mit erweiterten KI-Funktionen für Code-Generierung, -Bearbeitung und -Verständnis.',
  },
  windsurf: {
    version: '1.12.33',
    de: 'Eine KI-native IDE mit dem "Cascade"-Assistenten, der autonom Code generiert, bearbeitet, testet und bereitstellt. Integriert MCP-Server und Plugin-Hooks für den Entwickler-Flow.',
  },
  vscode: {
    version: '1.106',
    de: 'Ein kostenloser, quelloffener Code-Editor mit umfangreicher Sprachunterstützung und einem Ökosystem von Erweiterungen (inkl. KI-Agenten wie GitHub Copilot) für Bearbeitung, Debugging und Versionskontrolle.',
  },
  zed: {
    version: '0.140.0',
    de: 'Ein hochleistungsfähiger, kollaborativer Code-Editor mit eingebauter KI-Unterstützung, geschrieben in Rust. Bietet Echtzeit-Zusammenarbeit und integrierte Terminalbefehle.',
  },
  'intellij-idea': {
    version: '2024.3',
    de: 'JetBrains führende Java-IDE mit intelligenter Code-Vervollständigung, Refactoring-Tools und integrierter KI-Unterstützung durch JetBrains AI Assistant.',
  },
  kiro: {
    version: '1.0',
    de: 'Eine KI-gestützte IDE mit Fokus auf natürlichsprachliche Programmierung und intelligente Code-Generierung für schnellere Entwicklung.',
  },
  antigravity: {
    version: '1.11.5',
    de: 'Eine moderne IDE mit KI-gestützten Entwicklungstools und intelligenten Code-Vorschlägen für produktive Programmierung.',
  },
  codebuddy: {
    version: '1.0.0',
    de: 'Eine KI-gestützte Entwicklungsumgebung mit intelligentem Code-Assistenten für Entwicklungsworkflows und Debugging.',
  },
  codeflicker: {
    version: '0.2.0',
    de: 'Eine leichtgewichtige IDE mit KI-Integration für schnelles Prototyping und agile Entwicklung.',
  },
  qoder: {
    version: 'Latest',
    de: 'Eine intelligente IDE mit KI-gestützter Code-Vervollständigung, Debugging und Projektmanagement-Funktionen.',
  },
  trae: {
    version: '2.7.1',
    de: 'Eine spezialisierte IDE mit KI-Features für moderne Entwicklungsworkflows und Team-Zusammenarbeit.',
  },
}

const idesDir = path.join(__dirname, 'manifests/ides')
const files = await fs.readdir(idesDir)

let updated = 0
let versionUpdates = 0
let translationAdded = 0

for (const file of files) {
  if (!file.endsWith('.json')) continue

  const ideId = file.replace('.json', '')
  const filePath = path.join(idesDir, file)

  if (!updates[ideId]) {
    console.log(`⚠️  ${file} - no update data available`)
    continue
  }

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const manifest = JSON.parse(content)

    let changed = false

    // Update version if different
    if (updates[ideId].version && manifest.latestVersion !== updates[ideId].version) {
      console.log(
        `📦 ${file} - updating version: ${manifest.latestVersion} → ${updates[ideId].version}`
      )
      manifest.latestVersion = updates[ideId].version
      versionUpdates++
      changed = true
    }

    // Add German translation if missing
    if (!manifest.translations?.de && updates[ideId].de) {
      if (!manifest.translations) {
        manifest.translations = {}
      }
      manifest.translations.de = {
        description: updates[ideId].de,
      }
      console.log(`🌐 ${file} - added German translation`)
      translationAdded++
      changed = true
    } else if (manifest.translations?.de) {
      console.log(`✅ ${file} - already has German translation`)
    }

    if (changed) {
      await fs.writeFile(filePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')
      updated++
    }
  } catch (error) {
    console.error(`❌ ${file} - error: ${error.message}`)
  }
}

console.log(`\n📊 Summary:`)
console.log(`   Files updated: ${updated}`)
console.log(`   Version updates: ${versionUpdates}`)
console.log(`   Translations added: ${translationAdded}`)
console.log(`   Total IDEs: ${files.filter(f => f.endsWith('.json')).length}`)
