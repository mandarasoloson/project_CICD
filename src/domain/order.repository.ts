export interface Order {
  id: string;
  amount: number;
  status: 'PENDING' | 'PAID';
}

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}