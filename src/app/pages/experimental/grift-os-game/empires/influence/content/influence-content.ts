import { HustleId, LeverageId } from '../../../game-engine/types';
import {
  InfluenceCampaignStratumId,
  InfluenceExtractionStageId,
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
  scaleDisplayMultiplier?: number;
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
  tabs: { hustles: 'Hustles', leverage: 'Leverage', rugPull: 'Rug Pull' },
} as const;

const hustles: Readonly<Record<HustleId, InfluenceHustleContent>> = {
  'online-rage-farm': { name: 'Online Rage Farm', description: 'Convert attention into repeatable demand.', unitSingular: 'Follower', unitPlural: 'Followers', expansionActionLabel: 'Add Followers', manualActionLabel: 'Post a Product Link', automationName: 'Auto-Poster', automationActivityLabel: 'posting links', automationDescription: 'Maintain the product-link schedule across every active audience block.', scaleDisplayMultiplier: 1_000 },
  'paid-friend-club': { name: 'Paid Friend Club', description: 'Put belonging on a recurring plan.', unitSingular: 'Member', unitPlural: 'Members', expansionActionLabel: 'Add Member', manualActionLabel: 'Charge a Fee', automationName: 'Auto-Renewal', automationActivityLabel: 'renewing memberships', automationDescription: 'Renew memberships and collect each scheduled fee.' },
  'autograph-factory': { name: 'Autograph Factory', description: 'Turn personal recognition into collectible inventory.', unitSingular: 'Edition', unitPlural: 'Editions', expansionActionLabel: 'Launch an Edition', manualActionLabel: 'Sign Memorabilia', automationName: 'Autopen', automationActivityLabel: 'signing memorabilia', automationDescription: 'Keep every active edition supplied with approved signatures.' },
  'paid-shoutout-studio': { name: 'Paid Shoutout Studio', description: 'Scale one-to-one attention beyond one person.', unitSingular: 'Booking Slot', unitPlural: 'Booking Slots', expansionActionLabel: 'Add a Booking Slot', manualActionLabel: 'Record a Shoutout', automationName: 'AI Double', automationActivityLabel: 'generating shoutouts', automationDescription: 'Generate personalized appearances for every available slot.' },
  'outrage-podcast': { name: 'Outrage Podcast', description: 'Make repetition sound like authority and authority sellable.', unitSingular: 'Episode', unitPlural: 'Episodes', expansionActionLabel: 'Release an Episode', manualActionLabel: 'Sell a Sponsor Spot', automationName: 'Ad Sales Team', automationActivityLabel: 'booking sponsors', automationDescription: 'Keep the episode catalog fully booked with sponsor inventory.' },
  'get-rich-books': { name: 'Get-Rich Books', description: 'Package the method, publish the mythology, and let the name do the work.', unitSingular: 'Title', unitPlural: 'Titles', expansionActionLabel: 'Add a Title', manualActionLabel: 'Publish the Method', automationName: 'Ghostwriter', automationActivityLabel: 'publishing under your name', automationDescription: 'Expand the back catalog under one consistent authorial name.' },
  'paid-endorsement-racket': { name: 'Paid Endorsement Racket', description: 'Recommend anything to anyone, provided the transfer clears.', unitSingular: 'Brand Deal', unitPlural: 'Brand Deals', expansionActionLabel: 'Sign a Brand Deal', manualActionLabel: 'Endorse a Product', automationName: 'AI Spokesperson', automationActivityLabel: 'endorsing products', automationDescription: 'Deliver each approved recommendation without schedule conflicts.' },
  'vip-experience-tour': { name: 'VIP Experience Tour', description: 'Sell premium access to an experience designed around whoever may or may not appear.', unitSingular: 'Venue', unitPlural: 'Venues', expansionActionLabel: 'Book a Venue', manualActionLabel: 'Sell VIP Tickets', automationName: 'Hologram Headliner', automationActivityLabel: 'headlining without you', automationDescription: 'Keep every booked venue operating around the approved likeness.' },
  'success-university': { name: 'Success University', description: 'Turn aspiration into enrollment and enrollment into proof.', unitSingular: 'Campus', unitPlural: 'Campuses', expansionActionLabel: 'Open a Campus', manualActionLabel: 'Enroll a Student', automationName: 'Admissions Office', automationActivityLabel: 'enrolling students', automationDescription: 'Process enrollment across every regional and digital campus.' },
  'mlm-ambassador-program': { name: 'MLM Ambassador Program', description: 'Teach customers to recruit the next customers.', unitSingular: 'Branch', unitPlural: 'Branches', expansionActionLabel: 'Open a Branch', manualActionLabel: 'Charge a Sign-Up Fee', automationName: 'Recruiting Team', automationActivityLabel: 'recruiting ambassadors', automationDescription: 'Keep each branch supplied with new ambassadors and new targets.' },
  'debt-club': { name: 'Debt Club', description: 'Finance participation, then collect from the obligation.', unitSingular: 'Loan Book', unitPlural: 'Loan Books', expansionActionLabel: 'Acquire a Loan Book', manualActionLabel: 'Collect Fees', automationName: 'Collections Team', automationActivityLabel: 'collecting fees', automationDescription: 'Service every acquired loan book according to schedule.' },
  'subscriber-towns': { name: 'Subscriber Towns', description: 'Move the audience inside the subscription.', unitSingular: 'Town', unitPlural: 'Towns', expansionActionLabel: 'Build a Town', manualActionLabel: 'Charge HOA Dues', automationName: 'HOA Office', automationActivityLabel: 'collecting HOA dues', automationDescription: 'Collect dues and administer the rules across every town.' },
};

const milestones: Readonly<Record<string, InfluenceMilestoneContent>> = Object.fromEntries([
  ...milestoneSet('online-rage-farm', [[10, 'Rate card', 'Product links become a standard placement.'], [25, 'Link rotation', 'Every audience block receives the next approved offer.'], [50, 'Demand desk', 'Commercial attention receives dedicated management.'], [100, 'Audience replication', 'New follower blocks launch from a repeatable format.']]),
  ...milestoneSet('paid-friend-club', [[5, 'Member privileges', 'Belonging acquires additional service levels.'], [15, 'Renewal tooling', 'Scheduled billing becomes reliably impersonal.'], [30, 'Annual plan', 'Commitment is collected before enthusiasm cools.'], [75, 'Status ladder', 'Status becomes the premium service.']]),
  ...milestoneSet('autograph-factory', [[5, 'Numbered editions', 'Every release arrives with an approved scarcity.'], [20, 'Edition calendar', 'The next run begins before the last one clears.'], [40, 'Certified inventory', 'Recognition becomes a managed supply chain.'], [100, 'Licensed likeness', 'New editions arrive already authenticated.']]),
  ...milestoneSet('paid-shoutout-studio', [[5, 'Booking queue', 'Requests enter a single controlled schedule.'], [15, 'Voice model', 'Every greeting follows the approved performance.'], [35, 'Priority delivery', 'Urgency receives a separate price.'], [75, 'Syndicated attention', 'Personal recognition operates across every available slot.']]),
  ...milestoneSet('outrage-podcast', [[5, 'Ad inventory', 'Sponsor placements receive a formal calendar.'], [15, 'Endorsement package', 'One recommendation becomes a complete campaign.'], [30, 'Daily format', 'The feed never waits for a new premise.'], [60, 'Syndication', 'The same authority occupies several channels at once.']]),
  ...milestoneSet('get-rich-books', [[3, 'Signature method', 'A repeatable thesis acquires a durable title.'], [10, 'Editorial office', 'The catalog expands on schedule.'], [25, 'Release calendar', 'Every season receives another definitive method.'], [50, 'Canonical library', 'The name becomes its own publishing category.']]),
  ...milestoneSet('paid-endorsement-racket', [[3, 'Category package', 'Recommendations expand across adjacent products.'], [10, 'Approval script', 'Every endorsement arrives ready for delivery.'], [25, 'Brand portal', 'Deal inventory becomes self-service.'], [50, 'Permanent spokesperson', 'The recommendation engine remains continuously available.']]),
  ...milestoneSet('vip-experience-tour', [[2, 'Premium package', 'Access is divided into increasingly precise tiers.'], [8, 'Venue office', 'Bookings share one operating schedule.'], [20, 'Tour routing', 'The next venue opens before the prior one closes.'], [40, 'Licensed appearance', 'The experience travels without depending on attendance.']]),
  ...milestoneSet('success-university', [[2, 'Enrollment proof', 'Each new class validates the next intake.'], [6, 'Campus services', 'Admissions and payment plans share one desk.'], [15, 'Term calendar', 'Every month contains a new enrollment window.'], [30, 'Accredited aspiration', 'The curriculum becomes an institution.']]),
  ...milestoneSet('mlm-ambassador-program', [[2, 'Branch kit', 'Every branch receives the same pitch and target.'], [5, 'Recruiting office', 'Sign-up activity continues between presentations.'], [12, 'Territory plan', 'Branches open according to a unified schedule.'], [25, 'Distribution network', 'Customers become the permanent acquisition channel.']]),
  ...milestoneSet('debt-club', [[2, 'Servicing desk', 'Every obligation enters a standard collection schedule.'], [6, 'Portfolio acquisition', 'New loan books arrive with established fee terms.'], [15, 'Automatic payments', 'Collections continue without renewed enthusiasm.'], [30, 'Obligation market', 'Participation becomes a durable balance-sheet asset.']]),
  ...milestoneSet('subscriber-towns', [[2, 'Model towns', 'Each development repeats the approved residential format.'], [5, 'HOA portal', 'Residents administer the recurring rules themselves.'], [12, 'Automatic dues', 'Every town becomes a scheduled charge.'], [25, 'Territorial subscription', 'The environment itself becomes the service.']]),
]);

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

const extraction: Readonly<Record<InfluenceExtractionStageId, { name: string; description: string }>> = {
  'retained-rights': { name: 'Retain the Rights', description: 'Slow growth while counsel moves the valuable rights onto your side of the table.' },
  'locked-cap-table': { name: 'Lock the Cap Table', description: 'Trade a full operating window for enough control to capture another five points of the exit.' },
};

export const INFLUENCE_CONTENT_PACK = {
  id: 'influence',
  game,
  hustles,
  milestones,
  leverage,
  campaignStrata,
  extraction,
} as const;

function copy(label: string, description: string): InfluenceMilestoneContent {
  return { label, description, rewardDescription: label };
}

function milestoneSet(
  hustleId: HustleId,
  entries: readonly (readonly [number, string, string])[]
): [string, InfluenceMilestoneContent][] {
  return entries.map(([requiredScaleCount, label, description]) => [
    `${hustleId}-${requiredScaleCount}`,
    copy(label, description),
  ]);
}
