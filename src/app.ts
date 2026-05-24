import express, { Request, Response } from 'express';
import path from 'path';
import { OrderService } from './domain/order.service';
import { OrderRepository, Order } from './domain/order.repository';
import { ProductService } from './domain/product.service';
import { ProductRepository, Product } from './domain/product.repository';
import { createOrderRouter } from './routes/order.routes';
import { createProductRouter } from './routes/product.routes';

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

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const orderService = new OrderService(new AppOrderRepository());
const productService = new ProductService(new AppProductRepository());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', database: 'connected' });
});

app.use('/orders', createOrderRouter(orderService));
app.use('/products', createProductRouter(productService));

export { app };
