import { HttpResponse } from '../../application/utils/http';

export const adaptHttpResponse = (response: HttpResponse) => ({
  ...response,
  body: JSON.stringify(response.body),
});
