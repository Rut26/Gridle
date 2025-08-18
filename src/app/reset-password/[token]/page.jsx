"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: params.token, 
          password 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Password updated successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 rounded-[30px] bg-[#f3f4f6]">
        <h1 className="text-[24px] font-bold text-[#1E3A8A] text-center mb-4">
          Reset Password
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              id="password"
              type="password"
              className="h-[52px] px-4 rounded-xl border border-[#767676]"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Label htmlFor="password" className="absolute left-2 -top-2.5 bg-[#f3f4f6] px-1 text-xs text-[#767676]">
              New Password
            </Label>
          </div>

          <div className="relative">
            <Input
              id="confirmPassword"
              type="password"
              className="h-[52px] px-4 rounded-xl border border-[#767676]"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
            <Label htmlFor="confirmPassword" className="absolute left-2 -top-2.5 bg-[#f3f4f6] px-1 text-xs text-[#767676]">
              Confirm Password
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-[52px] bg-[#1E3A8A] hover:bg-[#3B82F6] text-white font-bold text-base rounded-full"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 text-center rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 text-center rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-[#767676]">
            Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.
          </p>
        </div>
      </Card>
    </div>
  );
}