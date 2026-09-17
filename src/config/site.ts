// ============================================================
// ACP Site Configuration
// All business information is centralized here for easy updates.
// ============================================================

export const SITE = {
  brand: {
    name: 'ACP',
    fullName: 'ACP Cargo Movers & Packers',
    tagline: 'Moving Your World. Safely.',
    description:
      'Professional packing, moving and cargo transportation solutions built around safety, reliability and care.',
  },

  // Primary hero text
  hero: {
    headline: 'ACP',
    subheadline: 'Cargo Movers & Packers',
    primaryMessage: 'Moving Your World. Safely.',
    supportingText:
      'Professional packing, moving and cargo transportation solutions built around safety, reliability and care.',
    ctaPrimary: { label: 'Get a Quote', href: '#contact' },
    ctaSecondary: { label: 'Explore Services', href: '#services' },
  },

  // Navigation
  navigation: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Why ACP', href: '#why-acp' },
    { label: 'Contact', href: '#contact' },
  ],

  // About section
  about: {
    headline: 'Moving More Than Cargo. Moving What Matters.',
    paragraphs: [
      'ACP provides dependable moving, packing and cargo transportation solutions across the region. We understand that every shipment carries value — both material and emotional.',
      'Our team combines professional packing expertise with modern fleet management to deliver your belongings safely, on time, every time.',
    ],
  },

  // Services
  services: [
    {
      title: 'Household Relocation',
      description: 'Complete home moving with professional packing and care.',
      icon: '🏠',
    },
    {
      title: 'Office Relocation',
      description: 'Efficient office moves with minimal downtime.',
      icon: '🏢',
    },
    {
      title: 'Packing & Unpacking',
      description: 'Expert packing materials and techniques for every item.',
      icon: '📦',
    },
    {
      title: 'Loading & Unloading',
      description: 'Trained crews for safe handling of all cargo.',
      icon: '💪',
    },
    {
      title: 'Cargo Transportation',
      description: 'Reliable fleet for long-haul and regional transport.',
      icon: '🚛',
    },
    {
      title: 'Warehouse & Storage',
      description: 'Secure, climate-aware storage facilities.',
      icon: '🏭',
    },
    {
      title: 'Local Moving',
      description: 'Quick and efficient moves within your city.',
      icon: '📍',
    },
    {
      title: 'Long-Distance Moving',
      description: 'Cross-country transport with real-time tracking.',
      icon: '🗺️',
    },
  ],

  // Process steps
  process: [
    { step: '01', title: 'Plan', description: "Understand the customer's requirements and create a moving plan." },
    { step: '02', title: 'Pack', description: 'Professionally pack and protect all belongings.' },
    { step: '03', title: 'Load', description: 'Securely load cargo with proper handling.' },
    { step: '04', title: 'Move', description: 'Transport safely to the destination.' },
    { step: '05', title: 'Deliver', description: 'Unload and deliver with care to your door.' },
  ],

  // Why ACP
  whyAcp: [
    { title: 'Safe Handling', description: 'Every item treated with the care it deserves.' },
    { title: 'Reliable Transportation', description: 'Modern fleet and trained drivers.' },
    { title: 'Professional Packing', description: 'Premium materials and proven techniques.' },
    { title: 'Experienced Team', description: 'Years of expertise in cargo movement.' },
    { title: 'On-Time Service', description: 'We deliver when we say we will.' },
    { title: 'Customer-Focused Support', description: 'Dedicated support from quote to delivery.' },
  ],

  // Coverage
  coverage: {
    headline: 'Wherever You Need To Go.',
    description: 'ACP serves destinations across the region. Add your service locations here.',
    // Placeholder locations — replace with real data
    locations: [] as string[],
  },

  // Contact
  contact: {
    headline: 'Ready To Move?',
    subtext: "Let's get your cargo moving.",
    ctaPrimary: { label: 'Get a Quote', action: 'submit' },
    ctaSecondary: { label: 'Call ACP', href: 'tel:+918870647271' },
    // Real ACP contact info
    phone: '+91 88706 47271',
    email: 'info@acpcargo.com',
    address: 'ACP Cargo Movers & Packers, Mortandi, Thiruchitrambalam, Tamil Nadu 605101',
    mapsUrl: 'https://maps.app.goo.gl/t6Dx4mVqcTvR9wYu7?g_st=aw',
  },

  // Final CTA
  finalCta: {
    headline: 'Ready To Move?',
    text: "Let's get your cargo moving.",
  },
} as const
