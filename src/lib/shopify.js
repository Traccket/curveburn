// Headless Shopify Configuration
export const SHOPIFY_CONFIG = {
  DOMAIN: 'toplinenatural.myshopify.com',
  VARIANTS: {
    ONE_TIME: {
      id: '48063268585713',
      price: 110000,
      label: 'Compra Única',
      permalink: 'https://toplinenatural.myshopify.com/cart/48063268585713:1',
    },
    PLAN_2_MONTHS: {
      id: '48063271076081',
      price: 89000,
      label: 'Plan 2 meses',
      permalink: 'https://toplinenatural.myshopify.com/cart/48063271076081:1',
    },
  },
};

// Function targeting Shopify Cart Permalink Endpoint
export function handleCheckout(variantId, quantity = 1) {
  if (!variantId) {
    console.error("A variantId is required for Shopify checkout.");
    return;
  }

  // Construction for Shopify Permalinks
  // Format: https://{domain}/cart/{variant_id}:{quantity}
  let checkoutUrl = `https://${SHOPIFY_CONFIG.DOMAIN}/cart/${variantId}:${quantity}`;
  
  // Redirect the user
  window.location.href = checkoutUrl;
}
