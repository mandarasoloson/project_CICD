import { Router, Request, Response } from 'express';
import { CartService } from '../domain/cart.service';
import { StandardPricing, VipPricing } from '../domain/pricing.strategy';

export function createCartRouter(cartService: CartService): Router {
  const router = Router();

  router.post('/:cartId/items', async (req: Request, res: Response) => {
    const { cartId } = req.params as { cartId: string };
    const { productId, quantity } = req.body as { productId: string; quantity: number };

    if (!productId || !quantity || quantity <= 0) {
      res.status(400).json({ error: 'productId et quantity (> 0) sont requis' });
      return;
    }

    try {
      const cart = await cartService.addItem(cartId, productId, quantity);
      res.status(201).json({ ...cart, total: cartService.computeTotal(cart) });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
    }
  });

  router.get('/:cartId', async (req: Request, res: Response) => {
    try {
      const cart = await cartService.getCart(req.params['cartId'] as string);
      res.json(cart);
    } catch {
      res.status(404).json({ error: 'Panier introuvable' });
    }
  });

  router.delete('/:cartId/items/:productId', async (req: Request, res: Response) => {
    const { cartId, productId } = req.params as { cartId: string; productId: string };
    try {
      const cart = await cartService.removeItem(cartId, productId);
      res.json({ ...cart, total: cartService.computeTotal(cart) });
    } catch (err) {
      res.status(404).json({ error: err instanceof Error ? err.message : 'Panier introuvable' });
    }
  });

  router.post('/:cartId/checkout', async (req: Request, res: Response) => {
    const isVip = (req.body as { isVip?: boolean } | undefined)?.isVip;
    const strategy = isVip ? new VipPricing() : new StandardPricing();
    try {
      const result = await cartService.checkout(req.params['cartId'] as string, strategy);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
    }
  });

  return router;
}
