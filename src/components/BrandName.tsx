export function BrandName({
  name,
  reading,
  className,
  stacked = false,
  readingStyle,
}: {
  name: string;
  reading?: string | null;
  className?: string;
  stacked?: boolean;
  readingStyle?: React.CSSProperties;
}) {
  return (
    <span className={className}>
      {name}
      {reading && (
        <span
          className={`text-[0.75em] text-charcoal-soft ${stacked ? "block" : ""}`}
          style={readingStyle}
        >
          （{reading}）
        </span>
      )}
    </span>
  );
}
