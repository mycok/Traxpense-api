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

export async function updateExpense(
  app: any,
  baseUrl: string,
  token: string,
  expId: string,
  data: any,
) {
  return await chaiWithHttp
    .request(app.app)
    .patch(`${baseUrl}/expenses/${expId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(data);
}

export async function listExpenses(app: any, baseUrl: string, token: string) {
  return await chaiWithHttp
    .request(app.app)
    .get(`${baseUrl}/expenses`)
    .set('Authorization', `Bearer ${token}`);
}

export async function listExpensesWithQueryStrs(
  app: any,
  baseUrl: string,
  token: string,
  query: string,
) {
  return await chaiWithHttp
    .request(app.app)
    .get(`${baseUrl}/expenses/?${query}`)
    .set('Authorization', `Bearer ${token}`);
}

export async function read(
  app: any,
  baseUrl: string,
  token: string,
  expId: string,
) {
  return await chaiWithHttp
    .request(app.app)
    .get(`${baseUrl}/expenses/${expId}`)
    .set('Authorization', `Bearer ${token}`);
}

export function deleteExpense(
  app: any,
  baseUrl: string,
  token: string,
  expId: string,
) {
  return chaiWithHttp
    .request(app.app)
    .delete(`${baseUrl}/expenses/${expId}`)
    .set('authorization', `Bearer ${token}`);
}

export async function previewExpenses(
  app: any,
  baseUrl: string,
  token: string,
) {
  return await chaiWithHttp
    .request(app.app)
    .get(`${baseUrl}/expenses/current`)
    .set('Authorization', `Bearer ${token}`);
}

export const validExpenseObject = {
  title: 'test-expense',
  amount: 23400,
  category: 'testing',
};
