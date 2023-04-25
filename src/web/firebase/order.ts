import { Order } from '../../common/types/Order';
import { get, post } from './fetch';

interface OrderPayload {
  details: { itemId: string; quantity: number }[];
}

export const createOrder = async (
  params: OrderPayload
): Promise<Order & { paymentLink: string }> => post('/v1/order', params);
