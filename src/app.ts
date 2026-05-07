import express, { Request, Response } from 'express';
import { OrderService } from './domain/order.service';
import { StandardPricing, VipPricing } from './domain/pricing.strategy';
import { OrderRepository, Order } from './domain/order.repository';

// fausse base de données en mémoire
// Plus tard, remplacer avec vraie BDD avec Docker
class AppOrderRepository implements OrderRepository {
  private orders: Order[] = [];
  async save(order: Order): Promise<void> { this.orders.push(order); }
  async findById(id: string): Promise<Order | null> { return this.orders.find(o => o.id === id) || null; }
}

const app = express();
app.use(express.json()); // Permet de lire le JSON envoyé par les clients

const orderRepo = new AppOrderRepository();
const orderService = new OrderService(orderRepo);

// --- ROUTES ---

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', database: 'connected' });
});

// 2. La route pour créer une commande
app.post('/orders', async (req: Request, res: Response) => {
  const { id, amount, isVip } = req.body;

  // Validation basique
  if (!id || !amount) {
    return res.status(400).json({ error: 'Missing id or amount' });
  }

  // Utilisation Design Pattern "Strategy"
  const strategy = isVip ? new VipPricing() : new StandardPricing();

  try {
    const order = await orderService.createOrder(id, amount, strategy);
    res.status(201).json(order);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { app };