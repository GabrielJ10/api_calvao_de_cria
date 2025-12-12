/**
 * Enum para os status possíveis de um pedido.
 * Evita o uso de strings mágicas e garante type safety.
 */
export enum OrderStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  PREPARING_SHIPMENT = 'PREPARING_SHIPMENT',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

/**
 * Enum para os tipos de métodos de pagamento.
 * Corresponde ao campo 'identifier' do PaymentMethod.
 */
export enum PaymentMethodType {
  PIX = 'pix',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BOLETO = 'boleto',
}
