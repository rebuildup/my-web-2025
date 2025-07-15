'use client';
import React from 'react';

export default function JsonLd({ json }: { json: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
  );
}
