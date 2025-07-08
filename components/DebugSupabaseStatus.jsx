import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../services/supabase/client.js';

const DebugSupabaseStatus = () => {
  const { session, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(null);
  const [result, setResult] = useState(null);

  const handleTestRequest = async () => {
    setStatus('loading');
    setError(null);
    setResult(null);
    setDuration(null);
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      const end = performance.now();
      setDuration((end - start).toFixed(2));
      if (error) {
        setStatus('error');
        setError(error.message || JSON.stringify(error));
      } else {
        setStatus('success');
        setResult(data);
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || JSON.stringify(err));
      setDuration(null);
    }
  };

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: 24,
      margin: 24,
      fontFamily: 'Inter, sans-serif',
      maxWidth: 480
    }}>
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Debug Supabase Status</h2>
      <div style={{ marginBottom: 8 }}>
        <strong>¿Autenticado?:</strong> {authLoading ? 'Cargando...' : (session ? '✅ Sí' : '❌ No')}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Estado petición:</strong> {status}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Duración última petición:</strong> {duration ? `${duration} ms` : '-'}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Error:</strong> {error ? <span style={{ color: 'red' }}>{error}</span> : '-'}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Resultado:</strong> <pre style={{ background: '#f1f5f9', padding: 8, borderRadius: 6, maxHeight: 120, overflow: 'auto' }}>{result ? JSON.stringify(result, null, 2) : '-'}</pre>
      </div>
      <button
        onClick={handleTestRequest}
        style={{
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: 16,
          cursor: 'pointer',
          marginTop: 8
        }}
      >
        Probar petición a Supabase
      </button>
    </div>
  );
};

export default DebugSupabaseStatus; 