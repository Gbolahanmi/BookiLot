# 03 — Roadmap

## Timeline

| Phase | Focus | When | Status |
|-------|-------|------|--------|
| 0 | Foundation | Week 1 | ✅ Complete |
| 1 | Core Service | Week 2 | ✅ Complete |
| 2 | Auth + Multi-Tenancy | Weeks 1-2 | ✅ Complete |
| 3 | API Routes | Week 3 | ✅ Complete |
| 4 | Dashboard UI | Weeks 4-5 | ⚠️ 85% |
| 5 | Widget | Week 6 | ⚠️ 90% |
| 6 | Integrations | Week 7 | ✅ Complete |
| 7 | Billing + Polish | Week 8 | 🔴 40% |
| 8 | Testing + Deploy | Weeks 9-10 | 🔴 0% |

---

## Current Phase: Closing MVP Gaps

### What's Blocking MVP

These items must be fixed before the app is usable by pilot businesses:

| Item | Why It Matters | Effort |
|------|---------------|--------|
| Fix `<Toaster />` rendering | Users get no feedback on actions | 2 min |
| Fix cancellation window logic | Inverted check allows cancellations when it shouldn't | 5 min |
| Fix dashboard revenue display | Shows count, not dollars | 10 min |
| Connect settings working hours | Hours set during onboarding can never be changed | 30 min |
| Create `/bookings/manage/[token]` page | Widget confirmation links 404 | 1 hr |
| Add staff edit/delete UI | Can add staff but can't modify or remove | 1 hr |
| Add staff email to API schema | Email field silently dropped | 5 min |

**Total: ~3 hours to close all gaps**

### After MVP Gaps Are Closed

| Item | Priority | Why |
|------|----------|-----|
| Paystack subscription upgrade flow | High | Revenue model depends on it |
| Paystack webhook signature verification | High | Security |
| E2E tests for booking flow | High | Confidence before pilot |
| Deploy to Vercel staging | High | Pilot businesses need a URL |
| Onboard 2-3 pilot businesses | High | Real-world validation |
| Role-based UI (staff sees limited nav) | Medium | Staff shouldn't see billing/settings |
| Mobile responsive fixes | Medium | Polish |
| Dark mode | Low | Nice to have |

---

## Phase 2: Differentiators (Months 3-6)

| Feature | Impact | Effort |
|---------|--------|--------|
| Voice booking channel (ElevenLabs) | High — unique selling point | High |
| Two-way SMS confirmation | High — reduce no-shows further | Medium |
| Deposits & prepayment | High — upfront commitment | Medium |
| Waitlist with auto-notification | Medium — fill cancellations | Medium |
| Business insights dashboard | Medium — data-driven decisions | Medium |
| Marketplace/directory | Medium — discovery channel | High |

---

## Phase 3: Ecosystem (Months 6-12)

| Feature | Impact | Effort |
|---------|--------|--------|
| Loyalty tracking | Medium — retention | Medium |
| Post-appointment reviews | Medium — social proof | Low |
| Google Calendar/Outlook sync | Medium — reduce double-booking | Medium |
| Zapier/Make integration | Low — power users | Low |
| AI-generated suggestions | Low — differentiation | High |
| Multi-location support | Medium — scale | High |

---

## Deployment Strategy

1. **Now:** Local development (`npm run dev`)
2. **Before pilot:** Deploy to Vercel staging
3. **After pilot validation:** Deploy to Vercel production
4. **Custom domain:** bookilot.app (or similar)

---

## Pilot Plan

| Step | When | What |
|------|------|------|
| 1 | After MVP gaps closed | Deploy to Vercel staging |
| 2 | Week 9 | Onboard 2-3 businesses (salons, clinics) |
| 3 | Weeks 9-10 | Collect feedback, fix critical issues |
| 4 | Week 10 | Iterate, prepare for production launch |
