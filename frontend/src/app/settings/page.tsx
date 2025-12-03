"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, User } from "@/lib/api";
import {
  IconArrowLeft,
  IconUser,
  IconBell,
  IconLoading,
  IconCheck,
  IconLogout,
  IconTrash,
  IconWarning,
} from "@/components/icons";
import { cn } from "@/lib/utils";

// Lock icon for security section
function IconLock({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

type SettingsTab = "profile" | "security" | "notifications";

interface NotificationSettings {
  analysisComplete: boolean;
  analysisFailed: boolean;
  emailNotifications: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    analysisComplete: true,
    analysisFailed: true,
    emailNotifications: false,
  });

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadUser();
  }, [router]);

  async function loadUser() {
    try {
      setLoading(true);
      const userData = await authApi.getMe();
      setUser(userData);
      setUsername(userData.username);
      setEmail(userData.email);
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setSaveSuccess(false);
    try {
      // API call would go here
      // await usersApi.updateProfile({ username, email });
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    setSaving(true);
    try {
      // API call would go here
      // await authApi.changePassword(currentPassword, newPassword);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setPasswordError("비밀번호 변경에 실패했습니다");
      console.error("Failed to change password:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    authApi.logout();
    router.push("/login");
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "계정 삭제") {
      return;
    }

    try {
      // API call would go here
      // await usersApi.deleteAccount();
      authApi.logout();
      router.push("/login");
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  }

  const tabs = [
    { id: "profile" as const, label: "프로필", icon: IconUser },
    { id: "security" as const, label: "보안", icon: IconLock },
    { id: "notifications" as const, label: "알림", icon: IconBell },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="flex flex-col items-center gap-3 animate-fadeIn">
          <IconLoading size={32} className="text-gray-400" />
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-10">
        <div className="px-5 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <IconArrowLeft size={18} />
          </Link>
          <h1 className="text-base font-semibold text-gray-900">설정</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-8 animate-fadeInUp">
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <IconCheck size={16} className="text-green-600" />
            </div>
            <p className="text-sm text-green-700">변경사항이 저장되었습니다</p>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200"
              >
                <IconLogout size={18} />
                로그아웃
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">프로필 설정</h2>
                  <p className="text-sm text-gray-500">계정 정보를 관리합니다</p>
                </div>

                <div className="card p-6 space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      사용자 이름
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field text-sm"
                      placeholder="사용자 이름"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field text-sm"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      가입일
                    </label>
                    <p className="text-sm text-gray-500">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl shadow-sm hover:bg-gray-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {saving && <IconLoading size={16} />}
                      저장
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">보안 설정</h2>
                  <p className="text-sm text-gray-500">비밀번호 및 계정 보안을 관리합니다</p>
                </div>

                {/* Change Password */}
                <div className="card p-6 space-y-5">
                  <h3 className="text-sm font-semibold text-gray-900">비밀번호 변경</h3>

                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fadeIn">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field text-sm"
                      placeholder="현재 비밀번호 입력"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field text-sm"
                      placeholder="8자 이상 입력"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field text-sm"
                      placeholder="새 비밀번호 재입력"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl shadow-sm hover:bg-gray-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {saving && <IconLoading size={16} />}
                      비밀번호 변경
                    </button>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="card p-6 border-red-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconWarning size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">계정 삭제</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                      </p>
                    </div>
                  </div>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      계정 삭제하기
                    </button>
                  ) : (
                    <div className="space-y-3 animate-fadeIn">
                      <p className="text-sm text-gray-700">
                        계정 삭제를 확인하려면 <strong>&quot;계정 삭제&quot;</strong>를 입력하세요.
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="input-field text-sm"
                        placeholder="계정 삭제"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText("");
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== "계정 삭제"}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <IconTrash size={16} className="inline mr-1" />
                          삭제 확인
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">알림 설정</h2>
                  <p className="text-sm text-gray-500">알림 수신 방법을 설정합니다</p>
                </div>

                <div className="card p-6 space-y-5">
                  <h3 className="text-sm font-semibold text-gray-900">푸시 알림</h3>

                  {/* Analysis Complete */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">분석 완료</p>
                      <p className="text-xs text-gray-500">계약서 분석이 완료되면 알림을 받습니다</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          analysisComplete: !prev.analysisComplete,
                        }))
                      }
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
                        notifications.analysisComplete ? "bg-gray-900" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                          notifications.analysisComplete ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Analysis Failed */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">분석 실패</p>
                      <p className="text-xs text-gray-500">계약서 분석이 실패하면 알림을 받습니다</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          analysisFailed: !prev.analysisFailed,
                        }))
                      }
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
                        notifications.analysisFailed ? "bg-gray-900" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                          notifications.analysisFailed ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <hr className="border-gray-100" />

                  <h3 className="text-sm font-semibold text-gray-900">이메일 알림</h3>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">이메일로 알림 받기</p>
                      <p className="text-xs text-gray-500">중요한 알림을 이메일로도 받습니다</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailNotifications: !prev.emailNotifications,
                        }))
                      }
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
                        notifications.emailNotifications ? "bg-gray-900" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                          notifications.emailNotifications ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl shadow-sm hover:bg-gray-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {saving && <IconLoading size={16} />}
                    저장
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
