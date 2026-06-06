"use client";

import { FormEvent, useState } from "react";
import { searchDestination, type GeocodeResult } from "@/lib/geocode";

type DestinationModalProps = {
  onClose: () => void;
  onDestination: (destination: GeocodeResult) => void;
};

export function DestinationModal({
  onClose,
  onDestination
}: DestinationModalProps) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSearching(true);

    try {
      const result = await searchDestination(query);
      onDestination(result);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "検索に失敗しました。");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/30 px-5">
      <section className="w-full max-w-sm rounded-sm border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.18em] text-slate-500">
              DESTINATION
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#0b1f3a]">
              目的地
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-slate-300 px-3 py-1.5 text-xs text-slate-600"
          >
            閉じる
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-slate-600">住所または地名</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 w-full rounded-sm border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none focus:border-[#0b1f3a] focus:ring-2 focus:ring-[#0b1f3a]/15"
              placeholder="例：東京駅"
              autoFocus
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSearching}
            className="w-full rounded-sm bg-[#0b1f3a] px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSearching ? "検索中" : "検索ボタン"}
          </button>
          <p className="text-center text-xs text-slate-500">印を置く</p>
        </form>
      </section>
    </div>
  );
}
