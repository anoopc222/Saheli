export type ProductBadge = "bestseller" | "new" | "sale";

export type Product = {
  id: string;
  name: string;
  description: string;
  fabric: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  badge: ProductBadge | null;
  rating: number | null;
  rating_count: number;
  image_url: string;
  image_urls: string[];
  stock: number;
  category_id: string | null;
  subcategory_id: string | null;
};
