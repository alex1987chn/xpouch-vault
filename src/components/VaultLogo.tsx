/**
 * VaultLogo — 金库 Logo 动画组件
 *
 * 视觉隐喻：一扇金库门缓缓打开，内部透出橙色光芒
 * 纯 CSS 动画，无外部依赖
 */

interface VaultLogoProps {
  className?: string;
}

export default function VaultLogo({ className }: VaultLogoProps) {
  return (
    <div className={`relative w-9 h-9 ${className ?? ""}`}>
      {/* 底层：琥珀色光芒 */}
      <div
        className="absolute inset-[6px] rounded-sm"
        style={{
          background: "#c96442",
          animation: "vault-glow 3s ease-in-out infinite",
        }}
      />

      {/* 左门 */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full origin-left rounded-l-md border-2 bg-stone-300"
        style={{
          borderColor: "#a8a29e",
          animation: "vault-door-left 3s ease-in-out infinite",
          transformOrigin: "left center",
        }}
      >
        {/* 门把手 */}
        <div className="absolute right-[3px] top-1/2 -translate-y-1/2 w-[3px] h-2 rounded-full" style={{ background: "#c96442" }} />
      </div>

      {/* 右门 */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full origin-right rounded-r-md border-2 bg-stone-300"
        style={{
          borderColor: "#a8a29e",
          animation: "vault-door-right 3s ease-in-out infinite",
          transformOrigin: "right center",
        }}
      >
        {/* 门把手 */}
        <div className="absolute left-[3px] top-1/2 -translate-y-1/2 w-[3px] h-2 rounded-full" style={{ background: "#c96442" }} />
      </div>

      {/* 嵌入 keyframe 动画 */}
      <style>{`
        @keyframes vault-glow {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }

        @keyframes vault-door-left {
          0%, 100% { transform: perspective(200px) rotateY(0deg); }
          35%, 65% { transform: perspective(200px) rotateY(-25deg); }
        }

        @keyframes vault-door-right {
          0%, 100% { transform: perspective(200px) rotateY(0deg); }
          35%, 65% { transform: perspective(200px) rotateY(25deg); }
        }
      `}</style>
    </div>
  );
}
