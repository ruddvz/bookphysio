import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 bg-white border-2 border-dashed border-[#E5E5E5] rounded-[16px] text-center",
        className
      )}
    >
      <div className="w-16 h-16 bg-[#F9FAFB] rounded-full flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-[#9CA3AF]" />
      </div>
      <h3 className="text-[18px] font-bold text-[#333333] mb-2">{title}</h3>
      <p className="text-[15px] text-[#6B6B6B] max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
