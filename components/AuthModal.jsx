'use client';
import {X} from "lucide-react";
import {useAuth} from "@/app/context/AuthContext";
import {useState, useEffect} from "react";

export default function AuthModal() {
    const {
        authModalOpen,
        isLogin,
        closeAuthModal,
        login,
        signup,
        setIsLogin
    } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // ✅ Disable page scroll when modal is open
    useEffect(() => {
        if (authModalOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";

        return () => (document.body.style.overflow = "");
    }, [authModalOpen]);

    // ✅ Reset inputs whenever modal closes
    useEffect(() => {
        if (!authModalOpen) {
            setName("");
            setEmail("");
            setPassword("");
        }
    }, [authModalOpen]);

    // ✅ Reset inputs whenever switching between login/signup
    useEffect(() => {
        setName("");
        setEmail("");
        setPassword("");
    }, [isLogin]);

    if (!authModalOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) login(email, password);
        else signup(name, email, password);
    };

    const inputClass =
        "border border-green-300 rounded w-full p-2 text-sm outline-none " +
        "focus:border-green-500 focus:ring-1 focus:ring-green-200 transition";

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-8 relative">
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
                >
                    <X size={22}/>
                </button>

                <h2 className="text-2xl font-semibold text-center text-slate-700 mb-6">
                    {isLogin ? "Welcome Back 👋" : "Create Your Account"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            className={inputClass}
                            placeholder="Enter your name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}

                    <input
                        className={inputClass}
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                    />

                    <input
                        className={inputClass}
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                    />

                    <button
                        type="submit"
                        className="w-full py-2.5 rounded bg-green-500 hover:bg-green-600 text-white transition"
                    >
                        {isLogin ? "Login" : "Signup"}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-600 mt-4">
                    {isLogin ? (
                        <>
                            Don’t have an account?{" "}
                            <button
                                className="text-green-500 hover:underline"
                                onClick={() => setIsLogin(false)}
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                className="text-green-500 hover:underline"
                                onClick={() => setIsLogin(true)}
                            >
                                Log in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}