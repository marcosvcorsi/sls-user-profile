export type HttpResponse = {
  statusCode: number;
  body: string;
};

export const OK = 200;

export const BAD_REQUEST = 400;

export const SERVER_ERROR = 500;

export const badRequest = (message: string): HttpResponse => ({
  statusCode: BAD_REQUEST,
  body: JSON.stringify({ message }),
});

export const ok = (content: any): HttpResponse => ({
  statusCode: OK,
  body: JSON.stringify(content),
});

export const serverError = (): HttpResponse => ({
  statusCode: SERVER_ERROR,
  body: JSON.stringify({ message: 'Internal Server Error' }),
});
