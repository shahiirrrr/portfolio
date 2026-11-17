/**
 * Copy and options for the Contact page (Figma: Final / Contact).
 * Contact details themselves (email, phone, location, socials) come from
 * `@/config/site`.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

/** Intro column (Figma: 01 Contact / Info). */
export const CONTACT_INTRO = {
  title: ["Let's", 'talk.'],
  body: "Have a project, a role or just a question? Tell me a little about it and I'll reply within 24 hours.",
  /** Appended to `SITE.location` in the "BASED IN" detail. */
  timezone: 'IST',
} as const;

/** "What do you need?" — multi-select (checkboxes). */
export const CONTACT_NEEDS = [
  'Full-time role',
  'Web app',
  'Headless commerce',
  'Landing page',
  'Design to code',
] as const;

/** "Engagement" — single-select (radios). */
export const CONTACT_ENGAGEMENTS = [
  'Full-time',
  'Freelance',
  'Contract',
  'Just saying hi',
] as const;

/** Form card copy (Figma: Form Card). */
export const CONTACT_FORM = {
  title: 'Start a project',
  nameLabel: 'Your name',
  namePlaceholder: 'Jane Doe',
  emailLabel: 'Email',
  emailPlaceholder: 'jane@company.com',
  needsLabel: 'What do you need?',
  engagementLabel: 'Engagement',
  messageLabel: 'Tell me about it',
  messagePlaceholder: 'A few lines about the project, timeline and links to anything useful…',
  note: ['No spam, no newsletters —', 'just a reply from me.'],
  submit: 'Send message',
} as const;

/**
 * Status copy. NOT in Figma — minimal, neutral wording agreed with the lead
 * (the thank-you line mirrors the page's own "reply within 24 hours").
 */
export const CONTACT_FORM_STATUS = {
  thanksTitle: 'Thanks — your message is on its way.',
  thanksBody: "I'll reply within 24 hours.",
  error: 'Something went wrong. Please try again or email me directly at',
  mailtoOpened:
    'Your email app should have opened with your message ready to send. If it didn’t, email me at',
  nameRequired: 'Please enter your name.',
  emailRequired: 'Please enter your email address.',
  emailInvalid: 'Please enter a valid email address, like name@company.com.',
} as const;

/** FAQ (Figma: 02 FAQ). Copy is verbatim from the design. */
export const CONTACT_FAQ_TITLE = ['Good to', 'know.'] as const;

export const CONTACT_FAQ: FaqItem[] = [
  {
    question: 'Are you open to full-time roles?',
    answer:
      "Yes — I'm open to remote and full-time frontend roles. Right now I'm a Frontend Developer at Noviindus Technologies, Kozhikode.",
  },
  {
    question: 'Do you take freelance projects?',
    answer:
      "Yes — most of my work is building from someone else's Figma file. I'll flag edge cases early and keep the design intact.",
  },
  {
    question: 'Which stack do you prefer?',
    answer:
      'Next.js + TypeScript + Tailwind for apps, Astro for content sites, GSAP for motion. Happy to work in your existing setup.',
  },
  {
    question: 'Where are you based?',
    // NOTE: this answer is verbatim from Figma but does not answer the question — flagged for the owner.
    answer:
      'Open to senior frontend roles at product teams that care about craft. Send the details via the form.',
  },
];
