import { Product, ProductRepository } from './product.repository';
import { CreateProductDTO, ProductFactory } from './product.factory';
import { Logger } from '../utils/logger';

export class ProductService {
  private logger = Logger.getInstance();

  constructor(private repo: ProductRepository) {}

  async createProduct(dto: CreateProductDTO): Promise<Product> {
    const product = ProductFactory.create(dto);
    await this.repo.save(product);
    this.logger.info('Produit créé', { productId: product.id, type: product.type });
    return product;
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) throw new Error(`Produit ${id} introuvable`);
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return this.repo.findAll();
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    const product = await this.getProduct(id);
    if (product.type === 'digital') return;
    if (product.stock < quantity) {
      throw new Error(`Stock insuffisant pour le produit ${id}`);
    }
    const updated = { ...product, stock: product.stock - quantity };
    await this.repo.update(updated);
    this.logger.info('Stock décrémenté', { productId: id, quantity, remaining: updated.stock });
  }
}
