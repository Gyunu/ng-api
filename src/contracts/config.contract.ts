import { OpaqueToken } from '@angular/core';
export const CONFIG = new OpaqueToken('CONFIG');


export interface ApiConfig {
  baseUrl: string;
  retry: number;
  timeout: number;
}
