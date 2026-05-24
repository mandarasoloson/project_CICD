import { Router, Request, Response } from 'express';
import { OrderService } from '../domain/order.service';
import { StandardPricing, VipPricing } from '../domain/pricing.strategy';

export function createOrderRouter(orderService: OrderService): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    const { id, amount, isVip } = req.body as { id: string; amount: number; isVip: boolean };

    if (!id || !amount) {
      res.status(400).json({ error: 'Missing id or amount' });
      return;
    }

    const strategy = isVip ? new VipPricing() : new StandardPricing();

    try {
      const order = await orderService.createOrder(id, amount, strategy);
      res.status(201).json(order);
    } catch {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
