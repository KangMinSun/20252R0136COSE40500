"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Contract, contractsApi, authApi, User } from "@/lib/api";
import {
  IconUpload,
  IconDocument,
  IconCheck,
  IconWarning,
  IconDanger,
  IconLoading,
  IconChevronRight,
  IconScan,
  IconChecklist,
} from "@/components/icons";
import { cn } from "@/lib/utils";

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
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadContracts();
    loadUser();
  }, []);

  // Auto-refresh for pending/processing contracts
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
        // Silently fail
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [hasPendingOrProcessing]);

  async function loadContracts() {
    try {
      setLoading(true);
      const data = await contractsApi.list();
      setContracts(data);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }

  async function loadUser() {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch {
      // Silently fail
    }
  }

  // Stats
  const stats = {
    total: contracts.length,
    completed: contracts.filter((c) => c.status === "COMPLETED").length,
    processing: contracts.filter((c) => c.status === "PROCESSING" || c.status === "PENDING").length,
    highRisk: contracts.filter((c) => c.risk_level?.toLowerCase() === "high" || c.risk_level?.toLowerCase() === "danger").length,
  };

  // Recent contracts (last 5)
  const recentContracts = contracts.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 animate-fadeIn">
          <IconLoading size={32} className="text-gray-400" />
          <p className="text-sm text-gray-500">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          안녕하세요{user?.username ? `, ${user.username}님` : ""}
        </h1>
        <p className="text-gray-500">계약서 분석 현황을 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Contracts */}
        <div className="liquid-glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <IconDocument size={20} className="text-gray-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">전체</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">등록된 계약서</p>
        </div>

        {/* Completed */}
        <div className="liquid-glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <IconCheck size={20} className="text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">완료</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-1">분석 완료</p>
        </div>

        {/* High Risk */}
        <div className="liquid-glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <IconDanger size={20} className="text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">위험</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{stats.highRisk}</p>
          <p className="text-xs text-gray-500 mt-1">High Risk</p>
        </div>

        {/* Processing */}
        <div className="liquid-glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <IconLoading size={20} className="text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">진행중</span>
          </div>
          <p className="text-3xl font-bold text-blue-700">{stats.processing}</p>
          <p className="text-xs text-gray-500 mt-1">분석 진행중</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-4">빠른 시작</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="liquid-glass-card p-5 text-left group">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconUpload size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">새 계약서 분석</h3>
            <p className="text-sm text-gray-500">하단 업로드 버튼을 눌러주세요</p>
          </div>

          <Link
            href="/scan"
            className="liquid-glass-card p-5 text-left hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconScan size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">빠른 스캔</h3>
            <p className="text-sm text-gray-500">카메라로 계약서 촬영</p>
          </Link>

          <Link
            href="/checklist"
            className="liquid-glass-card p-5 text-left hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconChecklist size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">체크리스트</h3>
            <p className="text-sm text-gray-500">계약서 검토 가이드</p>
          </Link>
        </div>
      </div>

      {/* Recent Contracts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">최근 계약서</h2>
          <Link
            href="/history"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            전체 보기
            <IconChevronRight size={16} />
          </Link>
        </div>

        {recentContracts.length === 0 ? (
          <div className="liquid-glass-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-4">
              <IconDocument size={28} className="text-gray-400" />
            </div>
            <p className="text-base text-gray-700 mb-1 font-medium tracking-tight">아직 분석된 계약서가 없습니다</p>
            <p className="text-sm text-gray-500 mb-6">첫 번째 계약서를 업로드해보세요</p>
            <p className="text-sm text-gray-400">하단의 업로드 버튼을 눌러주세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentContracts.map((contract) => (
              <div
                key={contract.id}
                className={cn(
                  "liquid-glass-card p-4 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all",
                  contract.status !== "COMPLETED" && "opacity-80"
                )}
                onClick={() => {
                  if (contract.status === "COMPLETED") {
                    router.push(`/analysis/${contract.id}`);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500">
                      <IconDocument size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate tracking-tight">
                        {contract.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatRelativeTime(contract.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(contract.status)}
                    {contract.status === "COMPLETED" && getRiskBadge(contract.risk_level)}
                    {contract.status === "COMPLETED" && (
                      <IconChevronRight size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
