// src/services/apiClient.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5283/api';

export const fetchWithAuth = async (endpoint, options = {}) => {
  // 🟢 1. Gestion hybride du jeton (Clerk ou Local Storage pour l'Admin)
  let token = await window.Clerk?.session?.getToken();
  if (!token) {
    token = localStorage.getItem('token') || localStorage.getItem('userToken');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 🟢 2. Normalisation de l'endpoint (évite les doubles slashes //)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || errorData.Message || 'Erreur lors de la requête API');
    error.response = { data: errorData, status: response.status };
    throw error;
  }

  // 🟢 3. SÉCURITÉ JSON : Gestion des réponses vides (201 Created / 204 No Content)
  if (response.status === 204) return true;

  const text = await response.text();
  return text ? JSON.parse(text) : true;
};