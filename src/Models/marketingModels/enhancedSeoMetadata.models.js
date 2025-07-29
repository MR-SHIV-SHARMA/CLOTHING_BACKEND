import mongoose from "mongoose";

// Schema for structured data/schema markup
const structuredDataSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'Product',
      'Organization',
      'WebSite',
      'BreadcrumbList',
      'Article',
      'Review',
      'FAQ',
      'LocalBusiness',
      'Store',
      'Offer',
      'Brand'
    ],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

// Schema for Open Graph metadata
const openGraphSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  image: {
    url: { type: String },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String }
  },
  type: {
    type: String,
    enum: ['website', 'article', 'product', 'profile'],
    default: 'website'
  },
  url: { type: String },
  siteName: { type: String },
  locale: { type: String, default: 'en_US' },
  // Product specific OG data
  productData: {
    price: { type: String },
    currency: { type: String },
    availability: {
      type: String,
      enum: ['in stock', 'out of stock', 'preorder', 'discontinued']
    },
    condition: {
      type: String,
      enum: ['new', 'used', 'refurbished']
    },
    brand: { type: String },
    category: { type: String }
  }
});

// Schema for Twitter Card metadata
const twitterCardSchema = new mongoose.Schema({
  card: {
    type: String,
    enum: ['summary', 'summary_large_image', 'app', 'player'],
    default: 'summary_large_image'
  },
  site: { type: String }, // @username for website
  creator: { type: String }, // @username for content creator
  title: { type: String },
  description: { type: String },
  image: {
    url: { type: String },
    alt: { type: String }
  },
  // Product specific Twitter data
  productData: {
    label1: { type: String },
    data1: { type: String },
    label2: { type: String },
    data2: { type: String }
  }
});

const seoMetadataSchema = new mongoose.Schema(
  {
    // Page identification
    pageUrl: { 
      type: String, 
      required: true, 
      unique: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    pageType: {
      type: String,
      enum: [
        'homepage',
        'category',
        'product',
        'blog',
        'about',
        'contact',
        'search',
        'checkout',
        'account',
        'custom'
      ],
      required: true
    },
    
    // Basic SEO metadata
    metaTitle: { 
      type: String, 
      required: true,
      maxlength: [60, 'Meta title should not exceed 60 characters']
    },
    metaDescription: { 
      type: String, 
      required: true,
      maxlength: [160, 'Meta description should not exceed 160 characters']
    },
    keywords: [{ 
      type: String,
      maxlength: [50, 'Each keyword should not exceed 50 characters']
    }],
    
    // Canonical URL
    canonicalUrl: { type: String },
    
    // Robot instructions
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
      noarchive: { type: Boolean, default: false },
      nosnippet: { type: Boolean, default: false },
      noimageindex: { type: Boolean, default: false }
    },
    
    // Language and regional targeting
    language: { type: String, default: 'en' },
    region: { type: String },
    hreflang: [{
      lang: { type: String },
      url: { type: String }
    }],
    
    // Social media metadata
    openGraph: openGraphSchema,
    twitterCard: twitterCardSchema,
    
    // Structured data
    structuredData: [structuredDataSchema],
    
    // Content optimization
    headings: {
      h1: [{ type: String }],
      h2: [{ type: String }],
      h3: [{ type: String }]
    },
    
    // Image optimization
    images: [{
      url: { type: String },
      alt: { type: String },
      title: { type: String },
      caption: { type: String },
      width: { type: Number },
      height: { type: Number }
    }],
    
    // Internal linking
    internalLinks: [{
      url: { type: String },
      anchorText: { type: String },
      title: { type: String }
    }],
    
    // External linking
    externalLinks: [{
      url: { type: String },
      anchorText: { type: String },
      rel: { 
        type: String, 
        enum: ['nofollow', 'dofollow', 'sponsored', 'ugc'],
        default: 'dofollow'
      }
    }],
    
    // Content analysis
    content: {
      wordCount: { type: Number },
      readingTime: { type: Number }, // in minutes
      keywordDensity: [{
        keyword: { type: String },
        count: { type: Number },
        density: { type: Number } // percentage
      }],
      contentScore: { type: Number, min: 0, max: 100 }
    },
    
    // Performance metrics
    performance: {
      pageLoadTime: { type: Number },
      coreWebVitals: {
        lcp: { type: Number }, // Largest Contentful Paint
        fid: { type: Number }, // First Input Delay
        cls: { type: Number }  // Cumulative Layout Shift
      },
      mobileOptimized: { type: Boolean, default: false }
    },
    
    // SEO status and tracking
    status: {
      type: String,
      enum: ['draft', 'published', 'optimized', 'needs_review'],
      default: 'draft'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    
    // Analytics integration
    analytics: {
      googleAnalyticsId: { type: String },
      googleTagManagerId: { type: String },
      facebookPixelId: { type: String },
      customTracking: [{
        name: { type: String },
        id: { type: String },
        type: { type: String }
      }]
    },
    
    // SEO audit data
    audit: {
      lastAuditDate: { type: Date },
      issues: [{
        type: {
          type: String,
          enum: [
            'missing_meta_description',
            'title_too_long',
            'title_too_short',
            'duplicate_content',
            'missing_alt_text',
            'broken_links',
            'slow_loading',
            'mobile_issues',
            'missing_structured_data'
          ]
        },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical']
        },
        description: { type: String },
        recommendation: { type: String },
        fixed: { type: Boolean, default: false }
      }],
      score: { type: Number, min: 0, max: 100 }
    },
    
    // Related content for internal linking
    relatedPages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SeoMetadata'
    }],
    
    // Creator and modification tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Auto-generation settings
    autoGenerate: {
      metaTitle: { type: Boolean, default: false },
      metaDescription: { type: Boolean, default: false },
      keywords: { type: Boolean, default: false },
      structuredData: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

seoMetadataSchema.index({ pageUrl: 1 });
seoMetadataSchema.index({ slug: 1 });

export const EnhancedSeoMetadata = mongoose.model("EnhancedSeoMetadata", seoMetadataSchema);

