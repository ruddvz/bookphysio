import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ReactNode, isValidElement } from 'react';

/**
 * Role-parameterized dashboard primitives.
 *
 * All color tokens are pulled from CSS variables defined in `src/app/globals.css`:
 *   --color-pt-*  Patient  (Mint Breeze)
 *   --color-pv-*  Provider (Periwinkle Bloom)
 *   --color-ad-*  Admin    (Monochrome Noir)
 *
 * Spec: docs/planning/REDESIGN.md §3, §11, §12
 */

export type DashRole = 'patient' | 'provider' | 'admin';
export type TileTone = 1 | 2 | 3 | 4 | 5 | 6;

const rolePrefix: Record<DashRole, 'pt' | 'pv' | 'ad'> = {
  patient: 'pt',
  provider: 'pv',
  admin: 'ad',
};

function v(role: DashRole, key: string): string {
  return `var(--color-${rolePrefix[role]}-${key})`;
}

const cardShadow =
  '0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.03)';

/* ───────────────────────────── DashCard ─────────────────────────── */

export interface DashCardProps {
  role: DashRole;
  className?: string;
  children: ReactNode;
}

export function DashCard({ role, className = '', children }: DashCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 lg:p-6 transition-all duration-200 ${className}`}
      style={{
        borderColor: v(role, 'border'),
        boxShadow: cardShadow,
      }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────── StatTile ─────────────────────────── */

export interface StatTileProps {
  role: DashRole;
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: TileTone;
  delta?: { value: string; positive?: boolean };
}

export function StatTile({
  role,
  icon: Icon,
  label,
  value,
  tone,
  delta,
}: StatTileProps) {
  return (
    <div
      className="rounded-2xl border bg-white p-4 sm:p-5 transition-all duration-200"
      style={{
        borderColor: v(role, 'border'),
        boxShadow: cardShadow,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center"
          style={{
            background: v(role, `tile-${tone}-bg`),
            color: v(role, `tile-${tone}-fg`),
          }}
        >
          <Icon size={18} strokeWidth={2.2} className="sm:hidden" />
          <Icon size={20} strokeWidth={2.2} className="hidden sm:block" />
        </div>
        {delta ? (
          <span
            className={`text-[10px] sm:text-[11px] font-semibold ${
              delta.positive ? 'text-emerald-600' : 'text-rose-500'
            }`}
          >
            {delta.positive ? '↑' : '↓'} {delta.value}
          </span>
        ) : null}
      </div>
      <div className="mt-3 sm:mt-4 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div
        className="mt-0.5 sm:mt-1 text-[20px] sm:text-[26px] font-bold tabular-nums truncate"
        style={{ color: v(role, 'ink') }}
      >
        {value}
      </div>
    </div>
  );
}

/* ─────────────────────────── PageHeader ─────────────────────────── */

export interface PageHeaderProps {
  role: DashRole;
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
    tone?: TileTone;
  };
}

export function PageHeader({
  role,
  kicker,
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  const actionHref = action?.href;
  const actionStyle = action
    ? action.tone
      ? {
          background: v(role, `tile-${action.tone}-bg`),
          color: v(role, `tile-${action.tone}-fg`),
        }
      : {
          background: v(role, 'primary'),
          color: '#fff',
        }
    : undefined;

  const Icon = action?.icon;
  const actionContent = (
    <>
      {Icon ? <Icon size={16} className="mr-2" strokeWidth={2.5} /> : null}
      {action?.label}
    </>
  );
  const actionClasses =
    'rounded-full px-5 py-2.5 text-[13px] font-bold shadow-md transition-opacity hover:opacity-90 inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60';
  const renderAsLink = Boolean(actionHref && !action?.onClick && !action?.disabled);

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {kicker ? (
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {kicker}
          </div>
        ) : null}
        <h1
          className="text-[22px] sm:text-[28px] lg:text-[34px] font-black tracking-tight leading-tight"
          style={{ color: v(role, 'ink') }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-[13px] sm:text-[15px] font-medium text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        renderAsLink ? (
          <Link
            href={actionHref as string}
            className={actionClasses}
            style={actionStyle}
          >
            {actionContent}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={actionClasses}
            style={actionStyle}
          >
            {actionContent}
          </button>
        )
      ) : null}
    </div>
  );
}

/* ─────────────────────────── SectionCard ────────────────────────── */

export interface SectionCardProps {
  role: DashRole;
  title?: string;
  kicker?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
  };
  className?: string;
  noPadding?: boolean;
  children: ReactNode;
}

export function SectionCard({
  role,
  title,
  kicker,
  action,
  className = '',
  noPadding = false,
  children,
}: SectionCardProps) {
  const hasHeader = Boolean(title || kicker || action);
  const ActionIcon = action?.icon;
  const actionContent = (
    <>
      {ActionIcon ? <ActionIcon size={14} className="mr-1.5" strokeWidth={2.2} /> : null}
      {action?.label}
      {action?.href && !action?.onClick ? ' →' : null}
    </>
  );

  return (
    <DashCard role={role} className={`p-0 ${className}`.trim()}>
      {hasHeader ? (
        <div className="px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 lg:pt-6 pb-4 sm:pb-5 flex items-start justify-between gap-3 sm:gap-4">
          <div>
            {kicker ? (
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">
                {kicker}
              </div>
            ) : null}
            {title ? (
              <h2
                className="text-[16px] font-bold tracking-tight"
                style={{ color: v(role, 'ink') }}
              >
                {title}
              </h2>
            ) : null}
          </div>
          {action ? (
            action.href && !action.onClick && !action.disabled ? (
              <Link
                href={action.href}
                className="text-[12px] font-bold transition-opacity hover:opacity-80 inline-flex items-center"
                style={{ color: v(role, 'primary') }}
              >
                {actionContent}
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className="text-[12px] font-bold transition-opacity hover:opacity-80 inline-flex items-center disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: v(role, 'primary') }}
              >
                {actionContent}
              </button>
            )
          ) : null}
        </div>
      ) : null}
      <div
        className={
          noPadding
            ? ''
            : hasHeader
              ? 'px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6'
              : 'p-4 sm:p-5 lg:p-6'
        }
      >
        {children}
      </div>
    </DashCard>
  );
}

/* ───────────────────────────── ListRow ──────────────────────────── */

export interface ListRowProps {
  role: DashRole;
  icon?: LucideIcon | ReactNode;
  tone?: TileTone;
  primary: ReactNode;
  secondary?: ReactNode;
  right?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function ListRow({
  role,
  icon: IconOrElement,
  tone = 1,
  primary,
  secondary,
  right,
  href,
  onClick,
  className = '',
}: ListRowProps) {
  const body = (
    <div
      className={`flex items-center gap-4 py-4 px-2 -mx-2 rounded-xl transition-all duration-200 hover:bg-slate-50/50 ${
        onClick || href ? 'cursor-pointer active:scale-[0.99] group/row' : ''
      } ${className}`}
    >
      {IconOrElement ? (
        <div className="shrink-0">
          {isValidElement(IconOrElement) ? (
            IconOrElement
          ) : (
             <div
               className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center"
               style={{
                 background: v(role, `tile-${tone}-bg`),
                 color: v(role, `tile-${tone}-fg`),
               }}
             >
               {(() => {
                 const Icon = IconOrElement as LucideIcon;
                 return <Icon size={18} strokeWidth={2.2} />;
               })()}
             </div>
          )}
        </div>
      ) : null}
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] sm:text-[14px] font-bold truncate tracking-tight"
          style={{ color: v(role, 'ink') }}
        >
          {primary}
        </div>
        {secondary ? (
          <div className="text-[11px] sm:text-[12px] font-medium text-slate-500 truncate mt-0.5">{secondary}</div>
        ) : null}
      </div>
      {right ? (
        <div className="text-[13px] font-bold shrink-0">{right}</div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block border-b last:border-0"
        style={{ color: 'inherit', textDecoration: 'none', borderColor: v(role, 'border-soft') }}
      >
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full bg-transparent border-0 border-b last:border-0 p-0 text-left"
        style={{ borderColor: v(role, 'border-soft') }}
      >
        {body}
      </button>
    );
  }
  return (
    <div className="border-b last:border-0" style={{ borderColor: v(role, 'border-soft') }}>
      {body}
    </div>
  );
}

/* ─────────────────────────── EmptyState ─────────────────────────── */

export interface EmptyStateProps {
  role: DashRole;
  icon: LucideIcon;
  title: string;
  description?: string;
  cta?: { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({
  role,
  icon: Icon,
  title,
  description,
  cta,
}: EmptyStateProps) {
  const ctaClass =
    'mt-5 inline-flex items-center rounded-full px-6 py-2.5 text-[13px] font-bold text-white shadow-md transition-opacity hover:opacity-90';
  const ctaStyle = { background: v(role, 'primary') } as const;

  return (
    <div className="text-center py-12 px-6">
      <div
        className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-4"
        style={{
          background: v(role, 'border-soft'),
          color: v(role, 'muted'),
        }}
      >
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <div
        className="text-[18px] font-black tracking-tight"
        style={{ color: v(role, 'ink') }}
      >
        {title}
      </div>
      {description ? (
        <p className="mt-2 text-[14px] font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      ) : null}
      {cta ? (
        cta.href ? (
          <Link href={cta.href} className={ctaClass} style={ctaStyle}>
            {cta.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={cta.onClick}
            className={ctaClass}
            style={ctaStyle}
          >
            {cta.label}
          </button>
        )
      ) : null}
    </div>
  );
}

