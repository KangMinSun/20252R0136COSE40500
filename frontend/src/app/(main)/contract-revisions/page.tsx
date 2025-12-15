"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconLoading,
  IconDocument,
  IconChevronRight,
  IconHistory,
} from "@/components/icons";
import { cn } from "@/lib/utils";

// Mock data for revision history (will be replaced with real API)
interface Revision {
  id: number;
  contractId: number;
  contractTitle: string;
  version: number;
  changedAt: string;
  changeType: "clause_added" | "clause_removed" | "clause_modified" | "risk_addressed";
  changeDescription: string;
  changedBy: string;
}

const mockRevisions: Revision[] = [
  {
    id: 1,
    contractId: 1,
    contractTitle: "근로계약서_2024",
    version: 2,
    changedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    changeType: "risk_addressed",
    changeDescription: "제7조 위약금 조항 수정 - 위약금 상한 설정",
    changedBy: "사용자",
  },
  {
    id: 2,
    contractId: 1,
    contractTitle: "근로계약서_2024",
    version: 1,
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    changeType: "clause_modified",
    changeDescription: "퇴직금 지급 조항 명확화",
    changedBy: "사용자",
  },
  {
    id: 3,
    contractId: 2,
    contractTitle: "임대차계약서",
    version: 3,
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    changeType: "clause_added",
    changeDescription: "원상복구 범위 명시 조항 추가",
    changedBy: "사용자",
  },
  {
    id: 4,
    contractId: 2,
    contractTitle: "임대차계약서",
    version: 2,
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    changeType: "risk_addressed",
    changeDescription: "보증금 반환 기한 조항 수정",
    changedBy: "사용자",
  },
];

function getChangeTypeInfo(type: Revision["changeType"]) {
  switch (type) {
    case "clause_added":
      return { label: "추가", color: "bg-green-100 text-green-700" };
    case "clause_removed":
      return { label: "삭제", color: "bg-red-100 text-red-700" };
    case "clause_modified":
      return { label: "수정", color: "bg-blue-100 text-blue-700" };
    case "risk_addressed":
      return { label: "위험 해소", color: "bg-purple-100 text-purple-700" };
    default:
      return { label: "변경", color: "bg-gray-100 text-gray-700" };
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

export default function ContractRevisionsPage() {
  const [loading, setLoading] = useState(true);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      // In production, this would be an API call
      setRevisions(mockRevisions);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }

  // Filter revisions based on selection
  const filteredRevisions = selectedContractId
    ? revisions.filter((r) => r.contractId === selectedContractId)
    : revisions;

  // Get unique contracts from revisions
  const contractsWithRevisions = Array.from(
    new Set(revisions.map((r) => r.contractId))
  ).map((id) => {
    const rev = revisions.find((r) => r.contractId === id);
    return { id, title: rev?.contractTitle || "" };
  });

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
      {/* Description */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          계약서 분석 결과를 바탕으로 수정한 내역을 확인할 수 있습니다.
          버전별로 변경 사항을 추적하고 비교할 수 있습니다.
        </p>
      </div>

      {/* Filter by Contract */}
      {contractsWithRevisions.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setSelectedContractId(null)}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap flex-shrink-0",
              selectedContractId === null
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            전체
          </button>
          {contractsWithRevisions.map((contract) => (
            <button
              key={contract.id}
              onClick={() => setSelectedContractId(contract.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap flex-shrink-0",
                selectedContractId === contract.id
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {contract.title}
            </button>
          ))}
        </div>
      )}

      {revisions.length === 0 ? (
        <div className="card-apple p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-4">
            <IconHistory size={28} className="text-gray-400" />
          </div>
          <p className="text-base text-gray-700 mb-1 font-medium tracking-tight">
            수정 기록이 없습니다
          </p>
          <p className="text-sm text-gray-500 mb-6">
            계약서 분석 결과를 바탕으로 조항을 수정하면 이곳에 기록됩니다.
          </p>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <IconDocument size={16} />
            분석 기록 보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRevisions.map((revision, index) => {
            const changeInfo = getChangeTypeInfo(revision.changeType);
            const showContractHeader =
              !selectedContractId &&
              (index === 0 ||
                filteredRevisions[index - 1].contractId !== revision.contractId);

            return (
              <div key={revision.id}>
                {showContractHeader && (
                  <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
                    <IconDocument size={16} className="text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-600 tracking-tight">
                      {revision.contractTitle}
                    </h3>
                  </div>
                )}
                <div className="card-apple p-4 active:scale-[0.99] cursor-pointer group">
                  <div className="flex items-start gap-4">
                    {/* Version Badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">v{revision.version}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("px-2 py-0.5 text-xs font-medium rounded-md", changeInfo.color)}>
                          {changeInfo.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(revision.changedAt)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 tracking-tight mb-1">
                        {revision.changeDescription}
                      </p>
                      <p className="text-xs text-gray-500">
                        {revision.changedBy}에 의해 수정됨
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconChevronRight size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline Visual (for Desktop) */}
      {filteredRevisions.length > 0 && selectedContractId && (
        <div className="hidden sm:block mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-tight">버전 타임라인</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

            {filteredRevisions.map((revision, index) => {
              const changeInfo = getChangeTypeInfo(revision.changeType);
              return (
                <div key={revision.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  {/* Timeline dot */}
                  <div className={cn(
                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm",
                    index === 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    <span className="text-xs font-semibold">v{revision.version}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("px-2 py-0.5 text-xs font-medium rounded-md", changeInfo.color)}>
                        {changeInfo.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(revision.changedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 tracking-tight">
                      {revision.changeDescription}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
