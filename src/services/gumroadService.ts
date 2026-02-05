// Gumroad integration service
export interface GumroadProduct {
  productId: string;
  planId: string;
  name: string;
  price: number;
}

// Gumroad product configurations - Updated with correct product IDs
export const GUMROAD_PRODUCTS: Record<string, GumroadProduct> = {
  'basic': {
    productId: 'ptlsqlp', // Correct product ID for basic monthly
    planId: 'basic',
    name: 'Basic Subscription',
    price: 9.99
  },
  'premium': {
    productId: 'omxfm', // Correct product ID for premium monthly  
    planId: 'premium',
    name: 'Premium Subscription',
    price: 29.99
  }
};

// Map of actual Gumroad product IDs to our plan IDs - Updated with correct IDs
export const GUMROAD_PRODUCT_ID_MAP: Record<string, string> = {
  // New correct product IDs
  'ptlsqlp': 'basic',
  'omxfm': 'premium',
  // Keep old IDs for backward compatibility in case of webhook retries
  'SovSpZUABprtMPU0KmUksA==': 'basic',
  'lWL2oynuKtJTYjAEEhmTsg==': 'premium',
  'lcgkby': 'basic',
  'jqkug': 'premium',
  'ZU_EYSqQjZGJ3x_8Hm102g==': 'basic',
  '8Z5KbSnX9tZnx7buHJcbWQ==': 'premium',
};

export interface GumroadPaymentParams {
  productId: string;
  planId: string;
  userId: string;
  userEmail: string;
  returnUrl?: string;
}

class GumroadService {
  private readonly GUMROAD_BASE_URL = 'https://fastend.gumroad.com/l';
  
  // Generate Gumroad checkout URL with custom parameters
  generateCheckoutUrl(params: GumroadPaymentParams): string {
    const product = GUMROAD_PRODUCTS[params.planId];
    if (!product) {
      throw new Error('Invalid plan ID');
    }

    const checkoutUrl = new URL(`${this.GUMROAD_BASE_URL}/${product.productId}`);
    
    // Add custom parameters that will be passed to webhook
    checkoutUrl.searchParams.set('user_id', params.userId);
    checkoutUrl.searchParams.set('plan_id', params.planId);
    checkoutUrl.searchParams.set('user_email', params.userEmail);
    
    // For Gumroad email auto-fill, use the standard 'email' parameter
    checkoutUrl.searchParams.set('email', params.userEmail);
    
    if (params.returnUrl) {
      checkoutUrl.searchParams.set('redirect_url', params.returnUrl);
    }

    console.log('Generated Gumroad checkout URL:', checkoutUrl.toString());
    
    return checkoutUrl.toString();
  }

  // Map product ID to plan ID
  mapProductToPlan(productId: string, amount?: number): string | null {
    // First try direct mapping
    if (GUMROAD_PRODUCT_ID_MAP[productId]) {
      return GUMROAD_PRODUCT_ID_MAP[productId];
    }

    // Fallback to price-based mapping
    if (amount) {
      if (amount >= 9.98 && amount <= 10.01) {
        return 'basic';
      }
      if (amount >= 29.98 && amount <= 30.01) {
        return 'premium';
      }
    }

    return null;
  }

  // Verify Gumroad webhook (basic implementation)
  verifyWebhook(payload: any, signature?: string): boolean {
    // In a real implementation, you'd verify the webhook signature
    // For now, we'll do basic validation
    return payload && (payload.sale_id || payload.order_id) && payload.product_id;
  }
}

export const gumroadService = new GumroadService();
export default gumroadService;
