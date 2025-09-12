const logger = require('../logger');
const { STATUS, ENTITY } = require('../constants/constants');

class OfferService {
  constructor(app) {
    this.app = app;
    this.userModel = app.get('userModel');
    this.emailService = app.get('emailService');
    this.notificationService = app.get('notificationService');
  }

  // Create job offer
  async createOffer(companyId, candidateId, offerData) {
    try {
      const offer = {
        id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyId,
        candidateId,
        applicationId: offerData.applicationId,
        jobId: offerData.jobId,
        jobTitle: offerData.jobTitle,
        position: offerData.position,
        department: offerData.department,

        // Compensation details
        salary: {
          amount: offerData.salary.amount,
          currency: offerData.salary.currency || 'USD',
          period: offerData.salary.period || 'hour', // hour, month, year
          paySchedule: offerData.salary.paySchedule || 'bi-weekly'
        },

        // Employment details
        employment: {
          type: offerData.employment.type || 'internship', // internship, full-time, part-time, contract
          startDate: new Date(offerData.employment.startDate),
          endDate: offerData.employment.endDate ? new Date(offerData.employment.endDate) : null,
          duration: offerData.employment.duration, // in months for internships
          workLocation: offerData.employment.workLocation || 'hybrid', // remote, hybrid, on-site
          hoursPerWeek: offerData.employment.hoursPerWeek || 40
        },

        // Benefits and perks
        benefits: offerData.benefits || [],
        perks: offerData.perks || [],

        // Offer terms
        terms: {
          probationPeriod: offerData.terms?.probationPeriod || null,
          noticePeriod: offerData.terms?.noticePeriod || null,
          confidentialityAgreement: offerData.terms?.confidentialityAgreement || false,
          nonCompeteClause: offerData.terms?.nonCompeteClause || false
        },

        // Offer timeline
        expiresAt: new Date(offerData.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
        responseDeadline: new Date(offerData.responseDeadline || Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days default

  // Status and tracking
  status: ENTITY.OFFER.STRINGS.PENDING, // legacy string for compatibility
  statusCode: STATUS.PENDING, // 0=pending,1=accepted,2=rejected
        sentAt: new Date(),
        respondedAt: null,

        // Additional details
        message: offerData.message || '',
        attachments: offerData.attachments || [],

        // Contact information
        contactPerson: {
          name: offerData.contactPerson.name,
          title: offerData.contactPerson.title,
          email: offerData.contactPerson.email,
          phone: offerData.contactPerson.phone || null
        },

        // Negotiation history
        negotiations: [],

        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store offer in company's offers array
      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(companyId) },
        {
          $push: {
            'company.offers': offer
          }
        }
      );

      // Store offer reference in candidate's profile
      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(candidateId) },
        {
          $push: {
            'internship.offers': {
              id: offer.id,
              companyId,
              jobId: offer.jobId,
              jobTitle: offer.jobTitle,
              position: offer.position,
              salary: offer.salary,
              employment: offer.employment,
              status: offer.status,
              statusCode: offer.statusCode,
              sentAt: offer.sentAt,
              expiresAt: offer.expiresAt
            }
          }
        }
      );

      // Send notifications
      if (this.notificationService) {
        await this.notificationService.sendOfferNotification(candidateId, offer);
      }

      // Send email notification
      if (this.emailService) {
        const candidate = await this.userModel.findById(candidateId);
        if (candidate) {
          await this.emailService.sendOfferNotification(candidate, offer);
        }
      }

      logger.info('Job offer created', {
        offerId: offer.id,
        companyId,
        candidateId,
        jobTitle: offer.jobTitle
      });

      return offer;
    } catch (error) {
      logger.error('Error creating job offer', { error: error.message, companyId, candidateId });
      throw error;
    }
  }

  // Get offers for a company
  async getCompanyOffers(companyId, filters = {}) {
    try {
  const { status, startDate, endDate, jobId } = filters;

      const company = await this.userModel.collection.findOne(
        { _id: this.userModel.toObjectId(companyId) },
        { projection: { 'company.offers': 1 } }
      );

      if (!company || !company.company?.offers) {
        return [];
      }

      let offers = company.company.offers;

      // Apply filters
      if (status !== undefined && status !== null) {
        // Accept string or code; map locally (no helper logic file)
        const s = typeof status === 'string' ? status.toLowerCase() : status;
        const targetCode = typeof s === 'number'
          ? (s === 1 ? STATUS.ACCEPTED : s === 2 ? STATUS.REJECTED : STATUS.PENDING)
          : (s === 'accepted' ? STATUS.ACCEPTED : s === 'rejected' ? STATUS.REJECTED : STATUS.PENDING);
        const mapStringToCode = (val) => (val === 'accepted' ? STATUS.ACCEPTED : val === 'rejected' ? STATUS.REJECTED : STATUS.PENDING);
        offers = offers.filter(o => (o.statusCode ?? mapStringToCode(String(o.status).toLowerCase())) === targetCode);
      }

      if (jobId) {
        offers = offers.filter(o => o.jobId === jobId);
      }

      if (startDate) {
        offers = offers.filter(o =>
          new Date(o.sentAt) >= new Date(startDate)
        );
      }

      if (endDate) {
        offers = offers.filter(o =>
          new Date(o.sentAt) <= new Date(endDate)
        );
      }

      // Sort by sent date (newest first)
      offers.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

      return offers;
    } catch (error) {
      logger.error('Error fetching company offers', { error: error.message, companyId });
      throw error;
    }
  }

  // Get offers for a candidate
  async getCandidateOffers(candidateId, filters = {}) {
    try {
  const { status, startDate, endDate } = filters;

      const candidate = await this.userModel.collection.findOne(
        { _id: this.userModel.toObjectId(candidateId) },
        { projection: { 'internship.offers': 1 } }
      );

      if (!candidate || !candidate.internship?.offers) {
        return [];
      }

      let offers = candidate.internship.offers;

      // Apply filters
      if (status !== undefined && status !== null) {
        const s = typeof status === 'string' ? status.toLowerCase() : status;
        const targetCode = typeof s === 'number'
          ? (s === 1 ? STATUS.ACCEPTED : s === 2 ? STATUS.REJECTED : STATUS.PENDING)
          : (s === 'accepted' ? STATUS.ACCEPTED : s === 'rejected' ? STATUS.REJECTED : STATUS.PENDING);
        const mapStringToCode = (val) => (val === 'accepted' ? STATUS.ACCEPTED : val === 'rejected' ? STATUS.REJECTED : STATUS.PENDING);
        offers = offers.filter(o => (o.statusCode ?? mapStringToCode(String(o.status).toLowerCase())) === targetCode);
      }

      if (startDate) {
        offers = offers.filter(o =>
          new Date(o.sentAt) >= new Date(startDate)
        );
      }

      if (endDate) {
        offers = offers.filter(o =>
          new Date(o.sentAt) <= new Date(endDate)
        );
      }

      // Sort by sent date (newest first)
      offers.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

      return offers;
    } catch (error) {
      logger.error('Error fetching candidate offers', { error: error.message, candidateId });
      throw error;
    }
  }

  // Update offer status
  async updateOfferStatus(offerId, companyId, status, response = null) {
    try {
  const validStatuses = ['pending', 'accepted', 'rejected', 'withdrawn', 'expired', 'negotiating'];
  // allow numeric codes 0/1/2 or string names; keep mapping here
  const statusName = typeof status === 'string' ? String(status).toLowerCase() : (status === 1 ? 'accepted' : status === 2 ? 'rejected' : 'pending');
  const statusCode = statusName === 'accepted' ? STATUS.ACCEPTED : statusName === 'rejected' ? STATUS.REJECTED : STATUS.PENDING;
      if (!validStatuses.includes(statusName)) {
        throw new Error('Invalid offer status');
      }

      const updateData = {
        'company.offers.$.status': statusName,
        'company.offers.$.statusCode': statusCode,
        'company.offers.$.updatedAt': new Date()
      };

      if (['accepted', 'rejected'].includes(status)) {
        updateData['company.offers.$.respondedAt'] = new Date();
      }

      if (response) {
        updateData['company.offers.$.candidateResponse'] = response;
      }

      // Update in company's offers
      await this.userModel.collection.updateOne(
        {
          _id: this.userModel.toObjectId(companyId),
          'company.offers.id': offerId
        },
        { $set: updateData }
      );

      // Get offer details to update candidate's record
      const company = await this.userModel.collection.findOne(
        { _id: this.userModel.toObjectId(companyId) },
        { projection: { 'company.offers': 1 } }
      );

  const offer = company?.company?.offers?.find(o => o.id === offerId);

      if (offer) {
        // Update in candidate's offers
        await this.userModel.collection.updateOne(
          {
            _id: this.userModel.toObjectId(offer.candidateId),
            'internship.offers.id': offerId
          },
          {
            $set: {
              'internship.offers.$.status': statusName,
              'internship.offers.$.statusCode': statusCode
            }
          }
        );

        // Send notification to relevant parties
        if (this.notificationService) {
          if (statusName === 'accepted') {
            // Notify company of acceptance
            await this.notificationService.createNotification(companyId, {
              type: 'offer_accepted',
              title: `Offer Accepted: ${offer.jobTitle}`,
              message: `Your job offer has been accepted by the candidate`,
              category: 'offer',
              priority: 'high',
              data: {
                offerId,
                jobTitle: offer.jobTitle,
                candidateId: offer.candidateId
              },
              actionUrl: `/company/offers/${offerId}`,
              actionText: 'View Offer'
            });
          } else if (statusName === 'rejected') {
            // Notify company of rejection
            await this.notificationService.createNotification(companyId, {
              type: 'offer_rejected',
              title: `Offer Declined: ${offer.jobTitle}`,
              message: `Your job offer has been declined by the candidate`,
              category: 'offer',
              priority: 'normal',
              data: {
                offerId,
                jobTitle: offer.jobTitle,
                candidateId: offer.candidateId
              },
              actionUrl: `/company/offers/${offerId}`,
              actionText: 'View Offer'
            });
          }
        }
      }

  logger.info('Offer status updated', { offerId, companyId, status: statusName, statusCode });
      return { success: true, message: 'Offer status updated successfully' };
    } catch (error) {
      logger.error('Error updating offer status', { error: error.message, offerId, companyId });
      throw error;
    }
  }

  // Add negotiation to offer
  async addNegotiation(offerId, companyId, negotiationData) {
    try {
      const negotiation = {
        id: `negotiation-${Date.now()}`,
        from: negotiationData.from, // 'company' or 'candidate'
        message: negotiationData.message,
        proposedChanges: negotiationData.proposedChanges || {},
        timestamp: new Date(),
        status: 'pending' // pending, accepted, rejected
      };

      // Add negotiation to offer
      await this.userModel.collection.updateOne(
        {
          _id: this.userModel.toObjectId(companyId),
          'company.offers.id': offerId
        },
        {
          $push: {
            'company.offers.$.negotiations': negotiation
          },
          $set: {
            'company.offers.$.status': 'negotiating',
            'company.offers.$.updatedAt': new Date()
          }
        }
      );

      logger.info('Negotiation added to offer', { offerId, companyId, from: negotiationData.from });
      return negotiation;
    } catch (error) {
      logger.error('Error adding negotiation', { error: error.message, offerId, companyId });
      throw error;
    }
  }

  // Check for expired offers and update status
  async checkExpiredOffers() {
    try {
      const now = new Date();

      // Find companies with expired offers
      const companies = await this.userModel.collection.find({
        role: 'company',
        'company.offers': {
          $elemMatch: {
            status: 'pending',
            expiresAt: { $lt: now }
          }
        }
      }).toArray();

      let expiredCount = 0;

      for (const company of companies) {
        const expiredOffers = company.company.offers.filter(o =>
          o.status === 'pending' && new Date(o.expiresAt) < now
        );

        for (const offer of expiredOffers) {
          await this.updateOfferStatus(offer.id, company._id.toString(), 'expired');
          expiredCount++;
        }
      }

      logger.info(`Expired offers updated: ${expiredCount}`);
      return { expiredCount };
    } catch (error) {
      logger.error('Error checking expired offers', { error: error.message });
      throw error;
    }
  }
}

module.exports = OfferService;
