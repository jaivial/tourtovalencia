import { ImageData } from './images';

/**
 * STRICT base interface for all section types
 */
export interface BaseSectionType {
  backgroundImage?: ImageData;
  h1?: string;
  h2?: string;
  description?: string;
}

/**
 * STRICT interface for SanJuan Section 1
 */
export interface sanJuanSection1Type extends BaseSectionType {
  h1: string;
  firstSquareH3: string;
  firstSquareP: string;
  secondSquareH3: string;
  secondSquareP: string;
  thirdSquareH3: string;
  thirdSquareP: string;
  button: string;
}

/**
 * STRICT interface for SanJuan Section 2
 */
export interface sanJuansection2Type {
  firstH3: string;
  secondH3: string;
  thirdH3: string;
  sectionImage: ImageData;
  lottieAnimation?: {
    enabled: boolean;
    src: string;
  };
}

/**
 * STRICT interface for SanJuan Section 3
 */
export interface sanJuanSection3Type {
  images: {
    source: string;
    alt: string;
  }[];
}

/**
 * STRICT interface for SanJuan Section 4
 */
export interface sanJuansection4Type {
  firstH3: string;
  secondH3: string;
  thirdH3: string;
  lottieAnimation?: {
    enabled: boolean;
    src: string;
  };
}

/**
 * STRICT interface for SanJuan Section 5
 */
export interface sanJuanSection5Type {
  firstH3: string;
  secondH3: string;
  thirdH3: string;
  fourthH3: string;
  fifthH3: string;
  image?: ImageData;
  lottieAnimation?: {
    enabled: boolean;
    src: string;
  };
}

/**
 * STRICT interface for Index Section 5
 */
export interface IndexSection5Type extends BaseSectionType {
  firstH3: string;
  secondH3: string;
}

/**
 * STRICT interface for SanJuan Section 6
 */
export interface SanJuanSection6Type {
  cardTitle: string;
  cardDescription: string;
  firstH4: string;
  list: {
    li: string;
    index: number;
  }[];
  secondH4: string;
  secondH4span: string;
  button: string;
}

/**
 * STRICT interface for page content with index signature
 */
export interface PageContent {
  [key: string]: unknown;
  section1?: sanJuanSection1Type;
  section2?: sanJuansection2Type;
  section3?: sanJuanSection3Type;
  section4?: sanJuansection4Type;
  section5?: sanJuanSection5Type;
  section6?: SanJuanSection6Type;
  indexSection5?: IndexSection5Type;
  timeline?: unknown;
  meetingPoint?: string;
  title?: string;
  description?: string;
  price?: number;
  duration?: string;
  includes?: string;
}

/**
 * STRICT interface for Page with proper base64 serialization support
 */
export interface Page {
  _id?: string;
  slug: string;
  name: string;
  template?: string;
  content: {
    es: PageContent;
    en: PageContent;
  };
  status: 'active' | 'upcoming';
  createdAt: Date;
  updatedAt: Date;
}
