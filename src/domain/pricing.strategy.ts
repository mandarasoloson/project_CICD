export interface PricingStrategy {
  calculateTotal(amount: number): number;
}

export class StandardPricing implements PricingStrategy {
  calculateTotal(amount: number): number {
    return amount;
  }
}

export class VipPricing implements PricingStrategy {
  calculateTotal(amount: number): number {
    return amount * 0.8; // 20% de réduction pour les VIP
  }
}