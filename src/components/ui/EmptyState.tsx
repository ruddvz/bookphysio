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
      <div className="w-20 h-20 bg-bp-surface rounded-[32px] flex items-center justify-center mb-8 border border-bp-border text-bp-body/20">
        <Icon className="w-10 h-10" strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-black text-bp-primary mb-3 tracking-tight">{title}</h3>
      <p className="text-[15px] font-bold text-bp-body/40 max-w-sm mb-10 leading-relaxed">
        {description}
      </p>
      {action && <div className="w-full flex justify-center">{action}</div>}
    </div>
  );
}
