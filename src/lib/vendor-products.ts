import {
  idesData,
  clisData,
  extensionsData,
  modelsData,
  providersData
} from './generated';

export interface VendorProduct {
  id: string;
  name: string;
  category: 'ide' | 'cli' | 'extension' | 'model' | 'provider';
  categoryLabel: string;
  path: string;
}

/**
 * Get all products associated with a vendor
 * @param vendorName - The name of the vendor (case-insensitive)
 * @returns Array of products from this vendor
 */
export function getProductsByVendor(vendorName: string): VendorProduct[] {
  const normalizedVendorName = vendorName.toLowerCase();
  const products: VendorProduct[] = [];

  // IDEs
  idesData.forEach((ide) => {
    if (ide.vendor?.toLowerCase() === normalizedVendorName) {
      products.push({
        id: ide.id,
        name: ide.name,
        category: 'ide',
        categoryLabel: 'IDE',
        path: `ides/${ide.id}`,
      });
    }
  });

  // CLIs
  clisData.forEach((cli) => {
    if (cli.vendor?.toLowerCase() === normalizedVendorName) {
      products.push({
        id: cli.id,
        name: cli.name,
        category: 'cli',
        categoryLabel: 'CLI',
        path: `clis/${cli.id}`,
      });
    }
  });

  // Extensions
  extensionsData.forEach((ext) => {
    if (ext.vendor?.toLowerCase() === normalizedVendorName) {
      products.push({
        id: ext.id,
        name: ext.name,
        category: 'extension',
        categoryLabel: 'Extension',
        path: `extensions/${ext.id}`,
      });
    }
  });

  // Models
  modelsData.forEach((model) => {
    if (model.vendor?.toLowerCase() === normalizedVendorName) {
      products.push({
        id: model.id,
        name: model.name,
        category: 'model',
        categoryLabel: 'Model',
        path: `models/${model.id}`,
      });
    }
  });

  // Providers
  providersData.forEach((provider) => {
    // Check both vendor and name
    const matchesvendor = provider.vendor?.toLowerCase() === normalizedVendorName;
    const matchesName = provider.name?.toLowerCase() === normalizedVendorName;

    if (matchesvendor || matchesName) {
      products.push({
        id: provider.id,
        name: provider.name,
        category: 'provider',
        categoryLabel: 'Provider',
        path: `model-providers/${provider.id}`,
      });
    }
  });

  return products;
}

/**
 * Get products by vendor ID (matches vendor.id from vendors.json)
 */
export function getProductsByvendor(vendor: string): VendorProduct[] {
  const products: VendorProduct[] = [];

  // Providers have vendor field that matches vendor.id
  providersData.forEach((provider) => {
    if (provider.vendor === vendor) {
      products.push({
        id: provider.id,
        name: provider.name,
        category: 'provider',
        categoryLabel: 'Provider',
        path: `model-providers/${provider.id}`,
      });
    }
  });

  // Models might have vendor that matches vendor name
  // We need to get the vendor name from vendor first
  // For now, we'll just check if vendor field matches common vendor names

  return products;
}
