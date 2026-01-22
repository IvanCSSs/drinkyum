"use client";

import { useState } from "react";

export default function DebugSubscriptions() {
  const [subResult, setSubResult] = useState<any>(null);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [addressResult, setAddressResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSubDebug = async () => {
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
      setSubResult(data);
    } catch (error: any) {
      setSubResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runOrderDebug = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('wp_auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/debug/orders', {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      setOrderResult(data);
    } catch (error: any) {
      setOrderResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runAddressDebug = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('wp_auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/debug/addresses', {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      setAddressResult(data);
    } catch (error: any) {
      setAddressResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '2rem' }}>Subscription Debug</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={runSubDebug}
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
          {loading ? 'Running...' : 'Check Subscriptions'}
        </button>

        <button
          onClick={runOrderDebug}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Running...' : 'Check Orders'}
        </button>

        <button
          onClick={runAddressDebug}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Running...' : 'Check Addresses'}
        </button>
      </div>

      {subResult && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Subscriptions Result:</h2>
          <pre style={{
            background: '#2a2a2a',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '600px',
          }}>
            {JSON.stringify(subResult, null, 2)}
          </pre>
        </div>
      )}

      {orderResult && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Orders Result:</h2>
          <pre style={{
            background: '#2a2a2a',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '600px',
          }}>
            {JSON.stringify(orderResult, null, 2)}
          </pre>
        </div>
      )}

      {addressResult && (
        <div>
          <h2>Addresses Result:</h2>
          <pre style={{
            background: '#2a2a2a',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '600px',
          }}>
            {JSON.stringify(addressResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
