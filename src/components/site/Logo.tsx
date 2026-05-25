export function Logo({ className = "" }: { className?: string }) {
  // Wordmark style inspired by the poster: italic serif "noit." with a coffee-bean dot
  return (
    <span className={`inline-flex items-baseline gap-1 leading-none ${className}`}>
      <span className="font-display italic font-bold text-3xl text-gradient-gold tracking-tight">
        noit
      </span>
      <span className="size-1.5 rounded-full bg-primary mb-1" />
    </span>
  );
}
