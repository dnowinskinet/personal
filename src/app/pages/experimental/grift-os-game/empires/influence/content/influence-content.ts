import { HustleId, LeverageId } from '../../../game-engine/types';
import {
  InfluenceCampaignStratumId,
  InfluenceFounderTakeStageId,
} from '../mechanics/influence-mechanics';

export interface InfluenceHustleContent {
  name: string;
  description: string;
  unitSingular: string;
  unitPlural: string;
  expansionActionLabel: string;
  manualActionLabel: string;
  automationName: string;
  automationActivityLabel: string;
  automationDescription: string;
}

export interface InfluenceMilestoneContent {
  label: string;
  description: string;
  rewardDescription: string;
}

export interface InfluenceLeverageContent {
  name: string;
  description: string;
  modifierLabels: Readonly<Record<string, string>>;
}

const game = {
  title: 'GriftOS',
  tagline: 'Farm aura. Build the unicorn.',
  eyebrow: 'Valuation engine',
  status: 'Modernization playtest',
  valuationLabel: 'Valuation',
  rateLabel: 'Average Rate',
  netWorthLabel: 'Net Worth',
  wealthAdvantageLabel: 'Wealth Advantage',
  founderLabel: 'The Founder',
  founderStatus: 'Pre-revenue, post-accountability.',
  tabs: { hustles: 'Hustles', leverage: 'Leverage', rugPull: 'Rug Pull' },
} as const;

const hustles: Readonly<Record<HustleId, InfluenceHustleContent>> = {
  'troll-network': { name: 'Social Media Account', description: 'Build an audience, then monetize its attention one recommendation at a time.', unitSingular: 'Follower', unitPlural: 'Followers', expansionActionLabel: 'Add Follower', manualActionLabel: 'Post an Affiliate Link', automationName: 'Auto-Poster', automationActivityLabel: 'posting links', automationDescription: 'Keep affiliate links posting without needing the Founder online.' },
  'podcast-network': { name: 'Paid Fan Club', description: 'Charge lonely followers for belonging, status, and the feeling of access.', unitSingular: 'Member', unitPlural: 'Members', expansionActionLabel: 'Add Member', manualActionLabel: 'Charge a Fee', automationName: 'Auto-Renewal', automationActivityLabel: 'renewing memberships', automationDescription: 'Renew memberships and collect fees without making the Founder available.' },
  'culture-war-media': { name: 'Merch Store', description: 'Sell physical proof that fans belong to the Founder’s world.', unitSingular: 'Product', unitPlural: 'Products', expansionActionLabel: 'Add Product', manualActionLabel: 'Sell Merch', automationName: 'Fulfillment Partner', automationActivityLabel: 'processing orders', automationDescription: 'Pack and ship products without the Founder touching an order.' },
  'masterclass-business': { name: 'Podcast', description: 'Turn parasocial trust into sponsorship inventory, one episode at a time.', unitSingular: 'Episode', unitPlural: 'Episodes', expansionActionLabel: 'Add Episode', manualActionLabel: 'Sell a Sponsor Spot', automationName: 'Ad Sales Team', automationActivityLabel: 'booking sponsors', automationDescription: 'Sell sponsor spots and keep the show booked.' },
  'manifesto-imprint': { name: 'VIP Events', description: 'Charge followers to feel briefly closer to the Founder in person.', unitSingular: 'City', unitPlural: 'Cities', expansionActionLabel: 'Add City', manualActionLabel: 'Sell VIP Access', automationName: 'Ticketing Site', automationActivityLabel: 'selling access', automationDescription: 'Sell tickets, upgrades, and cities without a personal reply.' },
  'founder-retreat-circuit': { name: 'Success University', description: 'Sell students the promise they can recreate the Founder’s success.', unitSingular: 'Campus', unitPlural: 'Campuses', expansionActionLabel: 'Open Campus', manualActionLabel: 'Enroll a Student', automationName: 'Admissions Office', automationActivityLabel: 'enrolling students', automationDescription: 'Process enrollments and keep the promise moving at scale.' },
  'ai-venture': { name: 'Brand Ambassador Program', description: 'Charge supporters to join the brand, promote its products, and recruit the next wave.', unitSingular: 'Branch', unitPlural: 'Branches', expansionActionLabel: 'Open Branch', manualActionLabel: 'Charge a Sign-Up Fee', automationName: 'Recruiting Team', automationActivityLabel: 'signing up ambassadors', automationDescription: 'Sign up new ambassadors and keep the pitch moving.' },
  'venture-portfolio': { name: 'Coaching Company', description: 'Sell the Founder’s method through coaches operating throughout each region.', unitSingular: 'Region', unitPlural: 'Regions', expansionActionLabel: 'Enter Region', manualActionLabel: 'Sell a Coaching Session', automationName: 'Booking Team', automationActivityLabel: 'booking sessions', automationDescription: 'Book sessions and route clients to the next available coach.' },
  'media-holdings': { name: 'Member Bank', description: 'Acquire the institutions holding members’ debt, then profit from every fee.', unitSingular: 'Bank', unitPlural: 'Banks', expansionActionLabel: 'Acquire Bank', manualActionLabel: 'Charge Fees', automationName: 'Collections Team', automationActivityLabel: 'charging fees', automationDescription: 'Collect fees and chase balances after the excitement is gone.' },
  'sovereign-network': { name: 'Private Community', description: 'Sell homes inside branded towns, then charge for the rules.', unitSingular: 'Town', unitPlural: 'Towns', expansionActionLabel: 'Build Town', manualActionLabel: 'Charge HOA Fees', automationName: 'HOA Office', automationActivityLabel: 'collecting HOA fees', automationDescription: 'Collect HOA fees and enforce conformity without a personal visit.' },
};

const milestones: Readonly<Record<string, InfluenceMilestoneContent>> = {
  'troll-network-10': copy('Rate card: 3x local output', 'Tiny recommendations become a repeatable commercial format.'),
  'troll-network-25': copy('Link rotation: 2x local cycle speed', 'Every follower learns which link belongs under which post.'),
  'troll-network-50': copy('Brand manager: 10x cumulative local output', 'The Founder is now represented in negotiations worth several dollars.'),
  'troll-network-100': copy('Follower network: expansion costs divided by 2', 'New audiences launch from a reusable creator playbook.'),
  'podcast-network-5': copy('Member perks: 2.5x local output', 'Members discover that access can have more than one price.'),
  'podcast-network-15': copy('Renewal tooling: automation cost divided by 2', 'Billing becomes less intimate and substantially more reliable.'),
  'podcast-network-30': copy('Annual dues: 2x local cycle speed', 'Commitment is collected before enthusiasm can cool.'),
  'podcast-network-75': copy('Status ladder: 11x cumulative local output', 'Status becomes the premium content.'),
  'culture-war-media-5': copy('Limited edition: 3x local output', 'Scarcity makes ordinary products historically important.'),
  'culture-war-media-20': copy('Product calendar: 1.75x local cycle speed', 'The next release begins before the last boxes leave.'),
  'culture-war-media-40': copy('Signed inventory: 11x cumulative local output', 'A signature discovers a wholesale margin.'),
  'culture-war-media-100': copy('White-label supply: expansion costs divided by 2.5', 'New products now arrive mostly designed and completely urgent.'),
  'masterclass-business-5': copy('Ad inventory system: automation cost divided by 2', 'Sponsor spots acquire names, dates, and a sales pipeline.'),
  'masterclass-business-15': copy('Endorsement package: 4x local output', 'A personal recommendation becomes a multi-platform deliverable.'),
  'masterclass-business-35': copy('Daily format: 2x local cycle speed', 'The podcast becomes frequent enough to forget why it started.'),
  'masterclass-business-75': copy('Syndication: 16x cumulative local output', 'The same voice can now occupy several feeds at once.'),
  'manifesto-imprint-5': copy('VIP package: 4x local output', 'A ticket becomes a photo, a signature, and a controlled moment of eye contact.'),
  'manifesto-imprint-15': copy('City routing: 2x local cycle speed', 'The travel day is finally monetized.'),
  'manifesto-imprint-30': copy('Venue partnership: expansion costs divided by 2', 'Cities begin competing to host the Founder economy.'),
  'manifesto-imprint-60': copy('Corporate keynote: 19x cumulative local output', 'VIP events discover procurement budgets.'),
  'founder-retreat-circuit-3': copy('Enrollment fee: 5x local output', 'Students discover that success has levels.'),
  'founder-retreat-circuit-10': copy('Campus staff: automation cost divided by 2', 'Junior staff begin processing the next class.'),
  'founder-retreat-circuit-25': copy('Course calendar: 2.5x local cycle speed', 'Every month now contains a reason to enroll again.'),
  'founder-retreat-circuit-50': copy('Founder curriculum: 15x cumulative local output', 'The Founder’s success becomes a permanent course catalog.'),
  'ai-venture-3': copy('Sign-up kit: 6x local output', 'One ambassador sign-up validates the next.'),
  'ai-venture-10': copy('Promotion script: 2x local cycle speed', 'The pitch is ready before the next ambassador asks a question.'),
  'ai-venture-25': copy('Ambassador portal: expansion costs divided by 2.5', 'Every ambassador receives the same payment link and a new target.'),
  'ai-venture-50': copy('Recruiting network: 21x cumulative local output', 'Ordinary supporters become a permanent promotion force.'),
  'venture-portfolio-2': copy('Regional launch: 8x local output', 'The Founder’s method now has coaches in more than one market.'),
  'venture-portfolio-8': copy('Scheduling office: automation cost divided by 2.5', 'Bookings and coaches share one operating team.'),
  'venture-portfolio-20': copy('Regional rollout: 2.5x local cycle speed', 'The next region opens before the prior one finishes onboarding.'),
  'venture-portfolio-40': copy('Licensed method: 18x cumulative local output', 'The Founder’s promise now travels through a credentialed workforce.'),
  'media-holdings-2': copy('Member Credit Card: 10x local output', 'A bank turns community rewards into a permanent payment rail.'),
  'media-holdings-6': copy('Fee network: expansion costs divided by 2.5', 'New banks arrive with members, annual fees, and payment plans.'),
  'media-holdings-15': copy('Automatic payments: 3x local cycle speed', 'Minimum payments keep the money moving every day.'),
  'media-holdings-30': copy('Debt ownership: 20x cumulative local output', 'The Founder stops selling access and starts owning the balances.'),
  'sovereign-network-2': copy('Model towns: 5x local output', 'More buyers discover the same branded version of home.'),
  'sovereign-network-5': copy('HOA portal: automation cost divided by 3', 'Residents begin constructing their own reasons to follow the rules.'),
  'sovereign-network-12': copy('Automatic dues: 2x local cycle speed', 'Every town becomes a recurring charge before anyone notices it happened.'),
  'sovereign-network-25': copy('Community control: 15x cumulative local output', 'The Founder no longer sells access to an audience. The Founder sells the rules.'),
};

const leverage: Readonly<Record<LeverageId, InfluenceLeverageContent>> = {
  'attention-loop': { name: 'Cross-Promotion Compact', description: 'Make every creator surface distribute every product without paying the market rate for reach.', modifierLabels: { 'attention-loop-output': 'Creator portfolio output x2' } },
  'closed-circuit-doctrine': { name: 'Direct Audience Ledger', description: 'Connect subscriptions, purchases, appearances, and membership rank to one owned customer record.', modifierLabels: { 'closed-circuit-doctrine-output': 'Direct-audience portfolio output x2', 'closed-circuit-doctrine-cost': 'All expansion costs divided by 1.5' } },
  'capital-access': { name: 'Crisis Conversion Desk', description: 'Route membership loyalty, recurring emergencies, and token demand through the same conversion machine.', modifierLabels: { 'capital-access-output': 'Belief-conversion portfolio output x2', 'capital-access-automation': 'All automation costs divided by 2' } },
  'institutional-capture': { name: 'Network Ad Exchange', description: 'Package shows, personalities, and platform inventory inside one market for sponsor demand.', modifierLabels: { 'institutional-capture-output': 'Network inventory output x2', 'institutional-capture-speed': 'Network Hustles cycle 1.5x faster' } },
  'sovereign-stack': { name: 'Controlling Interest', description: 'Own enough of the network and platform that distribution policy becomes a balance-sheet decision.', modifierLabels: { 'sovereign-stack-output': 'Owned attention-market output x3', 'sovereign-stack-cost': 'All expansion costs divided by 1.5' } },
};

const campaignStrata: Readonly<Record<InfluenceCampaignStratumId, string>> = {
  attention: 'Creator economy', doctrine: 'Direct audience economy', capital: 'Influence economy',
  institutional: 'Network economy', sovereignty: 'Platform economy', postgame: 'Post-victory economy',
};

const founderTake: Readonly<Record<InfluenceFounderTakeStageId, { name: string; description: string }>> = {
  'retained-rights': { name: 'Retain the Rights', description: 'Slow growth while counsel moves the valuable rights back onto the Founder side of the table.' },
  'locked-cap-table': { name: 'Lock the Cap Table', description: 'Trade a full operating window for enough control to capture another five points of the exit.' },
};

export const INFLUENCE_CONTENT_PACK = {
  id: 'influence',
  game,
  hustles,
  milestones,
  leverage,
  campaignStrata,
  founderTake,
} as const;

function copy(label: string, description: string): InfluenceMilestoneContent {
  return { label, description, rewardDescription: label };
}
