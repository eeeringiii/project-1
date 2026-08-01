import type { MetadataRoute } from 'next';
import { oshicoaTypes } from '@/data/types';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/diagnosis', '/types', '/about', '/privacy', '/terms', '/compatibility'];
  return [
    ...staticPaths.map(path => ({ url: SITE_URL + path, lastModified: new Date() })),
    ...oshicoaTypes.map(type => ({ url: `${SITE_URL}/types/${type.code}`, lastModified: new Date() })),
  ];
}
