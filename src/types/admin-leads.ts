export type LeadAdminListItem = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  sourcePage: string;
  landingPageSlug?: string;
  leadMagnetId?: string;
  campaignType?: string;
  ghlStatus: string;
  ghlContactId?: string;
  tagsApplied: string[];
  createdAt: string;
  updatedAt: string;
  ghlError?: string;
};

export type LeadAdminDetail = LeadAdminListItem & {
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
};

export type LeadAdminFilterInput = {
  ghlStatus?: string;
  landingPageSlug?: string;
  leadMagnetId?: string;
  campaignType?: string;
};

export type LeadAdminSummary = {
  totalLeads: number;
  leadsToday: number;
  taggedLeads: number;
  failedGhlSyncs: number;
  pendingGhlSyncs: number;
  topLandingPageSlug?: string;
  topLeadMagnetId?: string;
};
