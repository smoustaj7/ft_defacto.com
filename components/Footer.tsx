import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="display-heading text-xl mb-4">Defacto</div>
            <p className="text-sm text-paper/65 max-w-sm">
              Everyday clothing for men, women, and kids — solid fabrics,
              honest prices, and a store that gets out of your way.
            </p>
          </div>
          <FooterColumn
            title="Shop"
            links={[
              { label: "Men", href: "/products?category=men" },
              { label: "Women", href: "/products?category=women" },
              { label: "Kids", href: "/products?category=kids" },
              { label: "Sale", href: "/products?sale=1" },
            ]}
          />
          <FooterColumn
            title="Help"
            links={[
              { label: "Shipping", href: "#" },
              { label: "Returns", href: "#" },
              { label: "Size guide", href: "#" },
              { label: "Contact", href: "#" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Sustainability", href: "#" },
              { label: "Careers", href: "#" },
            ]}
          />
        </div>
        <div className="tick-rule opacity-30 my-8" />
        <p className="text-xs text-paper/40">
          © {new Date().getFullYear()} Defacto — concept redesign, mock storefront for demonstration.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-paper/50 mb-4">
        {title}
      </div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-paper/80 hover:text-paper">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
