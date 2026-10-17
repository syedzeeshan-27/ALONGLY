// Public contact details. Set NEXT_PUBLIC_CONTACT_EMAIL to show your own
// address; otherwise contact links point at the project's GitHub issues.
export const REPO_URL = "https://github.com/syedzeeshan-27/ALONGLY";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;

export const CONTACT_HREF = contactEmail
  ? `mailto:${contactEmail}`
  : `${REPO_URL}/issues`;

export const CONTACT_LABEL = contactEmail ?? "GitHub issues";
