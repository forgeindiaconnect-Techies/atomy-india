import { ALL_CATALOG_PRODUCTS, BEST_PRODUCTS } from '../data/mockData.js';

/**
 * Checks if a product has the GST Reduced badge (251120000048501.png).
 * Products with this badge receive 5% GST instead of the standard 18% GST.
 */
export const isProductGstReduced = (item) => {
  if (!item) return false;
  if (item.gstReduced === true) return true;
  if (Array.isArray(item.tags) && item.tags.some(t => typeof t === 'string' && t.toUpperCase().includes('GST REDUCED'))) {
    return true;
  }
  const catalogProd = (ALL_CATALOG_PRODUCTS && ALL_CATALOG_PRODUCTS.find(p => p.id === item.id))
    || (BEST_PRODUCTS && BEST_PRODUCTS.find(p => p.id === item.id));

  if (catalogProd?.gstReduced === true) return true;
  if (Array.isArray(catalogProd?.tags) && catalogProd?.tags.some(t => typeof t === 'string' && t.toUpperCase().includes('GST REDUCED'))) {
    return true;
  }
  return false;
};

/**
 * Returns the applicable GST tax rate percentage:
 * - 5% for products bearing the GST Reduced card/badge
 * - 18% standard rate for all other products
 */
export const getProductGstRate = (item) => {
  return isProductGstReduced(item) ? 5 : 18;
};

/**
 * Calculates Base Price and GST from the GST-inclusive price:
 * - Total Price remains untouched (already inclusive of taxes)
 * - Base = Price / (1 + Rate / 100)  [e.g. Price / 1.05 for 5%, Price / 1.18 for 18%]
 * - GST  = Total Price - Base
 */
export const calculateProductTax = (price, item) => {
  const numPrice = Number(price) || 0;
  const rate = getProductGstRate(item);
  const divisor = 1 + (rate / 100);
  const base = numPrice / divisor;
  const gst = numPrice - base;
  return {
    rate,
    base,
    gst,
    totalPrice: numPrice
  };
};

/**
 * Calculates total GST and Base across an array of cart items:
 */
export const calculateCartTaxSummary = (items = []) => {
  let totalGst = 0;
  let totalBase = 0;
  let totalAmount = 0;

  items.forEach((item) => {
    const itemTotal = (Number(item.price) || 0) * (Number(item.qty) || 1);
    const { base, gst } = calculateProductTax(itemTotal, item);
    totalGst += gst;
    totalBase += base;
    totalAmount += itemTotal;
  });

  return {
    totalGst,
    totalBase,
    totalAmount
  };
};
