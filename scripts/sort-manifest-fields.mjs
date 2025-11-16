#!/usr/bin/env node

/**
 * Sort fields in manifest JSON files according to their schema definitions
 * This script reads each manifest file and its corresponding schema,
 * then reorders the fields in the manifest to match the schema's property order.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MANIFESTS_DIR = path.join(ROOT_DIR, 'manifests');
const SCHEMAS_DIR = path.join(MANIFESTS_DIR, 'schemas');

// Cache for loaded schemas to avoid redundant reads
const schemaCache = new Map();

/**
 * Load and parse a JSON file
 */
async function loadJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Resolve a $ref path to an absolute file path
 */
function resolveRefPath(refPath, baseSchemaPath) {
  if (refPath.startsWith('#/')) {
    // Internal reference within the same schema
    return null;
  }
  
  const schemaDir = path.dirname(baseSchemaPath);
  return path.resolve(schemaDir, refPath);
}

/**
 * Extract property order from a schema definition
 * Returns an array of property names in the order they appear in the schema
 */
async function extractPropertyOrder(schema, schemaPath) {
  const propertyOrder = [];
  
  // Handle $ref at the root level
  if (schema.$ref) {
    const refPath = resolveRefPath(schema.$ref, schemaPath);
    if (refPath) {
      const refSchema = await loadSchema(refPath);
      const refOrder = await extractPropertyOrder(refSchema, refPath);
      propertyOrder.push(...refOrder);
    }
  }
  
  // Handle allOf - merge properties from all schemas
  if (schema.allOf) {
    for (const subSchema of schema.allOf) {
      const subOrder = await extractPropertyOrder(subSchema, schemaPath);
      propertyOrder.push(...subOrder);
    }
  }
  
  // Handle properties directly defined in this schema
  if (schema.properties) {
    for (const propName of Object.keys(schema.properties)) {
      if (!propertyOrder.includes(propName)) {
        propertyOrder.push(propName);
      }
    }
  }
  
  return propertyOrder;
}

/**
 * Load a schema file with caching
 */
async function loadSchema(schemaPath) {
  if (schemaCache.has(schemaPath)) {
    return schemaCache.get(schemaPath);
  }
  
  const schema = await loadJSON(schemaPath);
  schemaCache.set(schemaPath, schema);
  return schema;
}

/**
 * Get property order for nested objects from schema
 */
async function getNestedPropertyOrder(schema, propName, schemaPath) {
  if (!schema.properties || !schema.properties[propName]) {
    return null;
  }
  
  const propSchema = schema.properties[propName];
  
  // Handle $ref
  if (propSchema.$ref) {
    const refPath = resolveRefPath(propSchema.$ref, schemaPath);
    if (refPath) {
      const refSchema = await loadSchema(refPath);
      return await extractPropertyOrder(refSchema, refPath);
    }
  }
  
  // Handle direct properties
  if (propSchema.properties) {
    return Object.keys(propSchema.properties);
  }
  
  return null;
}

/**
 * Find all nested property orders from a schema
 */
async function findAllNestedOrders(schema, schemaPath, parentPath = []) {
  const nestedOrders = new Map();
  
  // Handle allOf
  if (schema.allOf) {
    for (const subSchema of schema.allOf) {
      const subOrders = await findAllNestedOrders(subSchema, schemaPath, parentPath);
      for (const [key, value] of subOrders) {
        nestedOrders.set(key, value);
      }
    }
  }
  
  // Handle properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const currentPath = [...parentPath, propName].join('.');
      
      // Handle $ref
      if (propSchema.$ref) {
        const refPath = resolveRefPath(propSchema.$ref, schemaPath);
        if (refPath) {
          const refSchema = await loadSchema(refPath);
          const order = await extractPropertyOrder(refSchema, refPath);
          if (order.length > 0) {
            nestedOrders.set(currentPath, order);
          }
          
          // Recursively find nested orders in the referenced schema
          const refNestedOrders = await findAllNestedOrders(refSchema, refPath, []);
          for (const [nestedPath, nestedOrder] of refNestedOrders) {
            nestedOrders.set(`${currentPath}.${nestedPath}`, nestedOrder);
          }
        }
      }
      
      // Handle direct object properties
      if (propSchema.properties) {
        const order = Object.keys(propSchema.properties);
        nestedOrders.set(currentPath, order);
        
        // Recursively handle nested objects
        const deepOrders = await findAllNestedOrders(propSchema, schemaPath, [...parentPath, propName]);
        for (const [key, value] of deepOrders) {
          nestedOrders.set(key, value);
        }
      }
      
      // Handle array items
      if (propSchema.items) {
        const itemsPath = `${currentPath}.items`;
        if (propSchema.items.$ref) {
          const refPath = resolveRefPath(propSchema.items.$ref, schemaPath);
          if (refPath) {
            const refSchema = await loadSchema(refPath);
            const order = await extractPropertyOrder(refSchema, refPath);
            if (order.length > 0) {
              nestedOrders.set(itemsPath, order);
            }
            
            const refNestedOrders = await findAllNestedOrders(refSchema, refPath, []);
            for (const [nestedPath, nestedOrder] of refNestedOrders) {
              nestedOrders.set(`${itemsPath}.${nestedPath}`, nestedOrder);
            }
          }
        } else if (propSchema.items.properties) {
          const order = Object.keys(propSchema.items.properties);
          nestedOrders.set(itemsPath, order);
        }
      }
    }
  }
  
  // Handle $defs (internal definitions)
  if (schema.$defs) {
    for (const [defName, defSchema] of Object.entries(schema.$defs)) {
      if (defSchema.properties) {
        const order = Object.keys(defSchema.properties);
        nestedOrders.set(`$defs.${defName}`, order);
        
        // Recursively handle nested objects in definitions
        const deepOrders = await findAllNestedOrders(defSchema, schemaPath, ['$defs', defName]);
        for (const [key, value] of deepOrders) {
          nestedOrders.set(key, value);
        }
      }
    }
  }
  
  return nestedOrders;
}

/**
 * Sort object keys according to a specified order
 */
function sortObjectKeys(obj, keyOrder) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  
  const sorted = {};
  const objKeys = Object.keys(obj);
  
  // First, add keys in the specified order
  for (const key of keyOrder) {
    if (key in obj) {
      sorted[key] = obj[key];
    }
  }
  
  // Then, add any remaining keys that weren't in the order
  for (const key of objKeys) {
    if (!(key in sorted)) {
      sorted[key] = obj[key];
    }
  }
  
  return sorted;
}

/**
 * Recursively sort all nested objects in a data structure
 */
function sortNestedObjects(data, nestedOrders, path = []) {
  if (Array.isArray(data)) {
    return data.map((item, index) => sortNestedObjects(item, nestedOrders, path));
  }
  
  if (data && typeof data === 'object') {
    // Get the order for the current path
    const currentPath = path.join('.');
    const order = nestedOrders.get(currentPath);
    
    // Sort current level
    const sorted = order ? sortObjectKeys(data, order) : { ...data };
    
    // Recursively sort nested objects
    for (const [key, value] of Object.entries(sorted)) {
      sorted[key] = sortNestedObjects(value, nestedOrders, [...path, key]);
    }
    
    return sorted;
  }
  
  return data;
}

/**
 * Process a single manifest file
 */
async function processManifest(manifestName) {
  const manifestPath = path.join(MANIFESTS_DIR, manifestName);
  const schemaPath = path.join(SCHEMAS_DIR, manifestName.replace('.json', '.schema.json'));
  
  console.log(`\nProcessing ${manifestName}...`);
  
  // Check if schema exists
  try {
    await fs.access(schemaPath);
  } catch {
    console.log(`  ⚠️  Schema not found: ${schemaPath}`);
    return;
  }
  
  // Load manifest and schema
  const manifest = await loadJSON(manifestPath);
  const schema = await loadSchema(schemaPath);
  
  // Extract property order from schema
  let itemSchema = schema;
  if (schema.type === 'array' && schema.items) {
    itemSchema = schema.items;
  }
  
  const propertyOrder = await extractPropertyOrder(itemSchema, schemaPath);
  console.log(`  📋 Top-level field order: ${propertyOrder.join(', ')}`);
  
  // Find all nested property orders
  const nestedOrders = await findAllNestedOrders(itemSchema, schemaPath, []);
  console.log(`  📦 Found ${nestedOrders.size} nested object schemas`);
  
  // Sort the manifest data
  let sortedManifest;
  if (Array.isArray(manifest)) {
    sortedManifest = manifest.map(item => {
      const sorted = sortObjectKeys(item, propertyOrder);
      return sortNestedObjects(sorted, nestedOrders, []);
    });
  } else {
    sortedManifest = sortObjectKeys(manifest, propertyOrder);
    sortedManifest = sortNestedObjects(sortedManifest, nestedOrders, []);
  }
  
  // Write back to file
  const jsonContent = JSON.stringify(sortedManifest, null, 2) + '\n';
  await fs.writeFile(manifestPath, jsonContent, 'utf-8');
  
  console.log(`  ✅ Sorted and saved`);
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Sorting manifest fields according to schemas...\n');
  
  // List of manifest files to process
  const manifestFiles = [
    'vendors.json',
    'providers.json',
    'models.json',
    'ides.json',
    'extensions.json',
    'clis.json',
    'collections.json'
  ];
  
  for (const manifestFile of manifestFiles) {
    try {
      await processManifest(manifestFile);
    } catch (error) {
      console.error(`  ❌ Error processing ${manifestFile}:`, error.message);
    }
  }
  
  console.log('\n✨ Done!');
}

main().catch(console.error);

