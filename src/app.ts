import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { registry, httpRequestCounter, httpRequestDuration } from './utils/metrics';
import { OrderService } from './domain/order.service';
import { OrderRepository, Order } from './domain/order.repository';
import { ProductService } from './domain/product.service';
import { ProductRepository, Product } from './domain/product.repository';
import { CartService } from './domain/cart.service';
import { CartRepository, Cart } from './domain/cart.repository';
import { StockUpdater, OrderLogger } from './domain/cart-observer';
import { createOrderRouter } from './routes/order.routes';
import { createProductRouter } from './routes/product.routes';
import { createCartRouter } from './routes/cart.routes';

class AppOrderRepository implements OrderRepository {
  private orders: Order[] = [];
  async save(order: Order): Promise<void> { this.orders.push(order); }
  async findById(id: string): Promise<Order | null> { return this.orders.find(o => o.id === id) ?? null; }
}

class AppProductRepository implements ProductRepository {
  private products: Product[] = [];
  async save(product: Product): Promise<void> { this.products.push(product); }
  async findById(id: string): Promise<Product | null> { return this.products.find(p => p.id === id) ?? null; }
  async findAll(): Promise<Product[]> { return [...this.products]; }
  async update(product: Product): Promise<void> {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) this.products[index] = product;
  }
}

class AppCartRepository implements CartRepository {
  private carts: Cart[] = [];
  async save(cart: Cart): Promise<void> { this.carts.push({ ...cart, items: [...cart.items] }); }
  async findById(id: string): Promise<Cart | null> {
    const cart = this.carts.find(c => c.id === id);
    return cart ? { ...cart, items: [...cart.items] } : null;
  }
  async update(cart: Cart): Promise<void> {
    const index = this.carts.findIndex(c => c.id === cart.id);
    if (index !== -1) this.carts[index] = { ...cart, items: [...cart.items] };
  }
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use((req: Request, res: Response, next: NextFunction) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route?.path ?? req.path;
    httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    end({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

const productService = new ProductService(new AppProductRepository());
const cartService = new CartService(new AppCartRepository(), productService);

// Pattern Observer : on branche les observateurs ici, CartService ne les connaît pas
cartService.addObserver(new StockUpdater(productService));
cartService.addObserver(new OrderLogger());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', database: 'connected' });
});

app.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});

app.use('/orders', createOrderRouter(new OrderService(new AppOrderRepository())));
app.use('/products', createProductRouter(productService));
app.use('/cart', createCartRouter(cartService));

export { app };
