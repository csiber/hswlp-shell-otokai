import "./embed.css";

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <div className="w-[480px] h-[120px] flex items-center justify-center">{children}</div>;
}
