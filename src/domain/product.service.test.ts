import { ProductService } from './product.service';
import { Product, ProductRepository } from './product.repository';

class InMemoryProductRepository implements ProductRepository {
  public products: Product[] = [];

  async save(product: Product): Promise<void> { this.products.push(product); }
  async findById(id: string): Promise<Product | null> { return this.products.find(p => p.id === id) ?? null; }
  async findAll(): Promise<Product[]> { return [...this.products]; }
  async update(product: Product): Promise<void> {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) this.products[index] = product;
  }
}

describe('ProductService', () => {
  describe('createProduct', () => {
    it('should create a physical product with stock', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);

      // Act
      const product = await service.createProduct({
        id: 'prod-1', name: 'Laptop', price: 999,
        type: 'physical', stock: 10, category: 'electronics',
      });

      // Assert
      expect(product.id).toBe('prod-1');
      expect(product.type).toBe('physical');
      expect(product.stock).toBe(10);
    });

    it('should create a digital product with null stock', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);

      // Act
      const product = await service.createProduct({
        id: 'prod-2', name: 'E-Book React', price: 15,
        type: 'digital', category: 'books',
      });

      // Assert
      expect(product.type).toBe('digital');
      expect(product.stock).toBeNull();
    });

    it('should throw when creating a physical product without stock', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);

      // Act & Assert
      await expect(
        service.createProduct({ id: 'prod-3', name: 'Chaise', price: 200, type: 'physical', category: 'mobilier' })
      ).rejects.toThrow('Un produit physique doit avoir un stock valide');
    });

    it('should throw when price is zero or negative', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);

      // Act & Assert
      await expect(
        service.createProduct({ id: 'prod-4', name: 'Free', price: 0, type: 'digital', category: 'misc' })
      ).rejects.toThrow('Le prix doit être supérieur à 0');
    });

    it('should save the product in the repository', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);

      // Act
      await service.createProduct({ id: 'prod-5', name: 'Cours vidéo', price: 49, type: 'digital', category: 'education' });

      // Assert
      const saved = await repo.findById('prod-5');
      expect(saved).not.toBeNull();
      expect(saved?.name).toBe('Cours vidéo');
    });
  });

  describe('getProduct', () => {
    it('should return the product when it exists', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);
      await service.createProduct({ id: 'prod-6', name: 'Casque', price: 80, type: 'physical', stock: 5, category: 'audio' });

      // Act
      const product = await service.getProduct('prod-6');

      // Assert
      expect(product.name).toBe('Casque');
    });

    it('should throw when product does not exist', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);

      // Act & Assert
      await expect(service.getProduct('inexistant')).rejects.toThrow('Produit inexistant introuvable');
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);
      await service.createProduct({ id: 'p1', name: 'A', price: 10, type: 'digital', category: 'cat' });
      await service.createProduct({ id: 'p2', name: 'B', price: 20, type: 'digital', category: 'cat' });

      // Act
      const products = await service.getAllProducts();

      // Assert
      expect(products).toHaveLength(2);
    });
  });

  describe('decrementStock', () => {
    it('should decrement stock for a physical product', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);
      await service.createProduct({ id: 'prod-7', name: 'Téléphone', price: 500, type: 'physical', stock: 5, category: 'electronics' });

      // Act
      await service.decrementStock('prod-7', 2);

      // Assert
      const updated = await repo.findById('prod-7');
      expect(updated?.stock).toBe(3);
    });

    it('should throw when stock is insufficient', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);
      await service.createProduct({ id: 'prod-8', name: 'Tablette', price: 400, type: 'physical', stock: 1, category: 'electronics' });

      // Act & Assert
      await expect(service.decrementStock('prod-8', 3)).rejects.toThrow('Stock insuffisant');
    });

    it('should not decrement stock for digital products (unlimited)', async () => {
      // Arrange
      const repo = new InMemoryProductRepository();
      const service = new ProductService(repo);
      await service.createProduct({ id: 'prod-9', name: 'Licence logiciel', price: 99, type: 'digital', category: 'software' });

      // Act & Assert — pas d'erreur même avec une grande quantité
      await expect(service.decrementStock('prod-9', 9999)).resolves.not.toThrow();
    });
  });
});
