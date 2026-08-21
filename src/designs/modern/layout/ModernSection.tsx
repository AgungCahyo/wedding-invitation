interface ModernContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ModernContainer({ children, className = "" }: ModernContainerProps) {
  return <div className={`max-w-6xl mx-auto px-6 md:px-10 ${className}`}>{children}</div>;
}

interface ModernSectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "muted" | "ink";
}

const toneClass = {
  paper: "bg-[var(--bg-primary)] text-[var(--text-primary)]",
  muted: "bg-[var(--bg-secondary)] text-[var(--text-primary)]",
  ink: "bg-[var(--overlay)] text-white",
} as const;

export function ModernSection({
  id,
  children,
  className = "",
  tone = "paper",
}: ModernSectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 ${toneClass[tone]} ${className}`}>
      <ModernContainer>{children}</ModernContainer>
    </section>
  );
}
