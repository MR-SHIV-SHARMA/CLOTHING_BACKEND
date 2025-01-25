import { SeoMetadata } from "../../Models/marketingModels/seoMetadata.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const createSeoMetadata = asyncHandler(async (req, res) => {
  const metadataArray = Array.isArray(req.body) ? req.body : [req.body];

  const createdMetadata = [];
  const errors = [];

  for (const metadata of metadataArray) {
    const { pageUrl, title, description } = metadata;

    if (!pageUrl || !title || !description) {
      errors.push(
        `Error for ${pageUrl || "unknown page"}: Page URL, title, and description are required`
      );
      continue;
    }

    try {
      const newMetadata = await SeoMetadata.create(metadata);
      createdMetadata.push(newMetadata);
    } catch (error) {
      errors.push(`Error for ${pageUrl}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json(
        new apiResponse(
          400,
          { createdMetadata, errors },
          "Some metadata entries could not be created"
        )
      );
  }

  return res
    .status(201)
    .json(
      new apiResponse(201, createdMetadata, "SEO Metadata created successfully")
    );
});

const getSeoMetadata = asyncHandler(async (req, res) => {
  const { pageUrl } = req.params;

  const seoMetadata = await SeoMetadata.findOne({
    pageUrl: pageUrl.toLowerCase(),
  });
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
    { pageUrl: pageUrl.toLowerCase() },
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

  const seoMetadata = await SeoMetadata.findOneAndDelete({
    pageUrl: pageUrl.toLowerCase(),
  });
  if (!seoMetadata) {
    throw new apiError(404, "SEO Metadata not found for this page URL");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "SEO Metadata deleted successfully"));
});

const getAllSeoMetadata = asyncHandler(async (req, res) => {
  const seoMetadata = await SeoMetadata.find({});
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        seoMetadata,
        "All SEO Metadata retrieved successfully"
      )
    );
});

export {
  createSeoMetadata,
  getSeoMetadata,
  updateSeoMetadata,
  deleteSeoMetadata,
  getAllSeoMetadata,
};
