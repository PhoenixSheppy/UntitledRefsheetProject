/**
 * Structured Data component for SEO optimization
 */

import { 
  generateWebsiteStructuredData, 
  generateArtworkStructuredData, 
  generateBreadcrumbStructuredData,
  generateFAQStructuredData 
} from '@/config/seo';

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}

export function WebSiteStructuredData() {
  return <StructuredData data={generateWebsiteStructuredData()} />;
}

export function ArtworkStructuredData() {
  return <StructuredData data={generateArtworkStructuredData()} />;
}

export function BreadcrumbStructuredData() {
  return <StructuredData data={generateBreadcrumbStructuredData()} />;
}

export function FAQStructuredData() {
  return <StructuredData data={generateFAQStructuredData()} />;
}

export function AllStructuredData() {
  return (
    <>
      <WebSiteStructuredData />
      <ArtworkStructuredData />
      <BreadcrumbStructuredData />
      <FAQStructuredData />
    </>
  );
}