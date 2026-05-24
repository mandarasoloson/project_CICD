import { Product } from './product.repository';

export interface CreateProductDTO {
  id: string;
  name: string;
  price: number;
  type: 'physical' | 'digital';
  stock?: number;
  category: string;
}

export class ProductFactory {
  static create(dto: CreateProductDTO): Product {
    if (dto.price <= 0) {
      throw new Error('Le prix doit être supérieur à 0');
    }

    if (dto.type === 'physical') {
      if (dto.stock === undefined || dto.stock < 0) {
        throw new Error('Un produit physique doit avoir un stock valide (≥ 0)');
      }
      return {
        id: dto.id,
        name: dto.name,
        price: dto.price,
        type: 'physical',
        stock: dto.stock,
        category: dto.category,
      };
    }

    return {
      id: dto.id,
      name: dto.name,
      price: dto.price,
      type: 'digital',
      stock: null,
      category: dto.category,
    };
  }
}
