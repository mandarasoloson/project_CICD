import { OrderRepository, Order } from './order.repository';
import { PricingStrategy } from './pricing.strategy';
import { Logger } from '../utils/logger';

export class OrderService {
  private logger = Logger.getInstance();

  // Injection de dépendance du Repository
  constructor(private orderRepository: OrderRepository) {}

  public async createOrder(id: string, baseAmount: number, pricing: PricingStrategy): Promise<Order> {
    const finalAmount = pricing.calculateTotal(baseAmount);
    
    const order: Order = {
      id,
      amount: finalAmount,
      status: 'PENDING',
    };

    await this.orderRepository.save(order);
    this.logger.info('Order created', { orderId: id, amount: finalAmount });
    
    return order;
  }
}