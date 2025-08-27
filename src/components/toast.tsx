'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterWrapper() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: '1px solid #10b981',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#10b981',
          },
        },
        error: {
          style: {
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            border: '1px solid #ef4444',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#ef4444',
          },
        },
        loading: {
          style: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            border: '1px solid #3b82f6',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#3b82f6',
          },
        },
      }}
    />
  );
}