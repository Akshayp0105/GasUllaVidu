"use client";
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function AuthErrorPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#07090f',
      flexDirection: 'column',
      gap: '1rem',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
    }}>
      <AlertTriangle size={48} color="#f97316" />
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Authentication Error</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '320px' }}>
        Something went wrong during sign-in. Please try again.
      </p>
      <Link href="/auth/signin" style={{
        padding: '0.7rem 1.5rem',
        background: '#2563eb',
        borderRadius: '10px',
        color: 'white',
        fontWeight: 600,
        marginTop: '0.5rem',
      }}>
        Back to Sign In
      </Link>
    </div>
  );
}
