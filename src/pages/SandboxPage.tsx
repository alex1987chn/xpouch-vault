import { MessageSquareCode } from "lucide-react";

export default function SandboxPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-100">
          <MessageSquareCode className="text-cyan-400" size={28} />
          沙盒
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          在线调用大模型接口，实时对话测试
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
        <MessageSquareCode size={48} className="mx-auto mb-4 text-gray-700" />
        <p className="text-gray-500">沙盒即将上线</p>
      </div>
    </div>
  );
}
