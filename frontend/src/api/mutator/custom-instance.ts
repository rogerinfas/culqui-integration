import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({ baseURL: 'http://localhost:3000' });

AXIOS_INSTANCE.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const customInstance = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const method = options?.method || 'GET';
  const headers = options?.headers as any;
  const data = options?.body ? JSON.parse(options.body as string) : undefined;

  const promise = AXIOS_INSTANCE({
    url,
    method,
    headers,
    data,
  }).then(({ data }) => data);

  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
