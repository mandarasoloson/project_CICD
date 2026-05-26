import { Cart } from './cart.repository';
import { ProductService } from './product.service';
import { Logger } from '../utils/logger';

export interface CartObserver {
  onCheckout(cart: Cart, total?: number): Promise<void>;
}

export class StockUpdater implements CartObserver {
  constructor(private productService: ProductService) {}

  async onCheckout(cart: Cart): Promise<void> {
    for (const item of cart.items) {
      await this.productService.decrementStock(item.productId, item.quantity);
    }
  }
}

export class OrderLogger implements CartObserver {
  private logger = Logger.getInstance();

  async onCheckout(cart: Cart, total: number): Promise<void> {
    this.logger.info('Commande validée depuis le panier', {
      cartId: cart.id,
      total,
      itemCount: cart.items.length,
    });
  }
}
