import { Cart, CartRepository } from './cart.repository';
import { CartObserver } from './cart-observer';
import { ProductService } from './product.service';
import { PricingStrategy, StandardPricing } from './pricing.strategy';

export class CartService {
  private observers: CartObserver[] = [];

  constructor(
    private cartRepo: CartRepository,
    private productService: ProductService,
  ) {}

  addObserver(observer: CartObserver): void {
    this.observers.push(observer);
  }

  async addItem(cartId: string, productId: string, quantity: number): Promise<Cart> {
    const product = await this.productService.getProduct(productId);

    let cart = await this.cartRepo.findById(cartId);
    if (!cart) {
      cart = { id: cartId, items: [], status: 'active' };
      await this.cartRepo.save(cart);
    }

    if (cart.status === 'checked_out') {
      throw new Error('Ce panier a déjà été validé');
    }

    const existing = cart.items.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        productName: product.name,
        quantity,
        unitPrice: product.price,
      });
    }

    await this.cartRepo.update(cart);
    return cart;
  }

  async removeItem(cartId: string, productId: string): Promise<Cart> {
    const cart = await this.getCartOrThrow(cartId);
    cart.items = cart.items.filter(i => i.productId !== productId);
    await this.cartRepo.update(cart);
    return cart;
  }

  async getCart(cartId: string): Promise<Cart & { total: number }> {
    const cart = await this.getCartOrThrow(cartId);
    return { ...cart, total: this.computeTotal(cart) };
  }

  computeTotal(cart: Cart): number {
    return cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  async checkout(cartId: string, strategy: PricingStrategy = new StandardPricing()): Promise<{ cart: Cart; total: number }> {
    const cart = await this.getCartOrThrow(cartId);
    if (cart.items.length === 0) throw new Error('Le panier est vide');
    if (cart.status === 'checked_out') throw new Error('Ce panier a déjà été validé');

    // Pattern Strategy : le calcul du prix final est délégué à la stratégie choisie
    const baseTotal = this.computeTotal(cart);
    const total = strategy.calculateTotal(baseTotal);

    cart.status = 'checked_out';
    await this.cartRepo.update(cart);

    // Pattern Observer : CartService notifie sans savoir ce que font les observateurs
    await Promise.all(this.observers.map(obs => obs.onCheckout(cart, total)));

    return { cart, total };
  }

  private async getCartOrThrow(cartId: string): Promise<Cart> {
    const cart = await this.cartRepo.findById(cartId);
    if (!cart) throw new Error(`Panier ${cartId} introuvable`);
    return cart;
  }
}
