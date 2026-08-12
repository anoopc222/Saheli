export type ProductBadge = "bestseller" | "new" | "sale";

export type ProductSize = {
  size: string;
  stock: number;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  fabric: string;
  product_code: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  cost_price_cents: number | null;
  badge: ProductBadge | null;
  rating: number | null;
  rating_count: number;
  image_url: string;
  image_urls: string[];
  stock: number;
  category_id: string | null;
  subcategory_id: string | null;
  tags: string[];
  show_on_store: boolean;
  sizes?: ProductSize[];
};
