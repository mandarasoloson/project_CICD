import { Router, Request, Response } from 'express';
import { ProductService } from '../domain/product.service';
import { CreateProductDTO } from '../domain/product.factory';

export function createProductRouter(productService: ProductService): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    const products = await productService.getAllProducts();
    res.json(products);
  });

  router.post('/', async (req: Request, res: Response) => {
    const { id, name, price, type, stock, category } = req.body as Record<string, unknown>;

    if (!id || !name || price === undefined || !type || !category) {
      res.status(400).json({ error: 'Champs obligatoires manquants : id, name, price, type, category' });
      return;
    }

    const dto: CreateProductDTO =
      stock !== undefined
        ? { id: String(id), name: String(name), price: Number(price), type: type as 'physical' | 'digital', stock: Number(stock), category: String(category) }
        : { id: String(id), name: String(name), price: Number(price), type: type as 'physical' | 'digital', category: String(category) };

    try {
      const product = await productService.createProduct(dto);
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const product = await productService.getProduct(req.params['id'] as string);
      res.json(product);
    } catch {
      res.status(404).json({ error: 'Produit introuvable' });
    }
  });

  return router;
}
