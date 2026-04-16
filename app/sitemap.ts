import { MetadataRoute } from 'next';
import { fetchProducts } from '@/lib/minalidya-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://minalidya.wedding';

  // Core Static Pages
  const staticPages = [
    '',
    '/shop',
    '/faq',
    '/about',
    '/boutiques',
    '/appointment',
    '/online-couture',
    '/online-couture/measurement-guide',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Product Pages
  try {
    const products = await fetchProducts();
    const productPages = products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug || product.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('Sitemap generation failed to fetch products:', error);
    return staticPages;
  }
}
