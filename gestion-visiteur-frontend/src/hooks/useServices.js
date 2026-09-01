import { useState, useEffect } from 'react';

const DEFAULT_SERVICES = [
  { id: '1', label: 'Direction' },
  { id: '2', label: 'Service RH' },
  { id: '3', label: 'Service Financier' },
  { id: '4', label: 'Service Informatique' },
  { id: '5', label: 'Secrétariat' }
];

export const getStoredServices = () => {
  const saved = localStorage.getItem('companyServices');
  if (!saved) return DEFAULT_SERVICES;

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SERVICES;

    return parsed.map((srv, idx) => {
      if (typeof srv === 'string') {
        return { id: String(idx + 1), label: srv };
      }
      return {
        id: String(srv.id || idx + 1),
        label: srv.label || srv.nom || srv.name || `Service ${idx + 1}`
      };
    });
  } catch (e) {
    console.error("Erreur de lecture des services :", e);
    return DEFAULT_SERVICES;
  }
};

export const useServices = () => {
  const [services, setServices] = useState(getStoredServices());

  useEffect(() => {
    const handleUpdate = () => {
      setServices(getStoredServices());
    };

    window.addEventListener('configUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('configUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return services;
};