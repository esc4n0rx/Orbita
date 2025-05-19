// lib/api.ts
import { TokenService } from './token-service';

export async function fetchAPI(url: string, options: RequestInit = {}) {
  const token = TokenService.getToken();
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Erro desconhecido');
    throw new Error(`Erro API (${response.status}): ${errorText}`);
  }
  
  return response.json();
}