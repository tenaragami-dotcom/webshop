type LogoProps = {
  id: string;
  markSize?: number;
  wordmarkClassName?: string;
  markClassName?: string;
};

export function Logo({
  id,
  markSize = 28,
  wordmarkClassName = "text-2xl",
  markClassName = "text-gold",
}: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        width={markSize}
        height={markSize}
        className={`flex-shrink-0 ${markClassName}`}
        aria-hidden="true"
      >
        <mask id={`${id}-crescent`}>
          <rect width="100" height="100" fill="white" />
          <circle cx="60" cy="42" r="24" fill="black" />
        </mask>
        <circle cx="44" cy="48" r="27" fill="currentColor" mask={`url(#${id}-crescent)`} />
        <path
          fill="currentColor"
          d="M74 22 C75 30 79 34 87 35 C79 36 75 40 74 48 C73 40 69 36 61 35 C69 34 73 30 74 22 Z"
        />
      </svg>
      <span className={`font-logo tracking-wide-jp text-charcoal ${wordmarkClassName}`}>
        Atelier<span className="text-gold-dark">&nbsp;le ciel</span>
      </span>
    </span>
  );
}
