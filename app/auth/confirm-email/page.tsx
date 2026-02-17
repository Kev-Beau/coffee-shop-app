'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Coffee, Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'checking' | 'success' | 'waiting' | 'error'>('checking');
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get email from query params or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('signup_email');
    setEmail(emailParam || storedEmail || '');

    // Check if user is already confirmed
    checkSession();
  }, []);

  const checkSession = async () => {
    if (!supabase) {
      setStatus('error');
      setMessage('Supabase is not configured');
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // User is confirmed and logged in
      setStatus('success');
      setMessage('Email confirmed! Redirecting you to onboarding...');
      setTimeout(() => {
        router.push('/onboarding');
      }, 2000);
    } else {
      // User needs to confirm email
      setStatus('waiting');
    }
    setLoading(false);
  };

  const handleResendEmail = async () => {
    setResending(true);
    setMessage('');

    try {
      if (!email) {
        setMessage('No email found. Please start the signup process again.');
        setStatus('error');
        setResending(false);
        return;
      }

      // For resending, we'd need to store the password or have them sign up again
      // For now, redirect to signup
      router.push(`/auth/signup?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      setMessage('Failed to resend email. Please try again.');
      setStatus('error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark rounded-3xl shadow-xl">
            <Coffee className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Beany</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Checking your email status...</p>
            </div>
          ) : status === 'success' ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Beany!</h2>
              <p className="text-gray-600">{message}</p>
            </div>
          ) : status === 'waiting' ? (
            <div className="text-center">
              {/* Mail Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Check your email
              </h2>

              <p className="text-gray-600 mb-6">
                We've sent a confirmation link to{' '}
                <span className="font-semibold text-gray-900">{email || 'your email'}</span>
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Can't find it?
                </h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Add <strong>no-reply@beany.app</strong> to your contacts</li>
                  <li>• Wait a few minutes for delivery</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={checkSession}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
                >
                  I've confirmed my email
                </button>

                <button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full bg-white text-primary border-2 border-primary py-3 rounded-lg font-semibold hover:bg-primary-lighter transition disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend email'}
                </button>
              </div>

              {message && (
                <p className="mt-4 text-sm text-gray-600">{message}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => router.push('/auth/signup')}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                Start Over
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Having trouble? Contact us at{' '}
          <a href="mailto:support@beany.app" className="text-primary hover:underline">
            support@beany.app
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}
