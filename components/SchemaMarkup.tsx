import React from 'react';
import { ContentItem } from '../types';

interface SchemaProps {
  item: ContentItem;
}

const SchemaMarkup: React.FC<SchemaProps> = ({ item }) => {
  const getSchemaType = (type: string) => {
    switch (type) {
      case 'video': return 'VideoObject';
      case 'music': return 'MusicRecording';
      case 'article': return 'NewsArticle';
      default: return 'CreativeWork';
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": getSchemaType(item.type),
    "headline": item.title,
    "description": item.description,
    "thumbnailUrl": item.thumbnail,
    "uploadDate": item.date,
    "author": {
      "@type": "Organization",
      "name": "Samonya Digital Universe"
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/LikeAction",
      "userInteractionCount": item.interactions.likes + item.interactions.loves
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default SchemaMarkup;