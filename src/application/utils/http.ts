export type HttpResponse = {
  statusCode: number;
  body: any;
};

export const OK = 200;

export const BAD_REQUEST = 400;

export const SERVER_ERROR = 500;

export const badRequest = (message: string): HttpResponse => ({
  statusCode: BAD_REQUEST,
  body: { message },
});

export const ok = (content: any): HttpResponse => ({
  statusCode: OK,
  body: content,
});

export const serverError = (): HttpResponse => ({
  statusCode: SERVER_ERROR,
  body: { message: 'Internal Server Error' },
});
