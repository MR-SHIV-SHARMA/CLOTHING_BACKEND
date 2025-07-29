import { SEOService } from '../../services/seoService.js';
import { EnhancedSeoMetadata } from '../../Models/marketingModels/enhancedSeoMetadata.models.js';
import { Product } from '../../Models/adminmodels/product.models.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { apiError } from '../../utils/apiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

/**
 * Create or update SEO metadata for a page
 */
export const createOrUpdateSEO = asyncHandler(async (req, res) => {
  const { pageUrl, pageType, entityId, customData } = req.body;

  if (!pageUrl || !pageType) {
    throw new apiError(400, 'Page URL and page type are required');
  }

  try {
    const seoData = await SEOService.createOrUpdateSEO({
      pageUrl,
      pageType,
      entityId,
      customData
    });

    return res.status(200).json(
      new apiResponse(200, seoData, 'SEO metadata created/updated successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to create/update SEO metadata');
  }
});

/**
 * Get SEO metadata for a specific page
 */
export const getSEOMetadata = asyncHandler(async (req, res) => {
  const { pageUrl } = req.params;

  try {
    const seoData = await EnhancedSeoMetadata.findOne({ pageUrl })
      .populate('createdBy', 'fullname email')
      .populate('lastModifiedBy', 'fullname email');

    if (!seoData) {
      throw new apiError(404, 'SEO metadata not found for this page');
    }

    return res.status(200).json(
      new apiResponse(200, seoData, 'SEO metadata retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get SEO metadata');
  }
});

/**
 * Get all SEO metadata with filtering and pagination
 */
export const getAllSEOMetadata = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    pageType, 
    status, 
    priority,
    search,
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    const filter = {};
    
    if (pageType) filter.pageType = pageType;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    if (search) {
      filter.$or = [
        { metaTitle: { $regex: search, $options: 'i' } },
        { metaDescription: { $regex: search, $options: 'i' } },
        { pageUrl: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    const seoMetadata = await EnhancedSeoMetadata.find(filter)
      .populate('createdBy', 'fullname email')
      .populate('lastModifiedBy', 'fullname email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalCount = await EnhancedSeoMetadata.countDocuments(filter);

    return res.status(200).json(
      new apiResponse(200, {
        seoMetadata,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      }, 'SEO metadata retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get SEO metadata');
  }
});

/**
 * Update SEO metadata
 */
export const updateSEOMetadata = asyncHandler(async (req, res) => {
  const { seoId } = req.params;
  const updateData = req.body;

  try {
    const seoData = await EnhancedSeoMetadata.findByIdAndUpdate(
      seoId,
      {
        ...updateData,
        lastModifiedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    if (!seoData) {
      throw new apiError(404, 'SEO metadata not found');
    }

    return res.status(200).json(
      new apiResponse(200, seoData, 'SEO metadata updated successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to update SEO metadata');
  }
});

/**
 * Delete SEO metadata
 */
export const deleteSEOMetadata = asyncHandler(async (req, res) => {
  const { seoId } = req.params;

  try {
    const seoData = await EnhancedSeoMetadata.findByIdAndDelete(seoId);

    if (!seoData) {
      throw new apiError(404, 'SEO metadata not found');
    }

    return res.status(200).json(
      new apiResponse(200, null, 'SEO metadata deleted successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to delete SEO metadata');
  }
});

/**
 * Generate sitemap
 */
export const generateSitemap = asyncHandler(async (req, res) => {
  try {
    const sitemap = await SEOService.generateSitemap();

    // Set XML content type
    res.set('Content-Type', 'application/xml');

    // Generate XML sitemap
    let xmlSitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlSitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    sitemap.forEach(item => {
      xmlSitemap += '  <url>\n';
      xmlSitemap += `    <loc>${item.url}</loc>\n`;
      xmlSitemap += `    <lastmod>${item.lastmod.toISOString()}</lastmod>\n`;
      xmlSitemap += `    <changefreq>${item.changefreq}</changefreq>\n`;
      xmlSitemap += `    <priority>${item.priority}</priority>\n`;
      xmlSitemap += '  </url>\n';
    });
    
    xmlSitemap += '</urlset>';

    return res.send(xmlSitemap);
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to generate sitemap');
  }
});

/**
 * Generate robots.txt
 */
export const generateRobotsTxt = asyncHandler(async (req, res) => {
  try {
    const robotsTxt = SEOService.generateRobotsTxt();

    res.set('Content-Type', 'text/plain');
    return res.send(robotsTxt);
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to generate robots.txt');
  }
});

/**
 * Audit SEO for a specific page
 */
export const auditSEO = asyncHandler(async (req, res) => {
  const { pageUrl } = req.params;

  try {
    const auditResult = await SEOService.auditSEO(pageUrl);

    return res.status(200).json(
      new apiResponse(200, auditResult, 'SEO audit completed successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to audit SEO');
  }
});

/**
 * Bulk update SEO for products
 */
export const bulkUpdateProductSEO = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  try {
    const results = await SEOService.bulkUpdateProductSEO(productIds);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return res.status(200).json(
      new apiResponse(200, {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      }, `Bulk SEO update completed. ${successCount} successful, ${failureCount} failed.`)
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to bulk update SEO');
  }
});

/**
 * Get SEO analytics and insights
 */
export const getSEOAnalytics = asyncHandler(async (req, res) => {
  try {
    const analytics = await EnhancedSeoMetadata.aggregate([
      {
        $group: {
          _id: null,
          totalPages: { $sum: 1 },
          publishedPages: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          optimizedPages: {
            $sum: { $cond: [{ $eq: ['$status', 'optimized'] }, 1, 0] }
          },
          averageScore: { $avg: '$audit.score' },
          totalIssues: { $sum: { $size: '$audit.issues' } },
          pagesWithStructuredData: {
            $sum: { $cond: [{ $gt: [{ $size: '$structuredData' }, 0] }, 1, 0] }
          }
        }
      }
    ]);

    const pageTypeBreakdown = await EnhancedSeoMetadata.aggregate([
      {
        $group: {
          _id: '$pageType',
          count: { $sum: 1 },
          averageScore: { $avg: '$audit.score' }
        }
      }
    ]);

    const issueBreakdown = await EnhancedSeoMetadata.aggregate([
      { $unwind: '$audit.issues' },
      {
        $group: {
          _id: '$audit.issues.type',
          count: { $sum: 1 },
          severity: { $first: '$audit.issues.severity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentActivity = await EnhancedSeoMetadata.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('pageUrl pageType status updatedAt')
      .lean();

    return res.status(200).json(
      new apiResponse(200, {
        overview: analytics[0] || {},
        pageTypeBreakdown,
        issueBreakdown,
        recentActivity
      }, 'SEO analytics retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get SEO analytics');
  }
});

/**
 * Get SEO recommendations for improvement
 */
export const getSEORecommendations = asyncHandler(async (req, res) => {
  try {
    // Get pages that need attention
    const pagesNeedingAttention = await EnhancedSeoMetadata.find({
      $or: [
        { 'audit.score': { $lt: 70 } },
        { status: 'needs_review' },
        { 'audit.issues.severity': 'critical' }
      ]
    })
    .sort({ 'audit.score': 1 })
    .limit(20)
    .select('pageUrl pageType audit.score audit.issues status')
    .lean();

    // Get common SEO issues
    const commonIssues = await EnhancedSeoMetadata.aggregate([
      { $unwind: '$audit.issues' },
      {
        $group: {
          _id: '$audit.issues.type',
          count: { $sum: 1 },
          severity: { $first: '$audit.issues.severity' },
          description: { $first: '$audit.issues.description' },
          recommendation: { $first: '$audit.issues.recommendation' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const recommendations = [
      {
        category: 'Critical Issues',
        items: pagesNeedingAttention.filter(page => 
          page.audit?.issues?.some(issue => issue.severity === 'critical')
        ).slice(0, 5)
      },
      {
        category: 'Low Scoring Pages',
        items: pagesNeedingAttention.filter(page => 
          page.audit?.score < 50
        ).slice(0, 5)
      },
      {
        category: 'Common Issues',
        items: commonIssues.slice(0, 5)
      }
    ];

    return res.status(200).json(
      new apiResponse(200, {
        recommendations,
        summary: {
          totalPagesNeedingAttention: pagesNeedingAttention.length,
          criticalIssues: commonIssues.filter(issue => issue.severity === 'critical').length,
          averageScore: pagesNeedingAttention.reduce((sum, page) => sum + (page.audit?.score || 0), 0) / pagesNeedingAttention.length
        }
      }, 'SEO recommendations retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get SEO recommendations');
  }
});

/**
 * Generate structured data for a specific entity
 */
export const generateStructuredData = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;

  try {
    let structuredData;

    switch (entityType) {
      case 'product':
        const product = await Product.findById(entityId)
          .populate('brand', 'name')
          .populate('category', 'name')
          .populate('merchant', 'name')
          .lean();
        
        if (!product) {
          throw new apiError(404, 'Product not found');
        }
        
        structuredData = SEOService.generateProductStructuredData(product);
        break;
        
      case 'organization':
        structuredData = SEOService.generateOrganizationStructuredData();
        break;
        
      default:
        throw new apiError(400, 'Invalid entity type');
    }

    return res.status(200).json(
      new apiResponse(200, structuredData, 'Structured data generated successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to generate structured data');
  }
});
