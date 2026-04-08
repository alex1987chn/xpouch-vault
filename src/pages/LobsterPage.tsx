import { Shell } from "lucide-react";

export default function LobsterPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-100">
          <Shell className="text-cyan-400" size={28} />
          龙虾监控
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          实时监控 iPocketai 服务器运行状态
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
        <Shell size={48} className="mx-auto mb-4 text-gray-700" />
        <p className="text-gray-500">监控面板即将上线</p>
      </div>
    </div>
  );
}
