export type LegalSlug = "privacy-policy" | "terms-and-conditions" | "about-us";

import type { UiDict } from "./translations";

/** Localised heading for each legal document; the body text itself lives in the API. */
export const legalLabelKeys: Record<LegalSlug, { title: keyof UiDict; subtitle: keyof UiDict }> = {
  "privacy-policy": { title: "privacyPolicy", subtitle: "privacyPolicySubtitle" },
  "terms-and-conditions": { title: "termsConditions", subtitle: "termsConditionsSubtitle" },
  "about-us": { title: "aboutUs", subtitle: "aboutUsSubtitle" },
};

export const legalDocuments: Record<LegalSlug, { title: string; subtitle: string; updated: string; content: string }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    subtitle: "How CleanOnes collects, uses and protects personal data.",
    updated: "28 July 2026",
    content: `1. Introduction

CleanOnes respects the privacy of clients, employees and partners. This policy explains what information we collect and how it is handled.

2. Information we collect

We may collect account details, contact information, work schedules, attendance records, service locations and information submitted through the platform.

3. How information is used

Information is used to deliver cleaning services, coordinate employees, manage schedules, improve platform security and communicate operational updates.

4. Data protection

Access is limited to authorised users. Appropriate organisational and technical safeguards are used to protect information against loss, misuse and unauthorised access.

5. Retention and rights

Information is retained only for as long as required for operational, contractual or legal purposes. Users may request access, correction or deletion where applicable.

6. Contact

Privacy questions can be sent to privacy@cleanones.nl.`,
  },
  "terms-and-conditions": {
    title: "Terms & Conditions",
    subtitle: "Rules and guidelines for using the CleanOnes platform.",
    updated: "28 July 2026",
    content: `1. Platform use

The CleanOnes platform supports workforce scheduling, service monitoring and communication between authorised users.

2. Account responsibility

Users are responsible for keeping account credentials secure and for activity completed through their accounts.

3. Service information

Schedules, working hours, cleaning plans and location information must be kept accurate. Operational changes should be communicated promptly.

4. Acceptable use

The platform may not be used for unlawful activity, unauthorised access, harassment or distribution of harmful content.

5. Availability

CleanOnes aims to keep the platform available and reliable, but maintenance or circumstances outside reasonable control may cause temporary interruptions.

6. Changes

These terms may be updated when services, legal requirements or platform functionality change. The latest published version applies.`,
  },
  "about-us": {
    title: "About Us",
    subtitle: "Who CleanOnes is and what the company does.",
    updated: "28 July 2026",
    content: `1. Who we are

CleanOnes provides professional cleaning services and the workforce platform that coordinates them.

2. What we do

We plan and monitor cleaning work across client locations, schedule employees and freelancers, and keep quality control evidence for every visit.

3. How we work

Each location has its own cleaning plan, rooms and tasks. Work is assigned to trained staff, tracked in real time, and reviewed through photo evidence and issue reports.

4. Contact

General enquiries can be sent to info@cleanones.nl.`,
  },
};

export function isLegalSlug(value: string): value is LegalSlug {
  return value === "privacy-policy" || value === "terms-and-conditions" || value === "about-us";
}

export function legalStorageKey(slug: LegalSlug) {
  return `cleanones-legal-${slug}`;
}
