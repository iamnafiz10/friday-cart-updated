'use client';
import {useEffect, useState} from "react";
import {X, User, Lock, Trash2, Upload} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ManageAccountModal({isOpen, onClose, user, setUser}) {
    const [activeTab, setActiveTab] = useState("profile");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState(user?.image || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [uploading, setUploading] = useState(false);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setActiveTab("profile");
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setDeletePassword("");
        } else {
            document.body.style.overflow = "";
        }
        return () => (document.body.style.overflow = "");
    }, [isOpen]);

    if (!isOpen) return null;

    // ✅ Handle image upload to ImageKit
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("userId", user.id);

            const res = await fetch("/api/imagekit-upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            setImage(data.url); // preview updated image
            toast.success("Image uploaded successfully!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    // ✅ Update profile
    const handleUpdateProfile = async () => {
        try {
            const res = await fetch("/api/user/update", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    id: user.id,
                    name: name || user.name,
                    email: email || user.email,
                    image: image || user.image,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");

            toast.success("Profile updated successfully!");

            if (setUser) setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.dispatchEvent(new Event("user-updated"));

            setName("");
            setEmail("");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ✅ Update password
    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword)
            return toast.error("Enter both password fields");

        try {
            const res = await fetch("/api/user/update-password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: user.id, password, confirmPassword}),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");

            toast.success("Password updated. Logging out...");
            localStorage.removeItem("user");
            setTimeout(() => (window.location.href = "/"), 1200);
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ✅ Delete account
    const handleDeleteAccount = async () => {
        if (!deletePassword) return toast.error("Enter your password");

        try {
            const res = await fetch("/api/user/delete", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: user.id, password: deletePassword}),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Delete failed");

            toast.success("Account deleted");
            localStorage.removeItem("user");
            setTimeout(() => (window.location.href = "/"), 1000);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <>
            {/* BACKDROP */}
            <div
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 overflow-y-auto px-3 sm:px-0">
                <div
                    className="relative bg-white w-full max-w-2xl sm:rounded-2xl shadow-2xl animate-fadeIn overflow-hidden my-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 rounded-md p-1 text-slate-600 hover:text-slate-800 z-10"
                    >
                        <X size={20}/>
                    </button>

                    <div className="flex flex-col sm:flex-row min-h-[400px]">
                        {/* LEFT SIDEBAR */}
                        <div
                            className="sm:w-1/3 bg-white border-b sm:border-b-0 sm:border-r border-green-50 flex flex-col">
                            <div className="px-5 py-4">
                                <h3 className="text-lg font-semibold text-black text-center sm:text-left">
                                    Manage Account
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 text-center sm:text-left">
                                    Settings & security
                                </p>
                            </div>

                            <nav
                                className="flex flex-row sm:flex-col justify-center sm:justify-start gap-2 sm:gap-0 px-3 sm:px-0 pb-2 sm:pb-0">
                                <button
                                    onClick={() => setActiveTab("profile")}
                                    className={`flex items-center justify-center sm:justify-start gap-2 sm:px-5 sm:py-3 py-2 px-4 text-sm rounded-md sm:rounded-none ${
                                        activeTab === "profile"
                                            ? "text-green-500 font-semibold bg-green-50 sm:bg-transparent"
                                            : "text-black hover:bg-green-50"
                                    }`}
                                >
                                    <User size={16}/> Profile
                                </button>

                                <button
                                    onClick={() => setActiveTab("security")}
                                    className={`flex items-center justify-center sm:justify-start gap-2 sm:px-5 sm:py-3 py-2 px-4 text-sm rounded-md sm:rounded-none ${
                                        activeTab === "security"
                                            ? "text-green-500 font-semibold bg-green-50 sm:bg-transparent"
                                            : "text-black hover:bg-green-50"
                                    }`}
                                >
                                    <Lock size={16}/> Security
                                </button>
                            </nav>
                        </div>

                        {/* RIGHT CONTENT */}
                        <div className="flex-1 p-5 sm:p-6">
                            {activeTab === "profile" && (
                                <div>
                                    <h4 className="text-xl font-semibold text-black mb-4 text-center sm:text-left">
                                        Profile Details
                                    </h4>

                                    {/* ✅ IMAGE SECTION */}
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                                        <div
                                            className="w-20 h-20 rounded-full overflow-hidden border border-green-100 bg-green-50 flex items-center justify-center">
                                            {user?.image || image ? (
                                                <Image
                                                    src={image || user.image}
                                                    alt="User Avatar"
                                                    width={80}
                                                    height={80}
                                                    className="object-cover w-full h-full rounded-full"
                                                />
                                            ) : (
                                                <User className="text-green-500" size={36}/>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 text-center sm:text-left">
                                            <label
                                                className="inline-flex items-center gap-2 justify-center px-3 py-2 text-sm rounded-md bg-green-50 text-green-500 hover:bg-green-100 cursor-pointer">
                                                <Upload size={14}/>
                                                {uploading ? "Uploading..." : "Update image"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-slate-500">Recommended: square image</p>
                                        </div>
                                    </div>

                                    {/* NAME */}
                                    <div className="mb-4">
                                        <label className="block text-sm text-black mb-1">Name</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter new name"
                                            className="w-full rounded-md border border-green-100 px-3 py-2 focus:ring-2 focus:ring-green-200 outline-none"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Current: <span className="font-medium text-black">{user?.name || "-"}</span>
                                        </p>
                                    </div>

                                    {/* EMAIL */}
                                    <div className="mb-6">
                                        <label className="block text-sm text-black mb-1">Email</label>
                                        <input
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter new email"
                                            className="w-full rounded-md border border-green-100 px-3 py-2 focus:ring-2 focus:ring-green-200 outline-none"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Current: <span
                                            className="font-medium text-black">{user?.email || "-"}</span>
                                        </p>
                                    </div>

                                    <div className="flex justify-center sm:justify-end">
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                        >
                                            Update Profile
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div>
                                    <h4 className="text-xl font-semibold text-black mb-4 text-center sm:text-left">
                                        Security
                                    </h4>

                                    <div className="mb-4">
                                        <label className="block text-sm text-black mb-1">New password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full rounded-md border border-green-100 px-3 py-2 focus:ring-2 focus:ring-green-200 outline-none"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm text-black mb-1">Confirm password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full rounded-md border border-green-100 px-3 py-2 focus:ring-2 focus:ring-green-200 outline-none"
                                        />
                                    </div>

                                    <div className="flex justify-center sm:justify-end mb-6">
                                        <button
                                            onClick={handleUpdatePassword}
                                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                        >
                                            Update Password
                                        </button>
                                    </div>

                                    <div className="flex justify-center sm:justify-end border-t border-green-50 pt-4">
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 size={16}/> Delete account
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* DELETE CONFIRM */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-3">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl animate-fadeIn">
                        <h5 className="text-lg font-semibold text-red-600 mb-3">Confirm Delete Account</h5>
                        <p className="text-sm text-slate-600 mb-4">
                            Please enter your password to confirm. This action is <strong>permanent</strong>.
                        </p>
                        <input
                            type="password"
                            placeholder="Your password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full rounded-md border border-red-100 px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-red-200"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletePassword("");
                                }}
                                className="px-4 py-2 rounded-md border"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
              .animate-fadeIn {
                animation: fadeIn 0.18s ease-in-out;
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}</style>
        </>
    );
}