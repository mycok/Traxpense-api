import { chaiWithHttp } from '../..';

export async function createCategory(
  app: any,
  baseUrl: string,
  token: string,
  data: any,
) {
  return await chaiWithHttp
    .request(app.app)
    .post(`${baseUrl}/categories`)
    .set('Authorization', `Bearer ${token}`)
    .send(data);
}

export async function listCategories(app: any, baseUrl: string, token: string) {
  return await chaiWithHttp
    .request(app.app)
    .get(`${baseUrl}/categories`)
    .set('Authorization', `Bearer ${token}`);
}

export const validCategoryObject = {
  title: 'laptops',
  createdByAdmin: true,
};
