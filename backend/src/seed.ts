import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { createHash } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { extractReadableText } from './common/html-text.js';
import { Person, PersonSchema } from './people/schemas/person.schema.js';
import { Site, SiteSchema } from './sites/schemas/site.schema.js';
import { Visit, VisitSchema } from './visits/schemas/visit.schema.js';

const LOCAL_MONGODB_HOST =
  /^mongodb:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i;
const SEED_NAMESPACE = 'small-web-assessment-v1';
const HISTORY_START = new Date('2026-11-11T05:30:00.000Z');

interface SeedPerson {
  key: string;
  name: string;
}

interface SeedSite {
  address: string;
  title: string;
  authorKey: string;
  introduction: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
  links: Array<{ address: string; label: string }>;
}

interface SeedVisit {
  personKey: string;
  minutesAfterStart: number;
  address: string;
  navigationType: 'typed' | 'link' | 'search' | 'history';
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI')?.trim();
        if (!uri) {
          throw new Error('MONGODB_URI must be defined in the environment');
        }

        return {
          uri,
          ...(LOCAL_MONGODB_HOST.test(uri) ? { dbName: 'small_web' } : {}),
        };
      },
    }),
    MongooseModule.forFeature([
      { name: Person.name, schema: PersonSchema },
      { name: Site.name, schema: SiteSchema },
      { name: Visit.name, schema: VisitSchema },
    ]),
  ],
})
class SeedModule {}

const people: SeedPerson[] = [
  { key: 'avery-moss', name: 'Avery Moss' },
  { key: 'jun-park', name: 'Jun Park' },
  { key: 'nia-okafor', name: 'Nia Okafor' },
  { key: 'theo-bell', name: 'Theo Bell' },
];

const sites: SeedSite[] = [
  {
    address: 'tidepool.zz',
    title: 'The Tidepool Field Guide',
    authorKey: 'avery-moss',
    introduction:
      'A field guide to the small, changing worlds left behind by the tide. Tidepools reward patient observation: an ordinary rock can shelter a whole community of algae, snails, anemones, and young fish.',
    sections: [
      {
        heading: 'Reading the shore',
        paragraphs: [
          'Begin above the waterline and move slowly toward the sea. The upper shore dries quickly and favors hardy lichens and periwinkles, while the lower pools stay cool and support delicate sea lettuce, limpets, and tiny shrimp. A notebook, a pencil, and a few minutes of stillness reveal more than collecting ever could.',
          'Record the weather, the height of the tide, and the shape of the pool. Repeating the same observation on different days makes the environment legible: a sheltered pool warms in sunlight, but a wave-washed channel changes temperature and salinity every few minutes.',
        ],
      },
      {
        heading: 'Small lives, careful hands',
        paragraphs: [
          'Look for motion before touching anything. A closed anemone may be conserving water, and a shell that seems empty may be occupied by a young crab. Return loose stones exactly as you found them, because their shaded undersides are habitat rather than scenery.',
          'Coastal conservation begins with attention. Plastic fragments travel through food webs, and trampling can crush animals hidden beneath algae. The principles of environmental stewardship are simple: take photographs, leave living things in place, and share the shore with care.',
        ],
      },
      {
        heading: 'A wider coast',
        paragraphs: [
          'The shore is connected to inland farms, gardens, and rivers. Soil that washes from a field carries nutrients to the estuary, where excess fertilizer can change the balance of a pool. This is one reason fieldnotes from land and sea belong in the same conversation.',
          'For a companion view of working landscapes, visit the practical journal at <a href="https://fieldnotes.zz">Fieldnotes</a>, then follow the garden project at <a href="https://citygarden.zz">City Garden</a>.',
        ],
      },
    ],
    links: [
      { address: 'fieldnotes.zz', label: 'Fieldnotes' },
      { address: 'citygarden.zz', label: 'City Garden' },
      { address: 'vanishedreef.zz', label: 'The vanished reef archive' },
    ],
  },
  {
    address: 'fieldnotes.zz',
    title: 'Fieldnotes from a Living Farm',
    authorKey: 'avery-moss',
    introduction:
      'Fieldnotes follows a small mixed farm through the seasons, connecting agriculture with ecology, food, and community. The entries are written for readers who want to understand how decisions in a field become part of a landscape.',
    sections: [
      {
        heading: 'Soil is a living record',
        paragraphs: [
          'A healthy soil is more than a place to hold roots. Fungi, earthworms, bacteria, and decaying leaves form a living structure that stores water and makes nutrients available to crops. We compare beds by smell, texture, and how quickly rain disappears from the surface.',
          'Cover crops protect bare ground between harvests. A mixed planting of clover, oats, and vetch feeds pollinators, shades weeds, and returns organic matter to the soil. These modest practices make agriculture more resilient during dry summers and sudden storms.',
        ],
      },
      {
        heading: 'A practical crop rotation',
        paragraphs: [
          'This year the north field moved from brassicas to beans, with a strip of flowers left for beneficial insects. Rotating crops interrupts some pest cycles and avoids asking one patch of land for the same nutrients every season.',
          'Our notebook includes germination dates, rainfall, and the number of crates harvested. Those measurements do not replace observation; they help us remember what a busy season can blur. Good technology can make farm records easier to compare without taking farmers out of the field.',
        ],
      },
      {
        heading: 'From field to neighborhood',
        paragraphs: [
          'A harvest is also a relationship. We deliver greens to the neighborhood market and trade seedlings with the volunteers at <a href="https://citygarden.zz">City Garden</a>. Their small urban plots show how environmental care can make useful space in a dense city.',
          'The coast keeps its own records too. Nutrients and sediment move downstream, so our farm plans include stream buffers and careful compost management. For a closer look at that connection, read the <a href="https://tidepool.zz">Tidepool Field Guide</a>.',
        ],
      },
    ],
    links: [
      { address: 'citygarden.zz', label: 'City Garden' },
      { address: 'tidepool.zz', label: 'The Tidepool Field Guide' },
      { address: 'northfield-ledger.zz', label: 'North Field ledger' },
    ],
  },
  {
    address: 'tinyatlas.zz',
    title: 'Tiny Atlas of Everyday Places',
    authorKey: 'jun-park',
    introduction:
      'Tiny Atlas is a collection of hand-drawn maps for places that rarely appear on a tourist itinerary: a useful bench, a windbreak, a footpath, and the tiny signs that tell you how a neighborhood works.',
    sections: [
      {
        heading: 'Mapping by walking',
        paragraphs: [
          'A map can begin with a question rather than a boundary. Where does a stroller find a smooth crossing? Which lane stays shaded after lunch? We walk a route twice, note what changed, and draw only the landmarks that help another person notice the same things.',
          'The atlas favors readable symbols and generous margins. A small blue line marks a public fountain, while a dotted edge means that a path is seasonal or uncertain. These conventions make a map useful without pretending that a neighborhood is fixed.',
        ],
      },
      {
        heading: 'The city as shared infrastructure',
        paragraphs: [
          'Street trees cool the sidewalk, gardens provide habitat, and libraries offer a quiet indoor room to anyone who needs one. None of these places is a decoration; each is part of the everyday infrastructure that supports a city.',
          'Our map of the East Market ends at a community garden gate. The people who maintain it keep practical notes at <a href="https://citygarden.zz">City Garden</a>, and the nearest reading room is described in the <a href="https://openlibrary.zz">Open Library notebook</a>.',
        ],
      },
      {
        heading: 'Digital maps, human scale',
        paragraphs: [
          'Technology helps us compare routes, but a screen cannot tell whether a crossing feels safe or whether a public path is blocked by a temporary repair. We pair digital drafts with conversations and field checks before sharing an edition.',
          'Every atlas page has a revision date and a short list of uncertainties. Readers can send corrections, especially when a new ramp, tree, or bus stop changes how a place can be reached.',
        ],
      },
    ],
    links: [
      { address: 'citygarden.zz', label: 'City Garden' },
      { address: 'openlibrary.zz', label: 'Open Library' },
      { address: 'maproom-missing.zz', label: 'The old map room' },
    ],
  },
  {
    address: 'greenroots.zz',
    title: 'Green Roots: Notes for a Cooler Block',
    authorKey: 'nia-okafor',
    introduction:
      'Green Roots is a neighborhood guide to environmental repair: planting shade, saving rainwater, sharing tools, and making room for the people and species who already live on the block.',
    sections: [
      {
        heading: 'Shade is a public good',
        paragraphs: [
          'On a hot afternoon, a mature tree changes the experience of an entire street. Our block map marks the places where shade disappears and the corners where a new tree could connect existing canopy. We ask residents before choosing species or digging near utilities.',
          'A tree needs a broad, healthy root zone and regular water while it establishes. Volunteers use a simple log to coordinate watering so the same sapling is not flooded one day and forgotten the next. Small routines make community environmental work durable.',
        ],
      },
      {
        heading: 'Rain belongs in the garden',
        paragraphs: [
          'Rain gardens slow runoff and filter water before it reaches a storm drain. Native sedges and flowering plants create habitat while their roots help water move into the ground. The best design is matched to the soil and the way water actually crosses a site.',
          'We share compost, seed, and maintenance notes with the farmers at <a href="https://fieldnotes.zz">Fieldnotes</a>. Their agriculture journal explains why healthy soil and planted margins matter beyond the farm gate.',
        ],
      },
      {
        heading: 'Repair through shared knowledge',
        paragraphs: [
          'Environmental projects work best when information is open and useful. A map should tell people who maintains a planter, where to borrow a shovel, and how to ask for an accessible route through the work area.',
          'For a different scale of stewardship, read about coastal habitats at <a href="https://tidepool.zz">Tidepool</a> or explore how neighbors document public space in the <a href="https://tinyatlas.zz">Tiny Atlas</a>.',
        ],
      },
    ],
    links: [
      { address: 'fieldnotes.zz', label: 'Fieldnotes' },
      { address: 'tidepool.zz', label: 'Tidepool' },
      { address: 'green-roof-register.zz', label: 'Green roof register' },
    ],
  },
  {
    address: 'bytejournal.zz',
    title: 'Byte Journal: Technology with a Human Scale',
    authorKey: 'theo-bell',
    introduction:
      'Byte Journal explains the small technical choices that shape daily life. It is a notebook about technology, repair, privacy, and the pleasure of understanding how a tool works.',
    sections: [
      {
        heading: 'Make the system visible',
        paragraphs: [
          'A useful interface shows what it knows and what it is doing. In our workshop we test this idea with a low-cost air sensor: the display includes the last reading, its time, and a note about uncertainty rather than presenting a mysterious score.',
          'The sensor stores a short local history before sending a summary to a shared dashboard. This approach makes failures easier to notice and avoids collecting details that the project does not need. Technology should be accountable to the people who depend on it.',
        ],
      },
      {
        heading: 'Repair is a form of literacy',
        paragraphs: [
          'A loose connector, a stale battery, or an unclear manual can make a working device seem disposable. Our repair notes document the symptom, the test, and the part that solved it, so the next volunteer starts with evidence instead of guesswork.',
          'Open documentation is not only for engineers. Clear diagrams let a librarian, gardener, or student decide whether a tool is safe to repair and when it is time to ask for help.',
        ],
      },
      {
        heading: 'Knowledge belongs in public',
        paragraphs: [
          'The best technical guide gives readers enough context to make their own decision. We keep a small shelf of books on computing history and systems design at <a href="https://openlibrary.zz">Open Library</a>.',
          'For a non-digital record of slow observation, browse the night-sky log at <a href="https://stargazer.zz">Stargazer</a>. Both practices begin with the same habit: notice carefully, write down what happened, and leave a trail someone else can follow.',
        ],
      },
    ],
    links: [
      { address: 'openlibrary.zz', label: 'Open Library' },
      { address: 'stargazer.zz', label: 'Stargazer' },
      { address: 'obsolete-terminal.zz', label: 'The retired terminal' },
    ],
  },
  {
    address: 'stargazer.zz',
    title: 'Stargazer: A Backyard Sky Almanac',
    authorKey: 'theo-bell',
    introduction:
      'Stargazer is a practical almanac for looking up from the sidewalk. It pairs simple astronomy with notes about darkness, weather, and the shared experience of watching the night sky.',
    sections: [
      {
        heading: 'Start with the dark',
        paragraphs: [
          'Give your eyes time to adjust and choose a place away from direct lights. A rooftop is not required: a balcony, schoolyard, or quiet park can offer a broad view if the horizon is clear and the group has permission to be there.',
          'Light pollution hides faint stars and changes the habitat of nocturnal insects and birds. Small choices, such as shielding a porch light and using a warm bulb, improve visibility while supporting the surrounding environment.',
        ],
      },
      {
        heading: 'Keep an observation log',
        paragraphs: [
          'Write down the date, time, cloud cover, and what you can identify without rushing. A simple paper chart is often more helpful than an app because it encourages a reader to learn the shape of a constellation before asking a screen for its name.',
          'When we do use technology, we check its assumptions: location permissions, daylight-saving settings, and whether a bright display has erased our night vision. These are small examples of how a tool can guide attention without replacing it.',
        ],
      },
      {
        heading: 'Stories and instruments',
        paragraphs: [
          'Astronomy has always been carried through stories as well as measurements. The public shelves at <a href="https://openlibrary.zz">Open Library</a> include accessible guides to the history of observation and the people who made it.',
          'For more notes on making careful tools, see <a href="https://bytejournal.zz">Byte Journal</a>. For a daytime walk through a changing landscape, follow the <a href="https://tinyatlas.zz">Tiny Atlas</a>.',
        ],
      },
    ],
    links: [
      { address: 'openlibrary.zz', label: 'Open Library' },
      { address: 'bytejournal.zz', label: 'Byte Journal' },
      { address: 'meteor-shower-log.zz', label: 'Meteor shower log' },
    ],
  },
  {
    address: 'papertrail.zz',
    title: 'Paper Trail: The Working Notebook',
    authorKey: 'theo-bell',
    introduction:
      'Paper Trail is a collection of useful notebooks: how to keep a project record, how to make a reading list that grows with a group, and how to preserve the decisions behind a piece of work.',
    sections: [
      {
        heading: 'Write for the next person',
        paragraphs: [
          'A good notebook answers three questions: what happened, why did it matter, and what should the next person try? Dates and plain language are more valuable than a perfect layout. A diagram is welcome when it clarifies a process that would otherwise be hard to repeat.',
          'We keep a project log for a community tool library, recording repairs, lending patterns, and the questions people ask at the counter. This small archive helps volunteers make decisions without relying on whoever happens to remember last month.',
        ],
      },
      {
        heading: 'A library is a conversation',
        paragraphs: [
          'Reading lists become more useful when they include short notes about who recommended a book and what question it helped answer. Our friends at <a href="https://openlibrary.zz">Open Library</a> use this method to make a shelf feel welcoming rather than intimidating.',
          'Paper and digital records have different strengths. A searchable catalog is fast, while a handwritten margin can show the path of a thought. A considerate technology project makes room for both.',
        ],
      },
      {
        heading: 'Follow the evidence',
        paragraphs: [
          'On a farm, in a lab, or at a neighborhood meeting, a dated record makes it possible to compare one season with another. The growers at <a href="https://fieldnotes.zz">Fieldnotes</a> use observations to improve agriculture while keeping the reasoning visible.',
          'Our notebooks include uncertainty rather than hiding it. A useful record is not an argument that everything went to plan; it is a trail that helps a group learn from what actually happened.',
        ],
      },
    ],
    links: [
      { address: 'openlibrary.zz', label: 'Open Library' },
      { address: 'fieldnotes.zz', label: 'Fieldnotes' },
      { address: 'paper-archive-missing.zz', label: 'The missing paper archive' },
    ],
  },
  {
    address: 'citygarden.zz',
    title: 'City Garden: Growing Together',
    authorKey: 'avery-moss',
    introduction:
      'City Garden documents a shared urban growing space where food, shade, and neighborhood knowledge grow side by side. The garden welcomes new volunteers and makes its plans and harvest notes public.',
    sections: [
      {
        heading: 'A bed for every season',
        paragraphs: [
          'The west beds hold leafy greens in cool weather and climbing beans when the days lengthen. We leave flowering herbs between rows for pollinators and keep a few sections fallow under mulch so the soil can recover.',
          'Gardeners label plantings with dates and seed sources. That simple record makes it easier to share successful varieties and notice when a crop struggles. Agriculture is a practice of observation as much as planting.',
        ],
      },
      {
        heading: 'Water, compost, and care',
        paragraphs: [
          'Rain barrels reduce demand on treated water, and finished compost returns kitchen scraps to the soil. Volunteers check the moisture below the surface before watering, which prevents waste and protects roots during a hot week.',
          'The garden is part of a wider environmental network. Our planting plan leaves a route for small wildlife and avoids chemical treatments that could harm beneficial insects. Neighbors can compare notes with the <a href="https://greenroots.zz">Green Roots block project</a>.',
        ],
      },
      {
        heading: 'Share the harvest and the map',
        paragraphs: [
          'Produce is offered at a weekly table with recipe cards and a list of nearby food resources. A garden should be easy to find, so the <a href="https://tinyatlas.zz">Tiny Atlas</a> marks the accessible gate, water station, and shaded seating.',
          'For a landscape-scale perspective, read <a href="https://fieldnotes.zz">Fieldnotes from a Living Farm</a>. The same principles of healthy soil, patient record keeping, and shared stewardship apply at every scale.',
        ],
      },
    ],
    links: [
      { address: 'greenroots.zz', label: 'Green Roots' },
      { address: 'tinyatlas.zz', label: 'Tiny Atlas' },
      { address: 'garden-shed-archive.zz', label: 'Garden shed archive' },
    ],
  },
  {
    address: 'openlibrary.zz',
    title: 'Open Library: A Shelf for Everyone',
    authorKey: 'jun-park',
    introduction:
      'Open Library is a neighborhood reading room and a guide to finding books, zines, and patient explanations. Its catalog is built around questions readers bring, from local history to technology and the natural world.',
    sections: [
      {
        heading: 'Browse by question',
        paragraphs: [
          'A shelf can be organized around a question rather than a discipline. “How does a place change?” leads to books about ecology, urban planning, agriculture, and memory. Readers often find a useful answer in the unexpected book beside the one they came for.',
          'Each recommendation includes a short description, reading level when known, and a note about why it belongs. We want the catalog to help a curious person choose a next step, not to make expertise feel like a gate.',
        ],
      },
      {
        heading: 'Keep knowledge accessible',
        paragraphs: [
          'The reading room has wide aisles, large-print titles, and a quiet corner for study. Volunteers help visitors find public resources and explain how to request a book without requiring a digital account.',
          'Our technology shelf covers repair, privacy, and the history of computing. The practical notes at <a href="https://bytejournal.zz">Byte Journal</a> are a useful companion for readers who want to build and understand their own tools.',
        ],
      },
      {
        heading: 'Reading beyond the room',
        paragraphs: [
          'A book about soil becomes more vivid after a garden visit. Start with the shared beds at <a href="https://citygarden.zz">City Garden</a>, then compare its seasonal notes with the agriculture journal at <a href="https://fieldnotes.zz">Fieldnotes</a>.',
          'For a night-sky reading list, try <a href="https://stargazer.zz">Stargazer</a>. The best library is not only a place to store books; it is a set of paths between ideas and the people who can use them.',
        ],
      },
    ],
    links: [
      { address: 'bytejournal.zz', label: 'Byte Journal' },
      { address: 'citygarden.zz', label: 'City Garden' },
      { address: 'closed-stacks.zz', label: 'The closed stacks catalog' },
    ],
  },
  {
    address: 'slowcoffee.zz',
    title: 'Slow Coffee: A Cup with a Longer Story',
    authorKey: 'nia-okafor',
    introduction:
      'Slow Coffee follows a cup from harvest to table, focusing on the people, landscapes, and choices behind a daily ritual. It is a guide to flavor that keeps agriculture and environmental responsibility in view.',
    sections: [
      {
        heading: 'Begin with the harvest',
        paragraphs: [
          'Coffee is an agricultural crop shaped by altitude, rainfall, soil, and the labor of growers. A clear label should tell a reader what is known about origin and processing, while acknowledging when a supply chain cannot answer every question.',
          'Shade-grown systems can support birds and protect soil, but the details matter. We look for long-term relationships, fair payment, and farming practices described by the people who use them rather than relying on a vague green label.',
        ],
      },
      {
        heading: 'Taste with attention',
        paragraphs: [
          'A small change in grind, water temperature, or steep time can transform a cup. Keep one variable steady while adjusting another, and write down what you notice: sweetness, acidity, texture, and how the flavor changes as the drink cools.',
          'This kind of patient observation is not far from field science. The growers at <a href="https://fieldnotes.zz">Fieldnotes</a> use seasonal records to understand soil and crop health, while our notebook tracks how a roast expresses its origin.',
        ],
      },
      {
        heading: 'Make less waste',
        paragraphs: [
          'Reusable filters, compostable grounds, and careful dosing reduce waste without turning a morning ritual into a chore. Grounds can return to a garden compost when mixed with other materials and managed with attention to moisture.',
          'Our neighborhood compost partner is <a href="https://citygarden.zz">City Garden</a>. For broader environmental notes about soil, water, and habitat, visit <a href="https://greenroots.zz">Green Roots</a>.',
        ],
      },
    ],
    links: [
      { address: 'fieldnotes.zz', label: 'Fieldnotes' },
      { address: 'citygarden.zz', label: 'City Garden' },
      { address: 'highland-roaster.zz', label: 'Highland roaster notes' },
    ],
  },
];

const visits: SeedVisit[] = [
  { personKey: 'avery-moss', minutesAfterStart: 2, address: 'tidepool.zz', navigationType: 'typed' },
  { personKey: 'jun-park', minutesAfterStart: 4, address: 'tinyatlas.zz', navigationType: 'typed' },
  { personKey: 'nia-okafor', minutesAfterStart: 6, address: 'slowcoffee.zz', navigationType: 'typed' },
  { personKey: 'theo-bell', minutesAfterStart: 8, address: 'bytejournal.zz', navigationType: 'typed' },
  { personKey: 'avery-moss', minutesAfterStart: 11, address: 'fieldnotes.zz', navigationType: 'link' },
  { personKey: 'jun-park', minutesAfterStart: 13, address: 'openlibrary.zz', navigationType: 'link' },
  { personKey: 'nia-okafor', minutesAfterStart: 16, address: 'greenroots.zz', navigationType: 'link' },
  { personKey: 'theo-bell', minutesAfterStart: 18, address: 'stargazer.zz', navigationType: 'link' },
  { personKey: 'avery-moss', minutesAfterStart: 22, address: 'citygarden.zz', navigationType: 'search' },
  { personKey: 'jun-park', minutesAfterStart: 25, address: 'fieldnotes.zz', navigationType: 'search' },
  { personKey: 'nia-okafor', minutesAfterStart: 28, address: 'tidepool.zz', navigationType: 'search' },
  { personKey: 'theo-bell', minutesAfterStart: 31, address: 'papertrail.zz', navigationType: 'typed' },
  { personKey: 'avery-moss', minutesAfterStart: 35, address: 'vanishedreef.zz', navigationType: 'link' },
  { personKey: 'jun-park', minutesAfterStart: 38, address: 'bytejournal.zz', navigationType: 'link' },
  { personKey: 'nia-okafor', minutesAfterStart: 41, address: 'slowcoffee.zz', navigationType: 'history' },
  { personKey: 'theo-bell', minutesAfterStart: 44, address: 'openlibrary.zz', navigationType: 'search' },
  { personKey: 'avery-moss', minutesAfterStart: 48, address: 'greenroots.zz', navigationType: 'history' },
  { personKey: 'jun-park', minutesAfterStart: 51, address: 'maproom-missing.zz', navigationType: 'link' },
  { personKey: 'nia-okafor', minutesAfterStart: 55, address: 'fieldnotes.zz', navigationType: 'link' },
  { personKey: 'theo-bell', minutesAfterStart: 59, address: 'stargazer.zz', navigationType: 'history' },
];

function renderSite(site: SeedSite): string {
  const sections = site.sections
    .map(
      ({ heading, paragraphs }) =>
        `<section><h2>${heading}</h2>${paragraphs
          .map((paragraph) => `<p>${paragraph}</p>`)
          .join('')}</section>`,
    )
    .join('');
  const links = site.links
    .map(
      ({ address, label }) =>
        `<li><a href="https://${address}">${label}</a> <span>(${address})</span></li>`,
    )
    .join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${site.title}</title></head><body><main><header><p>THE SMALL WEB / FIELD EDITION</p><h1>${site.title}</h1><p>${site.introduction}</p></header>${sections}<section><h2>Follow these paths</h2><ul>${links}</ul></section><footer><p>Made for curious neighbors. Read slowly, leave things better, and share what you learn.</p></footer></main></body></html>`;
}

function stableVisitId(visit: SeedVisit): Types.ObjectId {
  const identity = [
    SEED_NAMESPACE,
    visit.personKey,
    visit.minutesAfterStart,
    visit.address,
    visit.navigationType,
  ].join(':');
  const hex = createHash('sha256').update(identity).digest('hex').slice(0, 24);
  return new Types.ObjectId(hex);
}

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const personModel = app.get<Model<Person>>(getModelToken(Person.name));
    const siteModel = app.get<Model<Site>>(getModelToken(Site.name));
    const visitModel = app.get<Model<Visit>>(getModelToken(Visit.name));
    const personIds = new Map<string, Types.ObjectId>();

    for (const person of people) {
      const savedPerson = await personModel
        .findOneAndUpdate(
          { name: person.name },
          { $setOnInsert: { name: person.name } },
          {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true,
          },
        )
        .select('_id')
        .lean()
        .exec();
      if (!savedPerson) throw new Error(`Could not seed person ${person.name}`);
      personIds.set(person.key, savedPerson._id);
    }

    const siteIds = new Map<string, Types.ObjectId>();
    for (const site of sites) {
      const authorId = personIds.get(site.authorKey);
      if (!authorId) throw new Error(`Missing author ${site.authorKey}`);

      const html = renderSite(site);
      const savedSite = await siteModel
        .findOneAndUpdate(
          { address: site.address },
          {
            $set: {
              title: site.title,
              html,
              contentText: extractReadableText(html),
              authorId,
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
            runValidators: true,
          },
        )
        .select('_id')
        .lean()
        .exec();
      if (!savedSite) throw new Error(`Could not seed website ${site.address}`);
      siteIds.set(site.address, savedSite._id);
    }

    for (const visit of visits) {
      const personId = personIds.get(visit.personKey);
      if (!personId) throw new Error(`Missing person ${visit.personKey}`);
      const siteId = siteIds.get(visit.address) ?? null;
      const visitedAt = new Date(
        HISTORY_START.getTime() + visit.minutesAfterStart * 60_000,
      );

      await visitModel.updateOne(
        { _id: stableVisitId(visit) },
        {
          $set: {
            personId,
            siteId,
            address: visit.address,
            navigationType: visit.navigationType,
            status: siteId ? 'success' : 'not_found',
            visitedAt,
          },
          $setOnInsert: { _id: stableVisitId(visit) },
        },
        { upsert: true, runValidators: true },
      );
    }

    const seededAddresses = sites.map(({ address }) => address);
    const [personCount, siteCount, visitCount, brokenVisitCount] =
      await Promise.all([
        personModel.countDocuments({ name: { $in: people.map(({ name }) => name) } }),
        siteModel.countDocuments({ address: { $in: seededAddresses } }),
        visitModel.countDocuments({ _id: { $in: visits.map(stableVisitId) } }),
        visitModel.countDocuments({
          _id: { $in: visits.map(stableVisitId) },
          status: 'not_found',
        }),
      ]);

    console.log(
      `Seed complete: ${personCount} people, ${siteCount} websites, ${visitCount} visits (${brokenVisitCount} failed visits).`,
    );
    console.log(
      `Browsing timeline: ${new Date(HISTORY_START.getTime() + 2 * 60_000).toISOString()} – ${new Date(HISTORY_START.getTime() + 59 * 60_000).toISOString()}.`,
    );
  } finally {
    await app.close();
  }
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
