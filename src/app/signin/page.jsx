// src/app/signin/page.jsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center font-albert-sans">
      <div className="bg-card text-card-foreground p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-border">
        <h2 className="text-3xl font-bold text-foreground mb-6">Gridle</h2>
        <p className="text-xl font-semibold text-foreground mb-8">Sign in</p>
        <form className="space-y-4" onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-input text-foreground"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-semibold hover:bg-accent transition-colors duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        <p className="mt-6 text-muted-foreground">Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link></p>
        <p className="mt-2 text-muted-foreground"><Link href="/forgot-password" className="text-primary hover:underline">Forgot password?</Link></p>
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-border" />
          <span className="px-3 text-muted-foreground">OR</span>
          <hr className="flex-grow border-border" />
        </div>
        <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center p-3 border border-border rounded-lg text-foreground font-semibold hover:bg-muted/50 transition-colors duration-200">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12.24 10.284V13.784H17.474C17.384 14.374 17.064 15.174 16.514 15.934C15.964 16.694 15.224 17.304 14.354 17.764L14.334 17.794L17.794 20.444C17.714 20.554 17.634 20.664 17.544 20.764C16.574 21.604 15.344 22.254 14.004 22.654C12.664 23.054 11.264 23.254 9.804 23.254C6.184 23.254 3.164 21.904 0.994 19.144L0.964 19.114L0.864 19.014L3.894 16.644C4.544 17.074 5.374 17.354 6.364 17.514C7.354 17.674 8.444 17.754 9.614 17.754C11.524 17.754 13.064 17.304 14.284 16.394L14.364 16.334C15.194 15.744 15.864 14.974 16.364 14.074C16.864 13.174 17.184 12.164 17.304 11.084L17.334 11.014L12.24 10.284Z" fill="#EA4335"/><path d="M23.084 11.084L23.054 10.974L23.084 11.084Z" fill="#FBBC04"/><path d="M0 12.004C0 12.824 0.08 13.624 0.23 14.394C0.29 14.674 0.38 14.954 0.49 15.224L3.48 12.924L3.46 12.904C3.21 12.354 3.09 11.754 3.09 11.134C3.09 10.514 3.21 9.914 3.46 9.364L0.49 7.064C0.38 7.334 0.29 7.614 0.23 7.894C0.08 8.664 0 9.464 0 10.284V12.004Z" fill="#4285F4"/><path d="M23.084 11.084C23.084 11.084 23.084 11.084 23.084 11.084V11.084Z" fill="#34A853"/></svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}