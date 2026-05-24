import { OrderService } from './order.service';
import { OrderRepository, Order } from './order.repository';
import { VipPricing } from './pricing.strategy';

// Création d'un Fake Repository pour isoler le test (Mocking propre)
class InMemoryOrderRepository implements OrderRepository {
  public orders: Order[] = [];

  async save(order: Order): Promise<void> {
    this.orders.push(order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id) || null;
  }
}

describe('OrderService', () => {
  it('should create an order with VIP pricing applied [AAA Structure]', async () => {
    // 1. ARRANGE (Préparer l'environnement de test)
    const mockRepo = new InMemoryOrderRepository();
    const service = new OrderService(mockRepo);
    const vipStrategy = new VipPricing();
    const orderId = 'order-123';
    const baseAmount = 100;

    // 2. ACT (Exécuter la fonction à tester)
    const result = await service.createOrder(orderId, baseAmount, vipStrategy);

    // 3. ASSERT (Vérifier que le résultat correspond aux attentes)
    expect(result.id).toBe(orderId);
    expect(result.amount).toBe(80); // 100 - 20%
    expect(result.status).toBe('PENDING');
    
    // Vérifier que l'ordre a bien été "sauvegardé" dans le faux repo
    const savedOrder = await mockRepo.findById(orderId);
    expect(savedOrder).not.toBeNull();
    expect(savedOrder?.amount).toBe(80);
  });
});