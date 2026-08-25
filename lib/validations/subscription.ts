export type PlanType = 'FREE' | 'STARTER' | 'BUSINESS' | 'PRO'

export const PLAN_LIMITS = {
  FREE: {
    monthly_invoices: 10,
    team_members: 1, // Owner only
    advanced_reports: false,
    price_inr: 0,
  },
  STARTER: {
    monthly_invoices: 100,
    team_members: 2, // Owner + 1
    advanced_reports: true,
    price_inr: 499,
  },
  BUSINESS: {
    monthly_invoices: 1000,
    team_members: 5,
    advanced_reports: true,
    price_inr: 1299,
  },
  PRO: {
    monthly_invoices: -1, // Unlimited
    team_members: -1, // Unlimited
    advanced_reports: true,
    price_inr: 2499,
  },
}
