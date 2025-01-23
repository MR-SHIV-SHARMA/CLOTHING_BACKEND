import { SeoMetadata } from "../../Models/seoMetadata.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const createSeoMetadata = asyncHandler(async (req, res) => {
  const {
    pageUrl,
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
  } = req.body;

  if (!pageUrl || !title || !description) {
    throw new apiError(400, "Page URL, title, and description are required");
  }

  const existingMetadata = await SeoMetadata.findOne({ pageUrl });
  if (existingMetadata) {
    throw new apiError(400, "SEO Metadata for this page URL already exists");
  }

  const seoMetadata = await SeoMetadata.create({
    pageUrl,
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
  });

  return res
    .status(201)
    .json(
      new apiResponse(201, seoMetadata, "SEO Metadata created successfully")
    );
});

const getSeoMetadata = asyncHandler(async (req, res) => {
  const { pageUrl } = req.params;

  const seoMetadata = await SeoMetadata.findOne({ pageUrl });
  if (!seoMetadata) {
    throw new apiError(404, "SEO Metadata not found for this page URL");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, seoMetadata, "SEO Metadata retrieved successfully")
    );
});

const updateSeoMetadata = asyncHandler(async (req, res) => {
  const { pageUrl } = req.params;
  const updateData = req.body;

  const seoMetadata = await SeoMetadata.findOneAndUpdate(
    { pageUrl },
    updateData,
    { new: true, runValidators: true }
  );
  if (!seoMetadata) {
    throw new apiError(404, "SEO Metadata not found for this page URL");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, seoMetadata, "SEO Metadata updated successfully")
    );
});

const deleteSeoMetadata = asyncHandler(async (req, res) => {
  const { pageUrl } = req.params;

  const seoMetadata = await SeoMetadata.findOneAndDelete({ pageUrl });
  if (!seoMetadata) {
    throw new apiError(404, "SEO Metadata not found for this page URL");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "SEO Metadata deleted successfully"));
});

export {
  createSeoMetadata,
  getSeoMetadata,
  updateSeoMetadata,
  deleteSeoMetadata,
};
