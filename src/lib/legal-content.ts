export type LegalSlug = "privacy-policy" | "terms-and-conditions";

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
};

export function isLegalSlug(value: string): value is LegalSlug {
  return value === "privacy-policy" || value === "terms-and-conditions";
}

export function legalStorageKey(slug: LegalSlug) {
  return `cleanones-legal-${slug}`;
}
