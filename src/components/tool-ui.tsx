import { AlertTriangle, Check, Copy, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export function Panel({
  label,
  badge,
  children,
  className = "",
}: {
  label: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rise ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
        {badge}
      </div>
      <div className="glass space-y-3 rounded-xl border border-border/70 p-3 sm:p-4">
        {children}
      </div>
    </section>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
      {children}
    </span>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className="mt-1 flex rounded-lg border border-border/80 bg-surface/60 p-0.5"
    >
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o)}
            className={`flex-1 rounded-md py-1.5 text-center text-[11px] transition-colors ${
              active
                ? "bg-primary font-medium text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`mt-1 w-full resize-y rounded-lg border border-border/80 bg-surface/70 px-3 py-2.5 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40 focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-border/80 bg-surface/70 px-2.5 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40 focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function PrimaryButton({
  children,
  loading,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground ring-1 ring-black/5 transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      {loading ? <RefreshCw className="size-3.5 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/80 bg-surface py-2 text-[11px] font-medium text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function ValidationError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[11px] font-medium text-destructive">
      {message}
    </p>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-relaxed text-foreground">{message}</p>
        <button
          onClick={onRetry}
          className="mt-2 rounded-md border border-border/80 bg-surface px-2.5 py-1 text-[11px] font-medium hover:bg-foreground/5"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function LoadingLines({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-live="polite" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer h-3 rounded" style={{ width: `${95 - i * 11}%` }} />
      ))}
      <span className="sr-only">Generating…</span>
    </div>
  );
}

export function OutputActions({
  onCopy,
  onRegenerate,
  onClear,
  disabled,
}: {
  onCopy: () => string;
  onRegenerate: () => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <GhostButton
        disabled={disabled}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(onCopy());
            setCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopied(false), 1500);
          } catch {
            toast.error("Couldn't copy — select the text and copy manually.");
          }
        }}
      >
        {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        Copy
      </GhostButton>
      <GhostButton disabled={disabled} onClick={onRegenerate}>
        <RefreshCw className="size-3.5" aria-hidden />
        Regenerate
      </GhostButton>
      <GhostButton disabled={disabled} onClick={onClear}>
        <Trash2 className="size-3.5" aria-hidden />
        Clear
      </GhostButton>
    </div>
  );
}

export function MissingInfo({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-lg border border-border/80 bg-surface/60 px-3 py-2.5">
      <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
        Missing information
      </p>
      <ul className="mt-1.5 space-y-1">
        {items.map((m) => (
          <li key={m} className="text-[12px] leading-relaxed text-muted-foreground">
            — {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Disclaimer() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-accent/25 bg-accent/8 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
      <ShieldAlert className="mt-px size-3.5 shrink-0 text-accent" aria-hidden />
      <span>
        <span className="font-mono text-accent">Responsible AI</span> — Generated content may
        contain errors; review it before professional use. Do not enter confidential or sensitive
        information.
      </span>
    </p>
  );
}
