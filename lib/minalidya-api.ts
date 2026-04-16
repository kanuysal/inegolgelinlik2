export interface MinaLidyaProduct {
  id: string | number;
  slug: string;
  name?: string;
  productName?: string;
  category?: string | string[];
  categories?: string[];
  price?: number;
  msrp?: number;
  images: (string | { src: string })[];
  isModest?: boolean;
  tags?: string[] | { tr?: string[] };
  mappedAttributes?: Record<string, string>;
  [key: string]: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.minalidya.wedding/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'MinaLidya2026';
const IMAGE_STORE = process.env.NEXT_PUBLIC_IMAGE_STORE || 'https://api.minalidya.wedding/images';

export async function fetchProducts(): Promise<MinaLidyaProduct[]> {
  try {
    const response = await fetch(`${API_URL}/products?limit=100`, {
      mode: 'cors',
      headers: {
        'x-api-key': API_KEY,
      },
      next: { revalidate: 300 }, // 5 min cache
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<MinaLidyaProduct | null> {
  try {
    const response = await fetch(`${API_URL}/products/${slug}`, {
      headers: {
        'x-api-key': API_KEY,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch product ${slug}:`, error);
    return null;
  }
}

export function getImageUrl(image: any): string {
  if (!image) return '';
  const path = typeof image === 'string' ? image : image.src;
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IMAGE_STORE}/${path}`;
}
