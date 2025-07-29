import { EnhancedSeoMetadata } from '../Models/marketingModels/enhancedSeoMetadata.models.js';
import { Product } from '../Models/adminmodels/product.models.js';
import { apiError } from '../utils/apiError.js';
import slugify from 'slugify';

export class SEOService {
  /**
   * Generate SEO-friendly slug
   */
  static generateSlug(text) {
    return slugify(text, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }

  /**
   * Auto-generate meta title based on content type
   */
  static generateMetaTitle(data, pageType) {
    switch (pageType) {
      case 'product':
        return `${data.name} - ${data.brand} | Buy Online`;
      case 'category':
        return `${data.name} Collection | Premium Clothing`;
      case 'homepage':
        return 'Premium Clothing Store | Latest Fashion Trends';
      default:
        return data.title || 'Fashion Store';
    }
  }

  /**
   * Auto-generate meta description
   */
  static generateMetaDescription(data, pageType) {
    switch (pageType) {
      case 'product':
        return `Shop ${data.name} by ${data.brand}. ${data.description.substring(0, 120)}... Free shipping available.`;
      case 'category':
        return `Explore our ${data.name} collection. Premium quality clothing with latest trends. Free shipping on orders over $50.`;
      case 'homepage':
        return 'Discover premium clothing and latest fashion trends. Shop from top brands with free shipping and easy returns.';
      default:
        return 'Premium clothing store with latest fashion trends and top brands.';
    }
  }

  /**
   * Generate keywords from content
   */
  static generateKeywords(data, pageType) {
    const keywords = [];
    
    switch (pageType) {
      case 'product':
        if (data.name) keywords.push(data.name.toLowerCase());
        if (data.brand) keywords.push(data.brand.toLowerCase());
        if (data.category) keywords.push(data.category.toLowerCase());
        if (data.gender) keywords.push(`${data.gender.toLowerCase()} clothing`);
        if (data.material) keywords.push(data.material.toLowerCase());
        break;
      case 'category':
        if (data.name) keywords.push(data.name.toLowerCase());
        keywords.push('clothing', 'fashion', 'online store');
        break;
      default:
        keywords.push('clothing', 'fashion', 'online store', 'premium');
    }
    
    return keywords;
  }

  /**
   * Generate structured data for products
   */
  static generateProductStructuredData(product) {
    return {
      type: 'Product',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images,
        brand: {
          '@type': 'Brand',
          name: product.brand?.name || 'Unknown'
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          condition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: product.merchant?.name || 'Fashion Store'
          }
        },
        aggregateRating: product.ratings?.count > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: product.ratings.average,
          reviewCount: product.ratings.count
        } : undefined,
        review: product.reviews?.map(review => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: review.user?.fullname || 'Anonymous'
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating
          },
          reviewBody: review.comment
        })) || []
      }
    };
  }

  /**
   * Generate organization structured data
   */
  static generateOrganizationStructuredData() {
    return {
      type: 'Organization',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Fashion Store',
        url: process.env.DOMAIN || 'https://example.com',
        logo: `${process.env.DOMAIN}/logo.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-555-123-4567',
          contactType: 'customer service'
        },
        sameAs: [
          'https://facebook.com/fashionstore',
          'https://twitter.com/fashionstore',
          'https://instagram.com/fashionstore'
        ]
      }
    };
  }

  /**
   * Generate breadcrumb structured data
   */
  static generateBreadcrumbStructuredData(breadcrumbs) {
    return {
      type: 'BreadcrumbList',
      data: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      }
    };
  }

  /**
   * Create or update SEO metadata for a page
   */
  static async createOrUpdateSEO(pageData) {
    const {
      pageUrl,
      pageType,
      entityId, // Product ID, Category ID, etc.
      customData = {}
    } = pageData;

    try {
      // Generate slug from URL
      const slug = this.generateSlug(pageUrl.replace(/^\/+|\/+$/g, ''));

      // Get entity data if needed
      let entityData = {};
      if (entityId && pageType === 'product') {
        entityData = await Product.findById(entityId)
          .populate('brand', 'name')
          .populate('category', 'name')
          .populate('merchant', 'name')
          .lean();
      }

      const data = { ...entityData, ...customData };

      // Auto-generate SEO data
      const metaTitle = this.generateMetaTitle(data, pageType);
      const metaDescription = this.generateMetaDescription(data, pageType);
      const keywords = this.generateKeywords(data, pageType);

      // Generate structured data
      const structuredData = [];
      
      if (pageType === 'product' && entityData) {
        structuredData.push(this.generateProductStructuredData(entityData));
      }
      
      // Always add organization data
      structuredData.push(this.generateOrganizationStructuredData());

      // Generate Open Graph data
      const openGraph = {
        title: metaTitle,
        description: metaDescription,
        type: pageType === 'product' ? 'product' : 'website',
        url: `${process.env.DOMAIN}${pageUrl}`,
        siteName: 'Fashion Store',
        image: {
          url: entityData?.images?.[0] || `${process.env.DOMAIN}/default-og-image.png`,
          width: 1200,
          height: 630,
          alt: metaTitle
        },
        productData: pageType === 'product' ? {
          price: `${entityData?.price} USD`,
          currency: 'USD',
          availability: entityData?.stock > 0 ? 'in stock' : 'out of stock',
          condition: 'new',
          brand: entityData?.brand?.name,
          category: entityData?.category?.name
        } : undefined
      };

      // Generate Twitter Card data
      const twitterCard = {
        card: 'summary_large_image',
        site: '@fashionstore',
        title: metaTitle,
        description: metaDescription,
        image: {
          url: entityData?.images?.[0] || `${process.env.DOMAIN}/default-twitter-image.png`,
          alt: metaTitle
        },
        productData: pageType === 'product' ? {
          label1: 'Price',
          data1: `$${entityData?.price}`,
          label2: 'Availability',
          data2: entityData?.stock > 0 ? 'In Stock' : 'Out of Stock'
        } : undefined
      };

      // Create or update SEO metadata
      const seoData = {
        pageUrl,
        slug,
        pageType,
        metaTitle,
        metaDescription,
        keywords,
        canonicalUrl: `${process.env.DOMAIN}${pageUrl}`,
        openGraph,
        twitterCard,
        structuredData,
        status: 'published'
      };

      const seoMetadata = await EnhancedSeoMetadata.findOneAndUpdate(
        { pageUrl },
        seoData,
        { 
          new: true, 
          upsert: true,
          setDefaultsOnInsert: true 
        }
      );

      return seoMetadata;

    } catch (error) {
      throw new apiError(500, `Failed to create/update SEO metadata: ${error.message}`);
    }
  }

  /**
   * Generate sitemap data
   */
  static async generateSitemap() {
    try {
      const seoPages = await EnhancedSeoMetadata.find({ status: 'published' })
        .select('pageUrl slug lastModified priority')
        .lean();

      const sitemap = seoPages.map(page => ({
        url: `${process.env.DOMAIN}${page.pageUrl}`,
        lastmod: page.updatedAt || page.createdAt,
        changefreq: this.getChangeFrequency(page.pageType),
        priority: this.getPriority(page.pageType, page.priority)
      }));

      return sitemap;

    } catch (error) {
      throw new apiError(500, `Failed to generate sitemap: ${error.message}`);
    }
  }

  /**
   * Get change frequency for sitemap
   */
  static getChangeFrequency(pageType) {
    const frequencies = {
      homepage: 'daily',
      product: 'weekly',
      category: 'weekly',
      blog: 'monthly',
      about: 'monthly',
      contact: 'monthly'
    };
    
    return frequencies[pageType] || 'monthly';
  }

  /**
   * Get priority for sitemap
   */
  static getPriority(pageType, customPriority) {
    if (customPriority) {
      const priorityMap = {
        low: 0.3,
        medium: 0.5,
        high: 0.8,
        critical: 1.0
      };
      return priorityMap[customPriority] || 0.5;
    }

    const priorities = {
      homepage: 1.0,
      category: 0.8,
      product: 0.6,
      blog: 0.4,
      about: 0.3,
      contact: 0.3
    };

    return priorities[pageType] || 0.5;
  }

  /**
   * Audit SEO for a page
   */
  static async auditSEO(pageUrl) {
    try {
      const seoData = await EnhancedSeoMetadata.findOne({ pageUrl });
      
      if (!seoData) {
        throw new apiError(404, 'SEO data not found for this page');
      }

      const issues = [];
      let score = 100;

      // Check meta title
      if (!seoData.metaTitle) {
        issues.push({
          type: 'missing_meta_title',
          severity: 'critical',
          description: 'Meta title is missing',
          recommendation: 'Add a descriptive meta title'
        });
        score -= 20;
      } else if (seoData.metaTitle.length > 60) {
        issues.push({
          type: 'title_too_long',
          severity: 'medium',
          description: 'Meta title is too long',
          recommendation: 'Keep meta title under 60 characters'
        });
        score -= 10;
      } else if (seoData.metaTitle.length < 30) {
        issues.push({
          type: 'title_too_short',
          severity: 'low',
          description: 'Meta title is too short',
          recommendation: 'Make meta title more descriptive'
        });
        score -= 5;
      }

      // Check meta description
      if (!seoData.metaDescription) {
        issues.push({
          type: 'missing_meta_description',
          severity: 'high',
          description: 'Meta description is missing',
          recommendation: 'Add a compelling meta description'
        });
        score -= 15;
      }

      // Check images for alt text
      if (seoData.images.some(img => !img.alt)) {
        issues.push({
          type: 'missing_alt_text',
          severity: 'medium',
          description: 'Some images are missing alt text',
          recommendation: 'Add descriptive alt text to all images'
        });
        score -= 10;
      }

      // Check structured data
      if (!seoData.structuredData || seoData.structuredData.length === 0) {
        issues.push({
          type: 'missing_structured_data',
          severity: 'medium',
          description: 'Structured data is missing',
          recommendation: 'Add relevant structured data'
        });
        score -= 10;
      }

      // Update audit data
      seoData.audit = {
        lastAuditDate: new Date(),
        issues,
        score: Math.max(0, score)
      };

      await seoData.save();

      return {
        score: seoData.audit.score,
        issues: seoData.audit.issues,
        recommendations: this.generateRecommendations(seoData)
      };

    } catch (error) {
      throw new apiError(500, `Failed to audit SEO: ${error.message}`);
    }
  }

  /**
   * Generate SEO recommendations
   */
  static generateRecommendations(seoData) {
    const recommendations = [];

    // Keywords recommendations
    if (!seoData.keywords || seoData.keywords.length === 0) {
      recommendations.push('Add relevant keywords to improve search visibility');
    }

    // Content recommendations
    if (!seoData.content || !seoData.content.wordCount) {
      recommendations.push('Analyze and optimize content length and keyword density');
    }

    // Performance recommendations
    if (!seoData.performance || !seoData.performance.mobileOptimized) {
      recommendations.push('Ensure the page is mobile-optimized');
    }

    // Social media recommendations
    if (!seoData.openGraph.image || !seoData.twitterCard.image) {
      recommendations.push('Add optimized social media images');
    }

    return recommendations;
  }

  /**
   * Bulk update SEO for products
   */
  static async bulkUpdateProductSEO(productIds = []) {
    try {
      let products;
      
      if (productIds.length > 0) {
        products = await Product.find({ _id: { $in: productIds } })
          .populate('brand', 'name')
          .populate('category', 'name')
          .populate('merchant', 'name')
          .lean();
      } else {
        products = await Product.find({})
          .populate('brand', 'name')
          .populate('category', 'name')
          .populate('merchant', 'name')
          .lean();
      }

      const results = [];

      for (const product of products) {
        try {
          const pageUrl = `/product/${this.generateSlug(product.name)}`;
          
          const seoData = await this.createOrUpdateSEO({
            pageUrl,
            pageType: 'product',
            entityId: product._id,
            customData: product
          });

          results.push({
            productId: product._id,
            pageUrl,
            success: true,
            seoId: seoData._id
          });
        } catch (error) {
          results.push({
            productId: product._id,
            success: false,
            error: error.message
          });
        }
      }

      return results;

    } catch (error) {
      throw new apiError(500, `Failed to bulk update SEO: ${error.message}`);
    }
  }

  /**
   * Generate robots.txt content
   */
  static generateRobotsTxt() {
    const domain = process.env.DOMAIN || 'https://example.com';
    
    return `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /account/
Disallow: /cart/

# Allow important pages
Allow: /product/
Allow: /category/
Allow: /search/

# Sitemap location
Sitemap: ${domain}/sitemap.xml

# Crawl delay
Crawl-delay: 1`;
  }
}
