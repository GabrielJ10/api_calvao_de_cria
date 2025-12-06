import { IOrder } from '../../models/order.model';

const transformOrderItem = (item: any) => ({
  productId: item.productId,
  name: item.name,
  mainImageUrl: item.mainImageUrl,
  quantity: item.quantity,
  priceAtTimeOfPurchase: item.priceAtTimeOfPurchase,
  totalItemPrice: item.totalItemPrice,
});

const transformShippingAddress = (address: any) => ({
  recipientName: address.recipientName,
  street: address.street,
  number: address.number,
  complement: address.complement,
  neighborhood: address.neighborhood,
  city: address.city,
  state: address.state,
  cep: address.cep,
  phone: address.phone,
});

const transformTotals = (totals: any) => ({
  subtotal: totals.subtotal,
  discount: totals.totalDiscount, // Mapeia totalDiscount para discount para consistência com a documentação
  shipping: 0, // Conforme documentação, frete é 0 por enquanto
  total: totals.total,
});

const transformPaymentInfo = (payment: any) => {
  if (payment.method === 'pix') {
    return {
      type: 'PIX',
      qrCodeImage: payment.qrCodeImageUrl,
      copyPasteCode: payment.qrCode,
    };
  }
  // Adicionar outros métodos de pagamento aqui no futuro
  return null;
};

const orderTransformer = {
  transformOrderForCustomer: (order: IOrder) => ({
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    shippingAddress: transformShippingAddress(order.shippingAddress),
    items: order.items.map(transformOrderItem),
    totals: transformTotals(order.totals),
    paymentMethod: order.payment.method,
    paymentInfo: transformPaymentInfo(order.payment),
  }),

  transformOrderSummaryForCustomer: (order: IOrder) => ({
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    total: order.totals.total,
  }),
};

export default orderTransformer;
