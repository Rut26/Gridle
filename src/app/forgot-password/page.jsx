"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMessage("A password reset link has been sent to your email. Please check your inbox.");
    } else {
      setMessage("Error sending reset link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 rounded-[30px] bg-[#f3f4f6]">
        <h1 className="text-[24px] font-bold text-[#1E3A8A] text-center mb-4">
          Forgot Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              id="email"
              type="email"
              className="h-[52px] px-4 rounded-xl border border-[#767676]"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Label htmlFor="email" className="absolute left-2 -top-2.5 bg-[#f3f4f6] px-1 text-xs text-[#767676]">
              Email
            </Label>
          </div>
          <Button className="w-full h-[52px] bg-[#1E3A8A] hover:bg-[#3B82F6] text-white font-bold text-base rounded-full">
            Reset Password
          </Button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 text-center rounded-lg">
            {message}
          </div>
        )}
      </Card>
    </div>
  );
}
