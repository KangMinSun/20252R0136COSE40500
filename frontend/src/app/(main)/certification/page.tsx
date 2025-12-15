"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Contract, contractsApi } from "@/lib/api";
import {
  IconLoading,
  IconDocument,
  IconChevronRight,
  IconFileText,
  IconPlus,
  IconSend,
  IconCheck,
  IconInfo,
} from "@/components/icons";

interface CertificationForm {
  contractId: number | null;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  subject: string;
  content: string;
  demandItems: string[];
  deadline: string;
}

export default function CertificationPage() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const [form, setForm] = useState<CertificationForm>({
    contractId: null,
    senderName: "",
    senderAddress: "",
    receiverName: "",
    receiverAddress: "",
    subject: "",
    content: "",
    demandItems: [""],
    deadline: "",
  });

  useEffect(() => {
    loadContracts();
  }, []);

  async function loadContracts() {
    try {
      setLoading(true);
      const data = await contractsApi.list();
      // Filter completed contracts only
      setContracts(data.filter((c) => c.status === "COMPLETED"));
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }

  function handleSelectContract(id: number) {
    setForm((prev) => ({ ...prev, contractId: id }));
    setStep(2);
  }

  function handleAddDemandItem() {
    setForm((prev) => ({
      ...prev,
      demandItems: [...prev.demandItems, ""],
    }));
  }

  function handleRemoveDemandItem(index: number) {
    setForm((prev) => ({
      ...prev,
      demandItems: prev.demandItems.filter((_, i) => i !== index),
    }));
  }

  function handleDemandItemChange(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      demandItems: prev.demandItems.map((item, i) => (i === index ? value : item)),
    }));
  }

  async function handleGenerate() {
    setGenerating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGenerating(false);
    setGenerated(true);
    setStep(3);
  }

  const selectedContract = contracts.find((c) => c.id === form.contractId);

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
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step >= s
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Select Contract */}
      {step === 1 && (
        <div className="animate-fadeInUp">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-2">계약서 선택</h2>
            <p className="text-sm text-gray-500">
              내용증명을 작성할 계약서를 선택하세요. 분석이 완료된 계약서만 선택할 수 있습니다.
            </p>
          </div>

          {contracts.length === 0 ? (
            <div className="card-apple p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-4">
                <IconDocument size={28} className="text-gray-400" />
              </div>
              <p className="text-base text-gray-700 mb-1 font-medium tracking-tight">
                분석 완료된 계약서가 없습니다
              </p>
              <p className="text-sm text-gray-500 mb-6">
                먼저 계약서를 업로드하고 분석을 완료해주세요
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                대시보드로 이동
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <button
                  key={contract.id}
                  onClick={() => handleSelectContract(contract.id)}
                  className="w-full card-apple p-4 text-left active:scale-[0.99] group"
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
                          {new Date(contract.created_at).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    <IconChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Fill Form */}
      {step === 2 && (
        <div className="animate-fadeInUp">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-2">내용증명 정보 입력</h2>
            <p className="text-sm text-gray-500">
              내용증명에 필요한 정보를 입력해주세요. AI가 계약서 분석 결과를 바탕으로 초안을 작성합니다.
            </p>
          </div>

          {/* Selected Contract */}
          {selectedContract && (
            <div className="card-apple p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-green-100 text-green-600">
                  <IconCheck size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">선택된 계약서</p>
                  <p className="text-sm font-medium text-gray-900 truncate tracking-tight">
                    {selectedContract.title}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  변경
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Sender Info */}
            <div className="card-apple p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-tight">발신인 정보</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-tight">
                    성명/상호
                  </label>
                  <input
                    type="text"
                    value={form.senderName}
                    onChange={(e) => setForm((prev) => ({ ...prev, senderName: e.target.value }))}
                    className="w-full px-4 py-2.5 liquid-input text-sm outline-none"
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-tight">
                    주소
                  </label>
                  <input
                    type="text"
                    value={form.senderAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, senderAddress: e.target.value }))}
                    className="w-full px-4 py-2.5 liquid-input text-sm outline-none"
                    placeholder="서울시 강남구..."
                  />
                </div>
              </div>
            </div>

            {/* Receiver Info */}
            <div className="card-apple p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-tight">수신인 정보</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-tight">
                    성명/상호
                  </label>
                  <input
                    type="text"
                    value={form.receiverName}
                    onChange={(e) => setForm((prev) => ({ ...prev, receiverName: e.target.value }))}
                    className="w-full px-4 py-2.5 liquid-input text-sm outline-none"
                    placeholder="(주)OO회사"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-tight">
                    주소
                  </label>
                  <input
                    type="text"
                    value={form.receiverAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, receiverAddress: e.target.value }))}
                    className="w-full px-4 py-2.5 liquid-input text-sm outline-none"
                    placeholder="서울시 서초구..."
                  />
                </div>
              </div>
            </div>

            {/* Demand Items */}
            <div className="card-apple p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">요구 사항</h3>
                <button
                  onClick={handleAddDemandItem}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <IconPlus size={14} />
                  항목 추가
                </button>
              </div>
              <div className="space-y-3">
                {form.demandItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleDemandItemChange(index, e.target.value)}
                      className="flex-1 px-4 py-2.5 liquid-input text-sm outline-none"
                      placeholder="요구 사항을 입력하세요"
                    />
                    {form.demandItems.length > 1 && (
                      <button
                        onClick={() => handleRemoveDemandItem(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="sr-only">삭제</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div className="card-apple p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-tight">이행 기한</h3>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-2.5 liquid-input text-sm outline-none"
              />
            </div>

            {/* Info Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <IconInfo size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                AI가 분석된 계약서 내용과 입력하신 정보를 바탕으로 내용증명 초안을 작성합니다.
                생성된 초안은 검토 후 수정할 수 있습니다.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 sm:flex-initial px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !form.senderName || !form.receiverName}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {generating ? (
                  <>
                    <IconLoading size={18} />
                    생성 중...
                  </>
                ) : (
                  <>
                    <IconFileText size={18} />
                    내용증명 생성
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Download */}
      {step === 3 && generated && (
        <div className="animate-fadeInUp">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-2">내용증명 완성</h2>
            <p className="text-sm text-gray-500">
              내용증명이 생성되었습니다. 내용을 확인하고 다운로드하세요.
            </p>
          </div>

          {/* Success Message */}
          <div className="card-apple p-6 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
              <IconCheck size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">내용증명 생성 완료</h3>
            <p className="text-sm text-gray-500">
              아래에서 생성된 내용증명을 확인하고 다운로드할 수 있습니다.
            </p>
          </div>

          {/* Preview */}
          <div className="card-apple p-6 mb-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-center font-bold text-lg mb-6">내 용 증 명</h3>

              <div className="mb-4">
                <p><strong>발신인:</strong> {form.senderName}</p>
                <p className="text-sm text-gray-600">{form.senderAddress}</p>
              </div>

              <div className="mb-4">
                <p><strong>수신인:</strong> {form.receiverName}</p>
                <p className="text-sm text-gray-600">{form.receiverAddress}</p>
              </div>

              <hr className="my-4" />

              <p className="mb-4">
                본인({form.senderName || "발신인"})은 귀하({form.receiverName || "수신인"})에게 다음과 같이 통지합니다.
              </p>

              <p className="mb-4">
                {selectedContract?.title}에 대한 계약 분석 결과, 아래 사항에 대해 귀하의 이행을 요구합니다.
              </p>

              <ol className="list-decimal pl-6 mb-4">
                {form.demandItems.filter((item) => item.trim()).map((item, index) => (
                  <li key={index} className="mb-2">{item}</li>
                ))}
              </ol>

              {form.deadline && (
                <p className="mb-4">
                  상기 사항에 대하여 <strong>{new Date(form.deadline).toLocaleDateString("ko-KR")}</strong>까지
                  이행하여 주시기 바랍니다.
                </p>
              )}

              <p className="mb-4">
                본 내용증명은 계약서 분석 결과를 바탕으로 작성되었으며,
                귀하가 위 기한 내에 이행하지 않을 경우 관련 법적 조치를 취할 수 있음을 알려드립니다.
              </p>

              <div className="text-right mt-8">
                <p>{new Date().toLocaleDateString("ko-KR")}</p>
                <p className="mt-2"><strong>발신인: {form.senderName}</strong></p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={() => {
                setStep(2);
                setGenerated(false);
              }}
              className="flex-1 sm:flex-initial px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              수정하기
            </button>
            <button
              onClick={() => {
                // Download logic would go here
                alert("내용증명이 다운로드됩니다. (백엔드 연결 후 구현 예정)");
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all"
            >
              <IconSend size={18} />
              PDF 다운로드
            </button>
          </div>
        </div>
      )}
    </>
  );
}
