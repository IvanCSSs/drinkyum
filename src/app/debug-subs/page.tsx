"use client";

import { useState } from "react";

export default function DebugSubscriptions() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    setLoading(true);
    try {
      // Get token
      const token = localStorage.getItem('wp_auth_token');
      console.log('Token found:', !!token, token?.substring(0, 20) + '...');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/debug/subscription-check', {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '2rem' }}>Subscription Debug</h1>

      <button
        onClick={runDebug}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          background: '#E1258F',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
        }}
      >
        {loading ? 'Running...' : 'Run Debug Check'}
      </button>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Result:</h2>
          <pre style={{
            background: '#2a2a2a',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '600px',
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
