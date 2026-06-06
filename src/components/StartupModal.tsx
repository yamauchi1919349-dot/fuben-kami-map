type StartupModalProps = {
  onClose: () => void;
};

export function StartupModal({ onClose }: StartupModalProps) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/35 px-6">
      <section className="w-full max-w-sm rounded-sm border border-slate-200 bg-white px-7 py-8 text-slate-900 shadow-xl">
        <p className="text-sm tracking-[0.18em] text-slate-500">KAMI Map</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#0b1f3a]">
          KAMI地図
        </h1>
        <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700">
          {`この地図は案内しません。

現在地と方角を頼りに、
地図を読んでください。`}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-sm bg-[#0b1f3a] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#12335c] focus:outline-none focus:ring-2 focus:ring-[#0b1f3a] focus:ring-offset-2"
        >
          地図を開く
        </button>
      </section>
    </div>
  );
}
