# Database-Based Translation System Implementation Guide

## 1. Database Schema Setup

### Translation Collection Schema
```typescript
interface Translation {
  _id: ObjectId;
  key: string;           // Unique identifier for the translation
  route: string;         // Route this translation belongs to
  language: string;      // Language code (e.g., 'en', 'es')
  value: string;         // Translated text
  lastUpdated: Date;     // Last modification timestamp
  version: number;       // Version control
}

Version Control Collection Schema
interface VersionControl {
  _id: ObjectId;
  language: string;
  lastUpdated: Date;
  version: number;
}

2. Server-Side Implementation
Translation Service
// app/services/translation.server.ts
import { db } from '~/db/connection.server';

export class TranslationService {
  static async getRouteTranslations(route: string, lang: string) {
    return db.collection('translations').find({
      route,
      language: lang,
    }).toArray();
  }

  static async getVersion(lang: string) {
    return db.collection('versionControl')
      .findOne({ language: lang });
  }
}


Loader Implementation

// app/routes/$lang.$route.tsx
import { json } from '@remix-run/node';
import { TranslationService } from '~/services/translation.server';

export async function loader({ params }) {
  const { lang, route } = params;
  const [translations, version] = await Promise.all([
    TranslationService.getRouteTranslations(route, lang),
    TranslationService.getVersion(lang)
  ]);

  return json({ translations, version });
}

3. Client-Side Implementation
Translation Cache
// app/utils/translationCache.ts
interface CacheEntry {
  translations: Record<string, string>;
  version: number;
  timestamp: number;
}

export class TranslationCache {
  static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getKey(route: string, lang: string) {
    return `translations:${route}:${lang}`;
  }

  static set(route: string, lang: string, translations: Record<string, string>, version: number) {
    localStorage.setItem(
      this.getKey(route, lang),
      JSON.stringify({ translations, version, timestamp: Date.now() })
    );
  }

  static get(route: string, lang: string): CacheEntry | null {
    const cached = localStorage.getItem(this.getKey(route, lang));
    if (!cached) return null;

    const entry = JSON.parse(cached);
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      localStorage.removeItem(this.getKey(route, lang));
      return null;
    }

    return entry;
  }
}

Translation Context

// app/context/TranslationContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { TranslationCache } from '~/utils/translationCache';

export const TranslationContext = createContext<{
  t: (key: string) => string;
  isLoading: boolean;
}>({
  t: (key) => key,
  isLoading: true,
});

export function TranslationProvider({ 
  children, 
  initialTranslations, 
  version,
  route,
  lang 
}) {
  const [translations, setTranslations] = useState(initialTranslations);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cached = TranslationCache.get(route, lang);
    if (cached && cached.version === version) {
      setTranslations(cached.translations);
      return;
    }

    TranslationCache.set(route, lang, initialTranslations, version);
  }, [route, lang, version, initialTranslations]);

  return (
    <TranslationContext.Provider value={{
      t: (key) => translations[key] || key,
      isLoading
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

4. Migration Script
// scripts/migrateTranslations.ts
import { db } from '../app/db/connection.server';
import { data } from '../app/data/data';

async function migrateTranslations() {
  const translations = [];
  const routes = ['index', 'sanjuan', 'booking'];
  const languages = ['en', 'es'];

  for (const route of routes) {
    for (const lang of languages) {
      const routeData = data[lang][route];
      const flattenedTranslations = flattenObject(routeData, route);
      translations.push(...flattenedTranslations);
    }
  }

  await db.collection('translations').insertMany(translations);
  await db.collection('versionControl').insertMany(
    languages.map(lang => ({
      language: lang,
      version: 1,
      lastUpdated: new Date()
    }))
  );
}

function flattenObject(obj: any, route: string, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      return [...acc, ...flattenObject(value, route, newKey)];
    }
    
    return [...acc, {
      key: newKey,
      route,
      value: String(value),
      lastUpdated: new Date(),
      version: 1
    }];
  }, []);
}

5. Implementation Steps
Database Setup
Create MongoDB collections: translations and versionControl
Run migration script to populate initial data
Set up indexes for optimal query performance
Server Implementation
Create translation service
Update route loaders to fetch translations
Implement version control checks
Client Implementation
Set up translation context
Implement caching mechanism
Add background preloading for linked routes
Testing
Test cache invalidation
Verify version control
Check performance metrics
Test offline functionality
Monitoring
Set up performance monitoring
Track cache hit rates
Monitor translation load times
6. Performance Considerations
Caching Strategy
Client-side cache with version control
Service worker for offline support
Background preloading of linked routes
Database Optimization
Proper indexes on route and language fields
Compound indexes for common queries
Regular database maintenance
Load Time Optimization
Route-based loading
Compression of translation data
Efficient cache invalidation
7. Maintenance
Adding New Translations
Update version control
Clear relevant caches
Notify clients of updates
Monitoring
Track translation usage
Monitor cache effectiveness
Alert on performance issues
Backup
Regular database backups
Version history
Rollback procedures


