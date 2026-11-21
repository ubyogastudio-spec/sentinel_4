import type { DeepStrings } from './en';

// Lists run in the same order as SERVICES and PRODUCT_SLUGS in shared/constants.js.
export const pagesEn = {
  services: {
    eyebrow: 'Services',
    title: 'Security that is planned, installed and watched',
    lead: 'Four services that work alone or together. Every one ends with a system we stand behind.',
    quote: 'Get a quote for this',
    items: [
      {
        title: 'AI surveillance',
        summary: 'Cameras that understand what they see and raise only the alerts that matter.',
        text: 'We plan camera positions from a site walk, install cameras that analyse video on the device, and connect them to one live view. People, vehicles and unusual movement are recognised in real time, so your team sees the few events that matter instead of hours of footage.',
        points: [
          'Site walk and camera plan',
          'On-device person and vehicle detection',
          'Live view and alerts on phone and screen',
          'Storage and retention set to your policy',
        ],
      },
      {
        title: 'Smart access control',
        summary: 'Doors that know who may enter, and a record of who did.',
        text: 'We fit readers and controllers that accept cards, PIN codes and phones. Rules are set once, by person, door and time of day, and apply everywhere. Lost cards are blocked in seconds, and every entry is recorded.',
        points: [
          'Card, PIN and phone credentials',
          'Rules by person, door and schedule',
          'Instant removal of lost credentials',
          'Entry log you can search and export',
        ],
      },
      {
        title: 'Zero-trust network',
        summary: 'A network where every device and user has to prove itself.',
        text: 'Cameras and readers are a favourite way into a company network. We separate them from your office network, give every device its own certificate, and allow only the traffic each one needs. Nothing is trusted just because it is inside.',
        points: [
          'Separate network for security devices',
          'A certificate for every device',
          'Only the traffic each device needs',
          'Alerts for unknown devices',
        ],
      },
      {
        title: 'Security audit and training',
        summary: 'A clear picture of your risks, and a team that knows what to do.',
        text: 'We walk your site, test your doors, cameras and network, and write a short report in plain language with a ranked list of fixes. Then we train your staff with short drills, so a plan on paper becomes a habit.',
        points: [
          'On-site assessment',
          'Plain-language report with priorities',
          'Staff drills and checklists',
          'Follow-up check after three months',
        ],
      },
    ],
    process: {
      title: 'How we work',
      lead: 'The same four steps on every site, so nothing is left to chance.',
      steps: [
        { title: 'Assess', text: 'We walk the site, listen to your concerns and list what needs protecting.' },
        { title: 'Design', text: 'You receive a clear plan, a fixed price and a date.' },
        { title: 'Install', text: 'Our engineers fit and test every device, usually within days and with as little disruption as possible.' },
        { title: 'Monitor', text: 'We keep watching: updates, health checks and a phone number that is answered.' },
      ],
    },
  },
  products: {
    eyebrow: 'Products',
    title: 'Three building blocks, tested together',
    lead: 'Cameras, door readers and the network that connects them. Turn each one in 3D.',
    items: [
      {
        tagline: 'AI security camera',
        text: 'A compact camera that analyses video on the device itself. It tells people from shadows and vehicles from animals, sends an alert within seconds, and keeps working if the network drops.',
        specs: [
          { label: 'Sensor', value: '8 MP, 4K video' },
          { label: 'Night vision', value: 'up to 30 m' },
          { label: 'On-device AI', value: 'person, vehicle, intrusion' },
          { label: 'Protection', value: 'IP67, −30 to +55 °C' },
          { label: 'Power', value: 'PoE (802.3af)' },
        ],
      },
      {
        tagline: 'Access reader with keypad',
        text: 'A reader and keypad in one slim plate. Staff open doors with a card, a PIN or a phone, and every entry is written to the audit log. Rules stay on the device, so doors keep working during a network outage.',
        specs: [
          { label: 'Credentials', value: 'card, PIN, phone (NFC)' },
          { label: 'Users', value: 'up to 5,000 per reader' },
          { label: 'Protection', value: 'IP65, backlit keypad' },
          { label: 'Power', value: 'PoE or 12 V DC' },
          { label: 'Works offline', value: 'yes, keeps its rules' },
        ],
      },
      {
        tagline: 'Managed PoE network switch',
        text: 'The network switch that ties the system together. It powers cameras and readers over one cable and keeps them on a separate, locked-down network, so a compromised device cannot reach your office computers.',
        specs: [
          { label: 'Ports', value: '8 × Gigabit PoE+' },
          { label: 'PoE budget', value: '120 W' },
          { label: 'Security', value: 'VLAN, 802.1X, port security' },
          { label: 'Mounting', value: 'desk or rack' },
          { label: 'Logs', value: 'signed, kept for 90 days' },
        ],
      },
    ],
  },
  projects: {
    eyebrow: 'Projects',
    title: 'Systems already at work',
    lead: 'A selection of the sites we have secured. Every project ends with a handover, training and a number to call.',
    items: [
      {
        name: 'Tuul Logistics Park',
        sector: 'Warehouse',
        text: 'A large warehouse yard with trucks arriving day and night. We replaced guard rounds with camera zones and an automatic gate reader.',
        figure: '48',
        result: 'cameras, no blind spots at the gates',
      },
      {
        name: 'Altan Retail Group',
        sector: 'Retail',
        text: 'Six shops, one view. Managers see every till and entrance from one screen, and alerts go to a phone instead of a monitor.',
        figure: '6',
        result: 'shops on one live view',
      },
      {
        name: 'Naran Clinic',
        sector: 'Healthcare',
        text: 'Staff areas and medicine rooms must stay closed, and open for the right person in seconds. We fitted card and PIN readers with a full entry log.',
        figure: '27',
        result: 'doors with card and PIN access',
      },
      {
        name: 'Khan-Uul Business Center',
        sector: 'Office',
        text: 'A seven-floor office building with many tenants. Each tenant manages its own staff, while the building keeps one master record.',
        figure: '40',
        result: 'tenants, each managing their own staff',
      },
      {
        name: 'Orkhon Data Hall',
        sector: 'Data centre',
        text: 'A server hall that must never be entered unseen. A zero-trust network, a two-person door rule and a signed audit log.',
        figure: '2',
        result: 'people needed to open the server hall',
      },
      {
        name: 'Gobi Mining Camp',
        sector: 'Industrial',
        text: 'A remote camp with an unreliable link. Cameras analyse video on the device and send only alerts, so the system works even when the connection is down.',
        figure: '30',
        result: 'days of footage kept on site',
      },
    ],
  },
  about: {
    eyebrow: 'About us',
    title: 'Security, done right the first time',
    lead: 'SENTINEL AI is a team of engineers in Ulaanbaatar who build security systems the way they would want them built for their own homes.',
    storyTitle: 'Our story',
    story: [
      'We started after seeing too many buildings with expensive cameras that nobody watched and doors that anyone could open. The equipment was fine. The way it was put together was not.',
      'So we built a company around doing the whole job: planning, installing, securing the network, training the people, and picking up the phone afterwards. Fast, because we have done it many times. Correct, because we test everything before we leave.',
    ],
    valuesTitle: 'What we stand for',
    values: [
      { title: 'Done right, not just fast', text: 'We install quickly, and we test everything twice before we call it finished.' },
      { title: 'Nothing trusted by default', text: 'Every device, person and request has to prove itself, including ours.' },
      { title: 'Plain language', text: 'You get clear reports and straight answers, not jargon.' },
    ],
    stats: [
      { value: '12', label: 'systems deployed' },
      { value: '340', label: 'cameras online' },
      { value: '2 days', label: 'typical installation time' },
      { value: '24/7', label: 'monitoring and support' },
    ],
    ctaTitle: 'Want to see how we would secure your site?',
    ctaButton: 'Talk to us',
  },
  team: {
    eyebrow: 'Team',
    title: 'The people behind the system',
    lead: 'Four engineers and operators who answer your calls.',
    members: [
      {
        name: 'Bat-Erdene Ganbold',
        role: 'Founder and CEO',
        bio: 'Built his first security network in 2014. Still walks every site before a plan is signed.',
      },
      {
        name: 'Solongo Tserendorj',
        role: 'Head of Security Engineering',
        bio: 'Designs the zero-trust networks. Believes a good design is one you can explain in two minutes.',
      },
      {
        name: 'Temuulen Dorj',
        role: 'AI and Vision Lead',
        bio: 'Trains the models that run on our cameras, and tests them in snow, dust and bad light.',
      },
      {
        name: 'Anu Enkhbat',
        role: 'Client Operations',
        bio: 'Plans installations and answers the phone. If something needs fixing, she is the first to know.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Talk to an engineer',
    lead: 'Tell us what you want to protect. We answer within one working day.',
    formTitle: 'Send us a message',
    detailsTitle: 'Contact details',
    addressLabel: 'Address',
    phoneLabel: 'Phone',
    emailLabel: 'E-mail',
    hoursLabel: 'Opening hours',
    replyNote: 'We reply within one working day.',
  },
  quote: {
    eyebrow: 'Get a quote',
    title: 'Tell us about your site',
    lead: 'A few details are enough. An engineer will call you to agree the next step.',
  },
  legal: {
    updated: 'Last updated: 21 November 2026',
    privacy: {
      title: 'Privacy policy',
      sections: [
        { heading: 'Who we are', text: 'SENTINEL AI, Khan-Uul District, Ulaanbaatar, phone 9007 0740, is responsible for the personal data described here.' },
        { heading: 'What we collect', text: 'Only what you type into the contact and quote forms: name, company, e-mail address, phone number and your message. The site does not use analytics or advertising trackers.' },
        { heading: 'Why, and for how long', text: 'We use it to answer your request and to prepare a quote. We delete contact messages after 24 months, and quote requests after 36 months unless you become a customer.' },
        { heading: 'Your rights', text: 'You may ask to see, correct or delete your data at any time by calling or writing to us. We do not sell your data, and we share it only with service providers who store it for us under contract.' },
      ],
    },
    terms: {
      title: 'Terms of use',
      sections: [
        { heading: 'Using this site', text: 'The site gives general information about our services. Nothing on it is a binding offer until we confirm a quote in writing.' },
        { heading: 'Quotes', text: 'Prices and specifications in a quote are valid for 30 days. Product specifications on this site are indicative and may change.' },
        { heading: 'Our content', text: 'Texts, drawings and 3D models on this site belong to SENTINEL AI or are used under their licences. Please do not copy them without permission.' },
        { heading: 'Liability', text: 'We take care to keep the site correct and available, but we cannot promise that it will always be free of errors or interruptions.' },
      ],
    },
    cookies: {
      title: 'Cookie policy',
      sections: [
        { heading: 'No tracking cookies', text: 'This site does not set cookies and does not use analytics or advertising trackers.' },
        { heading: 'What is stored in your browser', text: 'Only your language choice (EN or MN), saved in your browser’s local storage so the site opens in the language you picked. It never leaves your device.' },
        { heading: 'Third-party content', text: 'Fonts load from Google Fonts and the 3D background from Spline. These providers receive your IP address when your browser requests the files, as they do on any site that uses them.' },
        { heading: 'Your choice', text: 'You can clear local storage in your browser settings at any time. The site then opens in Mongolian again.' },
      ],
    },
  },
};

export type PagesMessages = DeepStrings<typeof pagesEn>;
