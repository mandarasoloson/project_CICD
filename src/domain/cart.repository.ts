export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  status: 'active' | 'checked_out';
}

export interface CartRepository {
  save(cart: Cart): Promise<void>;
  findById(id: string): Promise<Cart | null>;
  update(cart: Cart): Promise<void>;
}
