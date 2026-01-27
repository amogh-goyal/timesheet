"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LoginType } from "@/types";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");
    const error = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(
        error ? "Invalid credentials" : null
    );

    const handleLogin = async (loginType: LoginType) => {
        setIsLoading(true);
        setLoginError(null);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                loginType,
                redirect: false,
            });

            if (result?.error) {
                if (result.error.includes("Admin role required")) {
                    setLoginError("Access denied: You don't have admin privileges");
                } else {
                    setLoginError("Invalid email or password");
                }
                setIsLoading(false);
                return;
            }

            // Redirect based on login type
            if (loginType === "admin") {
                router.push(callbackUrl || "/admin/dashboard");
            } else {
                router.push(callbackUrl || "/timesheet");
            }
        } catch {
            setLoginError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
            {/* Admin login - small corner button */}
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-700/50"
                onClick={() => handleLogin("admin")}
                disabled={isLoading || !email || !password}
            >
                Admin Login
            </Button>

            <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Timesheet
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your credentials to access your timesheet
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loginError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {loginError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            disabled={isLoading}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && email && password) {
                                    handleLogin("employee");
                                }
                            }}
                        />
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-5 text-lg"
                        onClick={() => handleLogin("employee")}
                        disabled={isLoading || !email || !password}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <svg
                                    className="animate-spin h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Signing in...
                            </div>
                        ) : (
                            "Login as Employee"
                        )}
                    </Button>

                    <p className="text-center text-sm text-slate-500 mt-4">
                        Use the top-right button for admin access
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function LoginFallback() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFallback />}>
            <LoginForm />
        </Suspense>
    );
}
