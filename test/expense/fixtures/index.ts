import { chaiWithHttp } from '../..';

export async function createExpense(
  app: any,
  baseUrl: string,
  token: string,
  data: any,
) {
  return await chaiWithHttp
    .request(app.app)
    .post(`${baseUrl}/expenses`)
    .set('Authorization', `Bearer ${token}`)
    .send(data);
}

export async function listExpenses(app: any, baseUrl: string, token: string) {
  return await chaiWithHttp
    .request(app.app)
    .get(`${baseUrl}/expenses`)
    .set('Authorization', `Bearer ${token}`);
}

export const validExpenseObject = {
  title: 'test-expense',
  amount: 23400,
  category: 'testing',
};
