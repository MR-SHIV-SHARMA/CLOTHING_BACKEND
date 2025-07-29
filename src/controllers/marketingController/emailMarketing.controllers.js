import { EmailCampaign } from "../../Models/marketingModels/emailCampaign.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new email campaign
/**
 * Expected POST data:
 * {
 *   "name": "Summer Sale Campaign",
 *   "subject": "🌞 Summer Sale - Up to 50% Off!",
 *   "htmlContent": "<html>...</html>",
 *   "textContent": "Plain text version",
 *   "senderName": "Clothing Store",
 *   "senderEmail": "sales@clothingstore.com",
 *   "recipientLists": ["newsletter_subscribers", "recent_customers"],
 *   "specificRecipients": [
 *     {"email": "john@example.com", "name": "John Doe"}
 *   ],
 *   "scheduledAt": "2024-07-15T10:00:00Z", (optional)
 *   "tags": ["summer", "sale", "promotion"]
 * }
 */
const createCampaign = asyncHandler(async (req, res) => {
  const {
    name,
    subject,
    htmlContent,
    textContent,
    senderName,
    senderEmail,
    recipientLists,
    specificRecipients,
    scheduledAt,
    tags
  } = req.body;

  // Validate required fields
  if (!name || !subject || !htmlContent || !senderEmail) {
    throw new apiError(400, "Name, subject, HTML content, and sender email are required");
  }

  if (!recipientLists && (!specificRecipients || specificRecipients.length === 0)) {
    throw new apiError(400, "Either recipient lists or specific recipients must be provided");
  }

  const campaign = await EmailCampaign.create({
    name,
    subject,
    htmlContent,
    textContent,
    senderName: senderName || "Clothing Store",
    senderEmail,
    recipientLists: recipientLists || [],
    specificRecipients: specificRecipients || [],
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    tags: tags || [],
    createdBy: req.user._id,
  });

  return res.status(201).json(
    new apiResponse(201, campaign, "Email campaign created successfully")
  );
});

// Get all campaigns
const getCampaigns = asyncHandler(async (req, res) => {
  const { status, tags, page = 1, limit = 10 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (tags) filter.tags = { $in: tags.split(',') };

  const campaigns = await EmailCampaign.find(filter)
    .populate("createdBy", "fullName email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await EmailCampaign.countDocuments(filter);

  return res.status(200).json(
    new apiResponse(200, {
      campaigns,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, "Campaigns fetched successfully")
  );
});

// Get campaign by ID
const getCampaignById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await EmailCampaign.findById(id)
    .populate("createdBy", "fullName email");

  if (!campaign) {
    throw new apiError(404, "Campaign not found");
  }

  return res.status(200).json(
    new apiResponse(200, campaign, "Campaign fetched successfully")
  );
});

// Update campaign
/**
 * Expected PUT data: Same as create, but all fields optional
 */
const updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Don't allow updating status directly - use send endpoint
  delete updateData.status;
  delete updateData.sentAt;
  delete updateData.stats;

  const campaign = await EmailCampaign.findById(id);
  if (!campaign) {
    throw new apiError(404, "Campaign not found");
  }

  // Only allow updates if campaign is in draft or scheduled status
  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    throw new apiError(400, "Can only update draft or scheduled campaigns");
  }

  const updatedCampaign = await EmailCampaign.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).populate("createdBy", "fullName email");

  return res.status(200).json(
    new apiResponse(200, updatedCampaign, "Campaign updated successfully")
  );
});

// Delete campaign
const deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await EmailCampaign.findById(id);
  if (!campaign) {
    throw new apiError(404, "Campaign not found");
  }

  // Don't allow deletion of sent campaigns
  if (campaign.status === 'sent' || campaign.status === 'sending') {
    throw new apiError(400, "Cannot delete sent or sending campaigns");
  }

  await EmailCampaign.findByIdAndDelete(id);

  return res.status(200).json(
    new apiResponse(200, {}, "Campaign deleted successfully")
  );
});

// Send campaign immediately or schedule it
/**
 * Expected POST data:
 * {
 *   "sendNow": true, // or false to schedule
 *   "scheduledAt": "2024-07-15T10:00:00Z" // required if sendNow is false
 * }
 */
const sendCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sendNow = true, scheduledAt } = req.body;

  const campaign = await EmailCampaign.findById(id);
  if (!campaign) {
    throw new apiError(404, "Campaign not found");
  }

  if (campaign.status === 'sent') {
    throw new apiError(400, "Campaign has already been sent");
  }

  if (sendNow) {
    // Update status to sending and trigger immediate send
    campaign.status = 'sending';
    campaign.sentAt = new Date();
    
    // Here you would integrate with your email service (SendGrid, Mailgun, etc.)
    // For now, we'll simulate the send
    setTimeout(async () => {
      try {
        // Simulate email sending logic
        const recipientCount = campaign.specificRecipients.length + 
          (campaign.recipientLists.includes('newsletter_subscribers') ? 1000 : 0) +
          (campaign.recipientLists.includes('all_customers') ? 5000 : 0);

        await EmailCampaign.findByIdAndUpdate(id, {
          status: 'sent',
          'stats.totalSent': recipientCount,
          'stats.totalDelivered': Math.floor(recipientCount * 0.95), // 95% delivery rate
        });
      } catch (error) {
        await EmailCampaign.findByIdAndUpdate(id, { status: 'failed' });
      }
    }, 5000); // Simulate 5 second send time

  } else {
    if (!scheduledAt) {
      throw new apiError(400, "Scheduled time is required when not sending immediately");
    }
    
    campaign.status = 'scheduled';
    campaign.scheduledAt = new Date(scheduledAt);
  }

  await campaign.save();

  return res.status(200).json(
    new apiResponse(200, campaign, sendNow ? "Campaign is being sent" : "Campaign scheduled successfully")
  );
});

// Get campaign statistics
const getCampaignStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await EmailCampaign.findById(id, 'stats status sentAt');
  if (!campaign) {
    throw new apiError(404, "Campaign not found");
  }

  const stats = {
    ...campaign.stats.toObject(),
    openRate: campaign.stats.totalSent > 0 ? 
      ((campaign.stats.totalOpened / campaign.stats.totalSent) * 100).toFixed(2) : 0,
    clickRate: campaign.stats.totalSent > 0 ? 
      ((campaign.stats.totalClicked / campaign.stats.totalSent) * 100).toFixed(2) : 0,
    deliveryRate: campaign.stats.totalSent > 0 ? 
      ((campaign.stats.totalDelivered / campaign.stats.totalSent) * 100).toFixed(2) : 0,
    status: campaign.status,
    sentAt: campaign.sentAt,
  };

  return res.status(200).json(
    new apiResponse(200, stats, "Campaign statistics fetched successfully")
  );
});

// Subscribe to newsletter
/**
 * Expected POST data:
 * {
 *   "email": "user@example.com",
 *   "name": "John Doe" (optional),
 *   "preferences": ["sales", "new_arrivals"] (optional)
 * }
 */
const subscribeToNewsletter = asyncHandler(async (req, res) => {
  const { email, name, preferences } = req.body;

  if (!email) {
    throw new apiError(400, "Email is required");
  }

  // Here you would typically save this to a newsletter subscribers table
  // For now, we'll just return success
  
  return res.status(200).json(
    new apiResponse(200, {
      email,
      name,
      preferences,
      subscribedAt: new Date()
    }, "Successfully subscribed to newsletter")
  );
});

// Unsubscribe from newsletter
/**
 * Expected POST data:
 * {
 *   "token": "unsubscribe_token_here"
 * }
 */
const unsubscribeFromNewsletter = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new apiError(400, "Unsubscribe token is required");
  }

  // Here you would decode the token and unsubscribe the user
  // For now, we'll just return success
  
  return res.status(200).json(
    new apiResponse(200, {}, "Successfully unsubscribed from newsletter")
  );
});

export {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  getCampaignStats,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
};
