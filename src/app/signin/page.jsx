"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  const handleCredentialsSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center font-albert-sans">
      <div className="bg-card text-card-foreground p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-border">
        <h2 className="text-3xl font-bold text-foreground mb-6">Gridle</h2>
        <p className="text-xl font-semibold text-foreground mb-8">Sign in</p>

        {/* Credentials Form */}
        <form className="space-y-4" onSubmit={handleCredentialsSignIn}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-border rounded-lg bg-input text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-border rounded-lg bg-input text-foreground"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-semibold hover:bg-accent transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Links */}
        <p className="mt-6 text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
        <p className="mt-2 text-muted-foreground">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </p>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-border" />
          <span className="px-3 text-muted-foreground">OR</span>
          <hr className="flex-grow border-border" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center p-3 border border-border rounded-lg text-foreground font-semibold hover:bg-muted/50 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12.24 10.284V13.784H17.474C17.384 14.374 17.064 15.174 16.514 15.934C15.964 16.694 15.224 17.304 14.354 17.764L14.334 17.794L17.794 20.444C17.714 20.554 17.634 20.664 17.544 20.764C16.574 21.604 15.344 22.254 14.004 22.654C12.664 23.054 11.264 23.254 9.804 23.254C6.184 23.254 3.164 21.904 0.994 19.144L0.964 19.114L0.864 19.014L3.894 16.644C4.544 17.074 5.374 17.354 6.364 17.514C7.354 17.674 8.444 17.754 9.614 17.754C11.524 17.754 13.064 17.304 14.284 16.394L14.364 16.334C15.194 15.744 15.864 14.974 16.364 14.074C16.864 13.174 17.184 12.164 17.304 11.084L17.334 11.014L12.24 10.284Z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
