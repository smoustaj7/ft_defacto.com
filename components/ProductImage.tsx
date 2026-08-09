import { GarmentIcon } from "./GarmentIcon";

function readableLineColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#17140F" : "#FFFFFF";
}

export function ProductImage({
  colorHex,
  subcategory,
  imageUrl,
  alt,
  className,
}: {
  colorHex: string;
  subcategory: string;
  imageUrl?: string;
  alt?: string;
  className?: string;
}) {
  const lineColor = readableLineColor(colorHex);
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: colorHex, color: lineColor }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt ?? subcategory}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <GarmentIcon subcategory={subcategory} className="w-2/3 h-2/3 opacity-90" />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, transparent 40%, rgba(0,0,0,0.08) 100%)",
        }}
      />
    </div>
  );
}
