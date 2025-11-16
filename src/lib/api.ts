
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  // Account Management
  async getAccounts(userId?: string) {
    const url = userId ? `${API_URL}/accounts?user_id=${userId}` : `${API_URL}/accounts`;
    const res = await fetch(url);
    return res.json();
  },

  async getAccount(id: string) {
    const res = await fetch(`${API_URL}/accounts/${id}`);
    return res.json();
  },

  async startMonitoring(accountId: string) {
    const res = await fetch(`${API_URL}/accounts/${accountId}/start-monitoring`, {
      method: 'POST'
    });
    return res.json();
  },

  async stopMonitoring(accountId: string) {
    const res = await fetch(`${API_URL}/accounts/${accountId}/stop-monitoring`, {
      method: 'POST'
    });
    return res.json();
  },

  async getMetrics(accountId: string, limit = 100) {
    const res = await fetch(`${API_URL}/accounts/${accountId}/metrics?limit=${limit}`);
    return res.json();
  },

  async getViolations(accountId: string) {
    const res = await fetch(`${API_URL}/accounts/${accountId}/violations`);
    return res.json();
  },

  // Leaderboard
  async getLeaderboard(period = 'all', limit = 50) {
    const res = await fetch(`${API_URL}/leaderboard?period=${period}&limit=${limit}`);
    return res.json();
  },

  async getLeaderboardStats() {
    const res = await fetch(`${API_URL}/leaderboard/stats`);
    return res.json();
  },

  // Notifications
  async getNotifications(userId: string) {
    const res = await fetch(`${API_URL}/notifications?user_id=${userId}`);
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT'
    });
    return res.json();
  },

  async markAllNotificationsRead(userId: string) {
    const res = await fetch(`${API_URL}/notifications/mark-all-read/${userId}`, {
      method: 'PUT'
    });
    return res.json();
  },

  async deleteNotification(id: string) {
    const res = await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Certificates
  getCertificateUrl(accountId: string) {
    return `${API_URL}/certificates/${accountId}`;
  },

  async generateCertificate(accountId: string) {
    const res = await fetch(`${API_URL}/certificates/generate/${accountId}`, {
      method: 'POST'
    });
    return res.json();
  },

  // Affiliates
  async createAffiliate(userId: string) {
    const res = await fetch(`${API_URL}/affiliates/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    return res.json();
  },

  async getAffiliateStats(userId: string) {
    const res = await fetch(`${API_URL}/affiliates/stats/${userId}`);
    return res.json();
  },

  async validateAffiliateCode(code: string) {
    const res = await fetch(`${API_URL}/affiliates/validate-code/${code}`);
    return res.json();
  },

  async trackReferral(affiliateCode: string, referredUserId: string) {
    const res = await fetch(`${API_URL}/affiliates/track-referral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ affiliate_code: affiliateCode, referred_user_id: referredUserId })
    });
    return res.json();
  },

  async requestPayout(userId: string, amount: number) {
    const res = await fetch(`${API_URL}/affiliates/request-payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, amount })
    });
    return res.json();
  },

  // Support Tickets
  async createSupportTicket(ticketData: any) {
    const res = await fetch(`${API_URL}/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    return res.json();
  },

  async getSupportTickets() {
    const res = await fetch(`${API_URL}/support/tickets/all`);
    return res.json();
  },

  async getSupportTicket(id: string) {
    const res = await fetch(`${API_URL}/support/tickets/${id}`);
    return res.json();
  },

  async updateSupportTicket(id: string, updates: any) {
    const res = await fetch(`${API_URL}/support/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Users
  async getAllUserProfiles() {
    const res = await fetch(`${API_URL}/users/profiles`);
    return res.json();
  },

  // Challenges
  async getAllChallenges() {
    const res = await fetch(`${API_URL}/challenges/all`);
    return res.json();
  },

  async rejectChallenge(challengeId: string, userNote: string, adminNote: string) {
    const res = await fetch(`${API_URL}/challenges/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, userNote, adminNote }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || 'Failed to reject challenge');
      } catch (e) {
        throw new Error(`Failed to reject challenge: ${errorText}`);
      }
    }
    return res.json();
  },

  async sendUserNote(challengeId: string, userNote: string) {
    const res = await fetch(`${API_URL}/challenges/send-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, userNote }),
    });
    return res.json();
  },

  async saveInternalNote(challengeId: string, adminNote: string) {
    const res = await fetch(`${API_URL}/challenges/internal-note/${challengeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNote }),
    });
    return res.json();
  },

  async breachAccount(accountId: string, reason: string, db_source: string) {
    const res = await fetch(`${API_URL}/accounts/${accountId}/breach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, db_source }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || 'Failed to breach account');
      } catch (e) {
        throw new Error(`Failed to breach account: ${errorText}`);
      }
    }
    return res.json();
  },
};
