type Props = {
  seed: string;
  url?: string | null;
  label?: string;
  width?: number;
  height?: number;
  className?: string;
};

export function PlaceholderImage({
  seed,
  url,
  label,
  width = 600,
  height = 750,
  className,
}: Props) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={label ?? ""}
        width={width}
        height={height}
        className={className}
        loading="lazy"
      />
    );
  }

  const params = new URLSearchParams({
    w: String(width),
    h: String(height),
  });
  if (label) params.set("label", label);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/placeholder/${encodeURIComponent(seed)}?${params.toString()}`}
      alt={label ?? ""}
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
}
