const paths: Record<string, string> = {
  "t-shirts":
    "M35 20 L45 12 L58 12 L65 20 L78 14 L88 26 L78 34 L72 30 L72 88 L28 88 L28 30 L22 34 L12 26 L22 14 Z",
  shirts:
    "M38 18 L45 12 L58 12 L65 18 L80 16 L88 28 L76 36 L72 32 L72 88 L28 88 L28 32 L24 36 L12 28 L20 16 Z M45 18 L50 40 L55 18",
  knitwear:
    "M32 20 L45 14 L58 14 L71 20 L86 28 L78 40 L70 34 L70 88 L30 88 L30 34 L22 40 L14 28 Z",
  outerwear:
    "M30 18 L44 10 L58 10 L74 18 L90 30 L80 42 L70 34 L70 90 L30 90 L30 34 L20 42 L10 30 Z M44 10 L44 90 M58 10 L58 90",
  trousers:
    "M28 12 H72 L76 90 H60 L50 40 L40 90 H24 Z",
  jeans:
    "M28 12 H72 L76 90 H60 L50 42 L40 90 H24 Z M28 12 L34 30 M72 12 L66 30",
  dresses:
    "M42 12 H58 L66 26 L58 30 L64 92 H36 L42 30 L34 26 Z",
  skirts:
    "M32 22 H68 L80 88 H20 Z M32 22 L68 22",
};

export function GarmentIcon({
  subcategory,
  className,
}: {
  subcategory: string;
  className?: string;
}) {
  const d = paths[subcategory] ?? paths["t-shirts"];
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d={d} />
    </svg>
  );
}
