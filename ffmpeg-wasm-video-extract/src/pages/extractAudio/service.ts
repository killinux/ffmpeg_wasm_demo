import request from 'umi-request';
import baseUrl from '@/config/baseUrl';
export type ParamsType = FormData;
export async function getText(params: ParamsType) {
  return request(`${baseUrl.requestUrl}/ai/api/ai/voice2Text`, {
    method: 'post',
    body: params,
  });
}
