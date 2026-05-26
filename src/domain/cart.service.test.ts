import { CartService } from './cart.service';
import { Cart, CartRepository } from './cart.repository';
import { CartObserver } from './cart-observer';
import { ProductService } from './product.service';
import { Product, ProductRepository } from './product.repository';

class InMemoryCartRepository implements CartRepository {
  public carts: Cart[] = [];
  async save(cart: Cart): Promise<void> { this.carts.push({ ...cart, items: [...cart.items] }); }
  async findById(id: string): Promise<Cart | null> {
    const cart = this.carts.find(c => c.id === id);
    return cart ? { ...cart, items: [...cart.items] } : null;
  }
  async update(cart: Cart): Promise<void> {
    const i = this.carts.findIndex(c => c.id === cart.id);
    if (i !== -1) this.carts[i] = { ...cart, items: [...cart.items] };
  }
}

class InMemoryProductRepository implements ProductRepository {
  public products: Product[] = [];
  async save(p: Product): Promise<void> { this.products.push(p); }
  async findById(id: string): Promise<Product | null> { return this.products.find(p => p.id === id) ?? null; }
  async findAll(): Promise<Product[]> { return [...this.products]; }
  async update(p: Product): Promise<void> {
    const i = this.products.findIndex(x => x.id === p.id);
    if (i !== -1) this.products[i] = p;
  }
}

function setup(): { productService: ProductService; cartService: CartService; cartRepo: InMemoryCartRepository } {
  const productRepo = new InMemoryProductRepository();
  const productService = new ProductService(productRepo);
  const cartRepo = new InMemoryCartRepository();
  const cartService = new CartService(cartRepo, productService);
  return { productService, cartService, cartRepo };
}

describe('CartService', () => {

  describe('addItem', () => {
    it('should create a new cart and add the item', async () => {
      // Arrange
      const { productService, cartService } = setup();
      await productService.createProduct({ id: 'p1', name: 'Laptop', price: 999, type: 'physical', stock: 10, category: 'electronics' });

      // Act
      const cart = await cartService.addItem('cart-1', 'p1', 2);

      // Assert
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]?.quantity).toBe(2);
      expect(cart.items[0]?.unitPrice).toBe(999);
    });

    it('should increment quantity when same product added twice', async () => {
      // Arrange
      const { productService, cartService } = setup();
      await productService.createProduct({ id: 'p2', name: 'Souris', price: 40, type: 'physical', stock: 20, category: 'peripherals' });
      await cartService.addItem('cart-2', 'p2', 1);

      // Act
      await cartService.addItem('cart-2', 'p2', 3);
      const cart = await cartService.getCart('cart-2');

      // Assert
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]?.quantity).toBe(4);
    });

    it('should throw when adding to a checked-out cart', async () => {
      // Arrange
      const { productService, cartService } = setup();
      await productService.createProduct({ id: 'p3', name: 'Clavier', price: 80, type: 'physical', stock: 5, category: 'peripherals' });
      await cartService.addItem('cart-3', 'p3', 1);
      await cartService.checkout('cart-3');

      // Act & Assert
      await expect(cartService.addItem('cart-3', 'p3', 1)).rejects.toThrow('déjà été validé');
    });

    it('should throw when product does not exist', async () => {
      // Arrange
      const { cartService } = setup();

      // Act & Assert
      await expect(cartService.addItem('cart-4', 'inexistant', 1)).rejects.toThrow('introuvable');
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', async () => {
      // Arrange
      const { productService, cartService } = setup();
      await productService.createProduct({ id: 'p4', name: 'Écran', price: 300, type: 'physical', stock: 3, category: 'peripherals' });
      await cartService.addItem('cart-5', 'p4', 1);

      // Act
      const cart = await cartService.removeItem('cart-5', 'p4');

      // Assert
      expect(cart.items).toHaveLength(0);
    });

    it('should throw when cart does not exist', async () => {
      // Arrange
      const { cartService } = setup();

      // Act & Assert
      await expect(cartService.removeItem('inexistant', 'p1')).rejects.toThrow('introuvable');
    });
  });

  describe('computeTotal', () => {
    it('should calculate total from all items (quantity × unitPrice)', async () => {
      // Arrange
      const { productService, cartService } = setup();
      await productService.createProduct({ id: 'pa', name: 'A', price: 100, type: 'physical', stock: 10, category: 'cat' });
      await productService.createProduct({ id: 'pb', name: 'B', price: 50, type: 'physical', stock: 10, category: 'cat' });
      await cartService.addItem('cart-total', 'pa', 2); // 200
      await cartService.addItem('cart-total', 'pb', 3); // 150

      // Act
      const cart = await cartService.getCart('cart-total');

      // Assert
      expect(cart.total).toBe(350);
    });
  });

  describe('checkout', () => {
    it('should mark cart as checked_out and return total', async () => {
      // Arrange
      const { productService, cartService } = setup();
      await productService.createProduct({ id: 'p5', name: 'Tablette', price: 400, type: 'physical', stock: 5, category: 'electronics' });
      await cartService.addItem('cart-6', 'p5', 1);

      // Act
      const { cart, total } = await cartService.checkout('cart-6');

      // Assert
      expect(cart.status).toBe('checked_out');
      expect(total).toBe(400);
    });

    it('should notify all observers on checkout', async () => {
      // Arrange
      const { productService, cartService } = setup();
      await productService.createProduct({ id: 'p6', name: 'Casque', price: 80, type: 'physical', stock: 10, category: 'audio' });
      await cartService.addItem('cart-7', 'p6', 2);

      const mockObserver: CartObserver = { onCheckout: jest.fn().mockResolvedValue(undefined) };
      cartService.addObserver(mockObserver);

      // Act
      await cartService.checkout('cart-7');

      // Assert
      expect(mockObserver.onCheckout).toHaveBeenCalledTimes(1);
    });

    it('should throw when cart is empty', async () => {
      // Arrange
      const { productService, cartService } = setup();
      await productService.createProduct({ id: 'p7', name: 'Test', price: 10, type: 'physical', stock: 5, category: 'cat' });
      await cartService.addItem('cart-empty', 'p7', 1);
      await cartService.removeItem('cart-empty', 'p7');

      // Act & Assert
      await expect(cartService.checkout('cart-empty')).rejects.toThrow('vide');
    });

    it('should throw when cart is already checked out', async () => {
      // Arrange
      const { productService, cartService } = setup();
      await productService.createProduct({ id: 'p8', name: 'Phone', price: 500, type: 'physical', stock: 5, category: 'electronics' });
      await cartService.addItem('cart-8', 'p8', 1);
      await cartService.checkout('cart-8');

      // Act & Assert
      await expect(cartService.checkout('cart-8')).rejects.toThrow('déjà été validé');
    });
  });
});
