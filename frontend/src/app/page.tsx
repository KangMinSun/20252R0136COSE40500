"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Contract, contractsApi, authApi, User, Notification } from "@/lib/api";
import {
  IconUpload,
  IconDocument,
  IconCheck,
  IconWarning,
  IconDanger,
  IconLoading,
  IconChevronRight,
  IconTrash,
  IconLogout,
  IconBell,
  IconSettings,
  IconPlus,
  IconUser,
  IconClose,
} from "@/components/icons";
import { cn } from "@/lib/utils";

// 지원 파일 형식 정의
const SUPPORTED_FORMATS = {
  document: {
    extensions: [".pdf", ".hwp", ".hwpx", ".docx", ".doc", ".txt", ".rtf", ".md"],
    mimeTypes: [
      "application/pdf",
      "application/x-hwp",
      "application/haansofthwp",
      "application/vnd.hancom.hwp",
      "application/vnd.hancom.hwpx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "text/markdown",
      "application/rtf",
    ],
  },
  image: {
    extensions: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff", ".tif"],
    mimeTypes: [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ],
  },
};

const ALL_EXTENSIONS = [
  ...SUPPORTED_FORMATS.document.extensions,
  ...SUPPORTED_FORMATS.image.extensions,
];

const ACCEPT_STRING = [
  ...ALL_EXTENSIONS,
  ...SUPPORTED_FORMATS.document.mimeTypes,
  ...SUPPORTED_FORMATS.image.mimeTypes,
].join(",");

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : "";
}

function isValidFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return ALL_EXTENSIONS.includes(ext);
}

function getFileTypeLabel(extension: string): string {
  const ext = extension.toLowerCase();
  if (ext === ".pdf") return "PDF";
  if (ext === ".hwp") return "HWP";
  if (ext === ".hwpx") return "HWPX";
  if ([".docx", ".doc"].includes(ext)) return "Word";
  if ([".txt", ".md", ".rtf"].includes(ext)) return "Text";
  if (SUPPORTED_FORMATS.image.extensions.includes(ext)) return "Image";
  return "File";
}

function getFileIconColor(extension: string): string {
  const ext = extension.toLowerCase();
  if (ext === ".pdf") return "bg-red-100 text-red-500";
  if ([".hwp", ".hwpx"].includes(ext)) return "bg-blue-100 text-blue-500";
  if ([".docx", ".doc"].includes(ext)) return "bg-blue-100 text-blue-600";
  if ([".txt", ".md", ".rtf"].includes(ext)) return "bg-gray-100 text-gray-500";
  if (SUPPORTED_FORMATS.image.extensions.includes(ext)) return "bg-purple-100 text-purple-500";
  return "bg-gray-100 text-gray-500";
}

function getRiskBadge(riskLevel: string | null) {
  if (!riskLevel) return null;

  const level = riskLevel.toLowerCase();
  if (level === "high" || level === "danger") {
    return (
      <span className="badge badge-danger">
        <IconDanger size={12} />
        High
      </span>
    );
  }
  if (level === "medium" || level === "warning") {
    return (
      <span className="badge badge-warning">
        <IconWarning size={12} />
        Medium
      </span>
    );
  }
  return (
    <span className="badge badge-success">
      <IconCheck size={12} />
      Low
    </span>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="badge badge-success">
          <IconCheck size={12} />
          완료
        </span>
      );
    case "PROCESSING":
      return (
        <span className="badge badge-neutral">
          <IconLoading size={12} />
          분석중
        </span>
      );
    case "PENDING":
      return (
        <span className="badge badge-neutral">
          대기중
        </span>
      );
    case "FAILED":
      return (
        <span className="badge badge-danger">
          <IconDanger size={12} />
          실패
        </span>
      );
    default:
      return null;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDate(dateString);
}

// Generate notifications from contracts
function generateNotifications(contracts: Contract[], readIds: Set<string>): Notification[] {
  return contracts
    .filter((c) => c.status === "COMPLETED" || c.status === "FAILED")
    .slice(0, 5)
    .map((c) => ({
      id: `notif-${c.id}`,
      type: c.status === "COMPLETED" ? "analysis_complete" as const : "analysis_failed" as const,
      title: c.status === "COMPLETED" ? "분석 완료" : "분석 실패",
      message: c.title,
      contract_id: c.id,
      contract_title: c.title,
      read: readIds.has(`notif-${c.id}`),
      created_at: c.created_at,
    }));
}

// Notification Dropdown Component
function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  onNavigate,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (contractId: number) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-strong overflow-hidden animate-fadeInDown z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">알림</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <IconBell size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">알림이 없습니다</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => {
                onMarkAsRead(notif.id);
                if (notif.contract_id) {
                  onNavigate(notif.contract_id);
                }
                onClose();
              }}
              className={cn(
                "w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0",
                notif.read && "opacity-60"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                notif.type === "analysis_complete" ? "bg-green-100" : "bg-red-100"
              )}>
                {notif.type === "analysis_complete" ? (
                  <IconCheck size={16} className="text-green-600" />
                ) : (
                  <IconDanger size={16} className="text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notif.created_at)}</p>
              </div>
            </button>
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            모두 읽음으로 표시
          </button>
        </div>
      )}
    </div>
  );
}

// User Menu Dropdown Component
function UserMenuDropdown({
  user,
  isOpen,
  onClose,
  onLogout,
}: {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-strong overflow-hidden animate-fadeInDown z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{user?.username || "사용자"}</p>
        <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
      </div>
      <div className="py-1">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <IconSettings size={16} className="text-gray-400" />
          설정
        </Link>
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <IconLogout size={16} className="text-gray-400" />
          로그아웃
        </button>
      </div>
    </div>
  );
}

// Upload Sidebar Component
function UploadSidebar({
  isOpen,
  onClose,
  onUploadSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile) && droppedFile.size <= MAX_FILE_SIZE) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile) && selectedFile.size <= MAX_FILE_SIZE) {
      setFile(selectedFile);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      await contractsApi.upload(file);
      setUploadSuccess(true);
      setTimeout(() => {
        onUploadSuccess();
        handleReset();
        onClose();
      }, 1500);
    } catch {
      // Error handling
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadSuccess(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        handleReset();
      }, 300);
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">계약서 업로드</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(100%-4rem)] overflow-y-auto">
          {uploadSuccess ? (
            <div className="flex flex-col items-center justify-center h-full animate-scaleIn">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <IconCheck size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">업로드 완료</h3>
              <p className="text-sm text-gray-500 text-center">
                AI 분석이 시작되었습니다
              </p>
            </div>
          ) : !file ? (
            <div className="space-y-6">
              {/* Upload Area - Modern Design */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative group cursor-pointer rounded-2xl transition-all duration-300 overflow-hidden",
                  isDragging
                    ? "ring-2 ring-gray-900 ring-offset-4"
                    : "hover:ring-2 hover:ring-gray-200 hover:ring-offset-2"
                )}
              >
                <div className={cn(
                  "relative p-10 text-center bg-gradient-to-br from-gray-50 via-white to-gray-50 transition-all duration-300",
                  isDragging && "from-gray-100 via-gray-50 to-gray-100"
                )}>
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute top-4 left-4 w-24 h-24 border border-gray-900 rounded-2xl" />
                    <div className="absolute bottom-4 right-4 w-16 h-16 border border-gray-900 rounded-xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-gray-900 rounded-3xl rotate-12" />
                  </div>

                  <div className={cn(
                    "relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 transition-all duration-300",
                    isDragging
                      ? "bg-gray-900 text-white scale-110"
                      : "bg-gray-100 text-gray-400 group-hover:bg-gray-900 group-hover:text-white group-hover:scale-105"
                  )}>
                    <IconUpload size={28} />
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {isDragging ? "여기에 놓으세요" : "계약서 업로드"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    드래그하여 놓거나 클릭하여 선택
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <IconDocument size={16} />
                    파일 선택
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_STRING}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <p className="text-xs text-gray-400 mt-4">PDF, HWP, Word, TXT, 이미지 (최대 50MB)</p>
                </div>
              </div>

              {/* Supported Formats */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">지원 형식</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["PDF", "HWP", "DOCX", "TXT"].map((fmt) => (
                    <span key={fmt} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {fmt}
                    </span>
                  ))}
                  {["PNG", "JPG"].map((fmt) => (
                    <span key={fmt} className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded">
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Process Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">분석 과정</h4>
                <div className="space-y-2">
                  {[
                    "문서 파싱 및 텍스트 추출",
                    "AI가 위험 조항 식별",
                    "법률 근거 기반 분석",
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        {i + 1}
                      </span>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeInUp">
              {/* Selected File */}
              <div className="p-5 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", getFileIconColor(getFileExtension(file.name)))}>
                    <IconDocument size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-gray-200 text-gray-600 rounded">
                        {getFileTypeLabel(getFileExtension(file.name))}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={uploading}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
                  >
                    <IconClose size={18} />
                  </button>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium text-white bg-gray-900 rounded-xl shadow-sm hover:bg-gray-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? (
                  <>
                    <IconLoading size={18} />
                    분석 중...
                  </>
                ) : (
                  <>
                    <IconUpload size={18} />
                    AI 분석 시작
                  </>
                )}
              </button>

              {/* Change File */}
              <label className="block text-center">
                <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
                  다른 파일 선택
                </span>
                <input
                  type="file"
                  accept={ACCEPT_STRING}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUploadSidebar, setShowUploadSidebar] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push("/login");
      return;
    }

    loadContracts();
    loadUser();
  }, [router]);

  // 분석 중인 계약서가 있으면 자동으로 상태 업데이트
  const hasPendingOrProcessing = contracts.some(
    (c) => c.status === "PENDING" || c.status === "PROCESSING"
  );

  useEffect(() => {
    if (!hasPendingOrProcessing) return;

    const interval = setInterval(async () => {
      try {
        const data = await contractsApi.list();
        setContracts(data);
      } catch {
        // Silently fail - will retry on next interval
      }
    }, 5000); // 5초마다 체크

    return () => clearInterval(interval);
  }, [hasPendingOrProcessing]);

  async function loadContracts() {
    try {
      setLoading(true);
      const data = await contractsApi.list();
      setContracts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "계약서 목록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  async function loadUser() {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch {
      // Silently fail - user info is optional for UI
    }
  }

  const notifications = generateNotifications(contracts, readNotificationIds);
  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleMarkAsRead(id: string) {
    setReadNotificationIds((prev) => new Set([...prev, id]));
  }

  function handleMarkAllAsRead() {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds((prev) => new Set([...prev, ...allIds]));
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("이 계약서를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setDeletingId(id);
      await contractsApi.delete(id);
      setContracts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다");
    } finally {
      setDeletingId(null);
    }
  }

  function handleLogout() {
    authApi.logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="flex flex-col items-center gap-3 animate-fadeIn">
          <IconLoading size={32} className="text-gray-400" />
          <p className="text-sm text-gray-500">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-20">
        <div className="px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="DocScanner AI"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <h1 className="text-base font-semibold text-gray-900">DocScanner AI</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Upload Button */}
            <button
              onClick={() => setShowUploadSidebar(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full shadow-sm hover:bg-gray-800 hover:shadow-md active:shadow-sm transition-all duration-200"
            >
              <IconPlus size={16} />
              업로드
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-2" />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className={cn(
                  "relative p-2 rounded-full transition-all duration-200",
                  showNotifications
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                <IconBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                notifications={notifications}
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                onNavigate={(id) => router.push(`/analysis/${id}`)}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </div>

            {/* Settings */}
            <Link
              href="/settings"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <IconSettings size={20} />
            </Link>

            {/* User Menu */}
            <div className="relative ml-1">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-full transition-all duration-200",
                  showUserMenu
                    ? "bg-gray-100"
                    : "hover:bg-gray-100"
                )}
              >
                <div className="w-7 h-7 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                  {user?.username?.charAt(0).toUpperCase() || <IconUser size={14} />}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
                  {user?.username || "사용자"}
                </span>
              </button>
              <UserMenuDropdown
                user={user}
                isOpen={showUserMenu}
                onClose={() => setShowUserMenu(false)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-6 animate-fadeInUp">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">계약서 목록</h2>
          <p className="text-sm text-gray-500 mt-1">
            총 <span className="font-medium text-gray-700">{contracts.length}</span>건의 계약서
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl shadow-sm animate-fadeIn">
            {error}
          </div>
        )}

        {contracts.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
              <IconDocument size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-600 mb-1 font-medium">등록된 계약서가 없습니다</p>
            <p className="text-sm text-gray-400 mb-6">첫 번째 계약서를 업로드해보세요</p>
            <button
              onClick={() => setShowUploadSidebar(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 hover:shadow-lg active:shadow-md transition-all duration-200"
            >
              <IconUpload size={16} />
              계약서 업로드하기
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    위험도
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.map((contract, index) => (
                  <tr
                    key={contract.id}
                    className={cn(
                      "group table-row-hover cursor-pointer",
                      deletingId === contract.id && "opacity-50 pointer-events-none"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      if (contract.status === "COMPLETED") {
                        router.push(`/analysis/${contract.id}`);
                      }
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-9 h-9 bg-gray-100 rounded-[10px] flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                          <IconDocument size={18} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-xs group-hover:text-gray-700 transition-colors">
                          {contract.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-5 py-4">
                      {contract.status === "COMPLETED" && getRiskBadge(contract.risk_level)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500">
                        {formatDate(contract.created_at)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleDelete(contract.id, e)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                          disabled={deletingId === contract.id}
                          title="삭제"
                        >
                          {deletingId === contract.id ? (
                            <IconLoading size={16} />
                          ) : (
                            <IconTrash size={16} />
                          )}
                        </button>
                        {contract.status === "COMPLETED" && (
                          <div className="p-2 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all duration-200">
                            <IconChevronRight size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Upload Sidebar */}
      <UploadSidebar
        isOpen={showUploadSidebar}
        onClose={() => setShowUploadSidebar(false)}
        onUploadSuccess={loadContracts}
      />
    </div>
  );
}
