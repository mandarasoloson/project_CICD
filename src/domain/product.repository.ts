export type PhysicalProduct = {
  id: string;
  name: string;
  price: number;
  type: 'physical';
  stock: number;
  category: string;
};

export type DigitalProduct = {
  id: string;
  name: string;
  price: number;
  type: 'digital';
  stock: null;
  category: string;
};

export type Product = PhysicalProduct | DigitalProduct;

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  update(product: Product): Promise<void>;
}
