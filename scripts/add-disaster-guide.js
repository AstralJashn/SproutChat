import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

// Comprehensive disaster guide content
const disasterGuide = {
  "title": "Comprehensive Natural Disasters Guide",
  "content": "Detailed survival protocols for earthquakes, hurricanes, floods, and tornadoes",
  "source": "Sigma 3 Survival School - Natural Disasters",
  "chunks": [
    {
      "title": "Earthquakes - Formation and Warning Signs",
      "content": "EARTHQUAKES - Formation and Characteristics: Earthquakes occur when tectonic plates shift, releasing accumulated stress along fault lines. They strike without warning, lasting seconds to minutes, causing ground shaking, liquefaction, landslides, and structural collapse. Magnitude measures energy released (Richter/Moment scales), while intensity measures local effects (Modified Mercalli). Aftershocks continue for days to years, often nearly as powerful as the main shock. Common misconceptions: 'Doorways are safest' (outdated - modern buildings don't need doorway reinforcement), 'Ground opens and swallows people' (rare, ground shifts laterally), 'Animals predict earthquakes reliably' (inconsistent, not actionable). Warning signs: Earthquakes have NO reliable early warning. Some report minor foreshocks, unusual animal behavior, or changes in groundwater, but these are not consistent enough to predict earthquakes. The best preparation is readiness, not prediction.",
      "questionVariants": [
        "What causes earthquakes",
        "How do earthquakes form",
        "What are earthquake warning signs",
        "Can animals predict earthquakes",
        "What is earthquake magnitude vs intensity",
        "How long do earthquakes last",
        "What are aftershocks",
        "Do doorways protect from earthquakes",
        "Can the ground swallow you in earthquake",
        "What is liquefaction",
        "earthquake formation",
        "tectonic plates earthquakes",
        "earthquake phases",
        "earthquake misconceptions",
        "Richter scale explained",
        "Modified Mercalli scale",
        "earthquake foreshocks",
        "why do earthquakes happen",
        "plate tectonics and earthquakes"
      ]
    },
    {
      "title": "Earthquakes - Complete Survival Protocol",
      "content": "EARTHQUAKES - What To Do: PREVENTION AND PREPARATION: Secure heavy furniture, water heaters, and appliances to walls with brackets and straps. Store breakables low and secure. Create earthquake kit with 2 weeks supplies: water (1 gallon/person/day), non-perishable food, first aid, flashlights, battery radio, cash, copies of documents, medications, sturdy shoes. Identify safe spots in each room: under sturdy tables, against interior walls away from windows, glass, and heavy objects. Practice DROP, COVER, HOLD ON drills monthly. Know gas/water shutoffs. Secure water heater with metal straps. Install flexible pipe fittings for gas and water. Bolt bookcases to walls. Store heavy items on low shelves. Keep emergency supplies in multiple locations. IMMEDIATE RESPONSE (During shaking): DROP to hands and knees immediately - prevents falling. COVER head and neck under sturdy furniture, face away from windows. If no furniture, protect head/neck with arms against interior wall away from windows. HOLD ON to shelter and move with it. Stay put until shaking stops completely. If in bed, stay there, cover head with pillow. If outdoors, move away from buildings, power lines, trees to open area then DROP, COVER, HOLD ON. If driving, pull over away from structures/overpasses/trees, stay inside vehicle, set parking brake. DO NOT run outside during shaking - falling debris kills. DO NOT use doorways - no safer than other locations in modern buildings. DO NOT use elevators. DO NOT stand in doorway. The 'triangle of life' theory (lying next to furniture) is discredited - get UNDER furniture. STABILIZATION AND RECOVERY (After shaking stops): Wait 60 seconds after shaking ends - brain needs time to reorient. Check yourself for injuries, then others - treat life-threatening bleeding and breathing first. Expect aftershocks - return to safe position immediately if shaking resumes. Check for hazards: Gas leaks (smell, hissing sound - shut off at meter, evacuate, don't relight or use any flames/switches), electrical damage (sparks, exposed wires - shut off at main breaker), structural damage (cracks, sagging ceilings, shifted foundation - evacuate immediately). Open doors carefully - objects may fall. Wear sturdy shoes and gloves. Use stairs only, never elevators. Avoid touching power lines or damaged structures. Listen to battery radio for emergency instructions. Conserve phone battery for emergencies - networks overloaded. Text instead of calling - uses less bandwidth. Document damage with photos for insurance. Don't flush toilets until sewer lines checked. Avoid driving - roads may be damaged, bridges unsafe, emergency vehicles need access. Open cabinets carefully - contents may fall. Clean up spills of medicines, bleach, gasoline immediately - ventilate area. Check on neighbors, especially elderly, disabled, and those living alone. Be prepared to shelter in place for 72 hours minimum if infrastructure damaged. Aftershocks can continue for months - stay alert and ready.",
      "questionVariants": [
        "What to do during an earthquake",
        "How to survive an earthquake",
        "What is drop cover hold on",
        "Should I run outside during earthquake",
        "Are doorways safe in earthquakes",
        "What to do after earthquake stops",
        "How to prepare for earthquakes",
        "Earthquake survival kit checklist",
        "How to secure furniture for earthquakes",
        "What to do if earthquake hits while driving",
        "earthquake safety",
        "earthquake preparedness",
        "earthquake response plan",
        "aftershock safety",
        "earthquake evacuation",
        "gas leak after earthquake",
        "earthquake first aid",
        "earthquake shelter in place",
        "triangle of life earthquake myth",
        "how to check for gas leak after earthquake",
        "earthquake safety in bed",
        "earthquake safety outdoors",
        "earthquake safety in car",
        "what to do in earthquake at work",
        "earthquake emergency kit contents"
      ]
    },
    {
      "title": "Hurricanes - Formation and Warning Systems",
      "content": "HURRICANES - Formation and Characteristics: Hurricanes (Atlantic/Eastern Pacific), typhoons (Western Pacific), and cyclones (Indian Ocean) are rotating tropical storms with sustained winds exceeding 74 mph. Form over warm ocean water (80°F+), drawing energy from evaporation. Structure: Eye is calm center (20-40 miles wide) with light winds and clear skies, surrounded by eyewall containing strongest winds (100+ mph) and torrential rain. Rainbands spiral outward bringing heavy rain and tornadoes. Storm surge - ocean water pushed ashore by winds and low pressure - causes 90% of hurricane deaths, not wind. Categories (Saffir-Simpson): 1 (74-95mph, minimal damage), 2 (96-110mph, moderate), 3 (111-129mph MAJOR, devastating), 4 (130-156mph MAJOR, catastrophic), 5 (157+mph MAJOR, total destruction). Development phases: Tropical disturbance → Tropical depression (organized, winds <39mph) → Tropical storm (named, winds 39-73mph) → Hurricane (74+mph). Season: Atlantic June 1-November 30, peak August-October. Eastern Pacific May 15-November 30. Forecast track shows cone of uncertainty - ENTIRE cone area is at risk, not just centerline. Storm can intensify rapidly - gain 35+mph winds in 24 hours. Forward speed affects impact duration: fast storms pass quickly, slow storms dump extreme rain causing catastrophic flooding. Hurricanes weaken over land but remain dangerous - inland flooding kills many. Storm surge heights: Category 1: 4-5ft, Category 2: 6-8ft, Category 3: 9-12ft, Category 4: 13-18ft, Category 5: 18+ft. Surge can extend 100+ miles along coast.",
      "questionVariants": [
        "How do hurricanes form",
        "What causes hurricanes",
        "What is hurricane storm surge",
        "What is the eye of a hurricane",
        "What are hurricane categories",
        "When is hurricane season",
        "What is the difference between hurricane typhoon cyclone",
        "How fast do hurricane winds get",
        "What is rapid intensification hurricane",
        "Why are slow hurricanes dangerous",
        "hurricane formation",
        "hurricane categories explained",
        "storm surge vs hurricane winds",
        "hurricane cone of uncertainty",
        "tropical storm vs hurricane",
        "Saffir Simpson scale",
        "what is hurricane eyewall",
        "how tall is storm surge",
        "hurricane season dates",
        "what makes a major hurricane",
        "category 5 hurricane winds"
      ]
    },
    {
      "title": "Hurricanes - Complete Evacuation and Survival Protocol",
      "content": "HURRICANES - What To Do: PREVENTION (5-7 Days Before): Monitor National Hurricane Center (nhc.noaa.gov) forecasts when storm forms. Know your evacuation zone (A, B, C, etc.) based on storm surge risk - check local emergency management website. Zone A evacuates for all hurricanes, Zone B for Category 2+, Zone C for Category 3+. If in mobile home, manufactured home, or RV, evacuate for ANY hurricane - these structures are not safe. Review evacuation routes - have primary and alternate. Identify shelter locations - hotels inland, friends/family outside risk area, public shelters (last resort). Gather supplies now: water (1 gallon/person/day for 2 weeks), non-perishable food, manual can opener, first aid kit, prescription medications (30-day supply), flashlights, extra batteries, battery/hand-crank radio, cash ($500+ in small bills), copies of important documents in waterproof container, phone chargers and battery packs, sleeping bags, change of clothes, hygiene items, pet supplies and carriers. PREPARATION (2-3 Days Before): Finalize evacuation decision - if ordered, GO. Don't wait. Traffic worsens rapidly. Contraflow (reversing highway lanes) activates. Gas stations run out of fuel. Fill all vehicles with gas NOW. Withdraw cash from ATM - they won't work after storm. If staying (ONLY if NOT in evacuation zone AND building is sturdy AND storm is Category 1-2): Bring in ALL outdoor items - furniture, decorations, trash cans, plants - they become deadly missiles in high winds. Board windows with 5/8\" plywood or close storm shutters. Fill bathtubs, sinks, and large containers with water - treatment plants will fail. Turn refrigerator and freezer to coldest setting. Make ice in every container. Group perishables together. Fill coolers with ice. Charge all devices fully. Unplug small electronics to prevent surge damage. Locate utilities shutoffs. Prepare safe room on FIRST FLOOR (not second floor - structural failure drops you) in interior space away from windows and exterior walls - bathroom, closet, or hallway. Remove pictures and mirrors from walls. IMMEDIATE RESPONSE (24 Hours Before): Final evacuation - leave NOW if ordered. Roads will jam. If staying: Move to safe room. Keep radio on for updates. Have supplies accessible: water, food, first aid, flashlight, radio, important documents, medications. Wear sturdy shoes. NEVER go outside during eye - winds return from opposite direction with equal violence within 20-30 minutes. Most injuries occur during eye when people venture outside. DURING STORM: Stay in safe room center, away from windows. Lie under sturdy furniture if possible. Listen to radio continuously. If storm surge flooding begins, move to second floor or attic with axe/saw to cut through roof if needed. Do NOT go outside for ANY reason. Flying debris, falling trees, structural collapse, storm surge, tornadoes, and downed power lines are constant threats. If roof fails, huddle in interior space and protect head. AFTER STORM: Wait for official ALL-CLEAR from emergency management - storm must be completely passed. Avoid all standing water - contains sewage, chemicals, snakes, fire ants, alligators, and submerged hazards. EVERY puddle may be electrified from downed power lines. Stay away from downed lines - assume energized. Don't touch anything touching lines. Call utility company. Don't drive through water - 6 inches sweeps away vehicles. If you must walk through water, use stick to check depth and feel for holes. Photograph all damage for insurance BEFORE cleanup. Use generator OUTSIDE ONLY, 20+ feet from building - carbon monoxide kills within minutes indoors. Never use charcoal grill or camping stove indoors. Don't use candles - gas leaks cause explosions - use flashlights only. Boil all tap water for 1 minute until officials declare safe or use bottled water. Check on neighbors, especially elderly. Be patient - power restoration takes days to weeks for major hurricanes. Avoid sightseeing - roads dangerous, you block emergency vehicles.",
      "questionVariants": [
        "What to do in a hurricane",
        "How to prepare for hurricane",
        "Should I evacuate for hurricane",
        "What is hurricane evacuation zone",
        "Can I ride out a hurricane",
        "What to do during hurricane eye",
        "Hurricane survival kit list",
        "How to shelter during hurricane",
        "What to do after hurricane passes",
        "Is it safe to go out during hurricane eye",
        "hurricane safety tips",
        "hurricane evacuation plan",
        "hurricane safe room",
        "storm surge survival",
        "hurricane categories to evacuate",
        "hurricane flooding safety",
        "downed power lines after hurricane",
        "hurricane generator safety",
        "when to evacuate for hurricane",
        "hurricane evacuation zones explained",
        "boarding windows for hurricane",
        "hurricane safe room location",
        "carbon monoxide poisoning after hurricane",
        "how long does hurricane last",
        "mobile home hurricane safety"
      ]
    },
    {
      "title": "Floods - Types, Dangers, and Warning Systems",
      "content": "FLOODS - Formation and Characteristics: Floods are the most common and deadly natural disaster in the US. Types and formation: Flash floods (rapid onset within 6 hours of triggering event - heavy rain, dam failure, levee breach, ice jam - extremely dangerous, walls of water 10-30 feet high moving at 40+ mph, occur in mountains, urban areas, dry washes), River floods (gradual, develops over days to weeks from prolonged rainfall or snowmelt, rivers overflow banks, can remain flooded for weeks), Coastal floods (storm surge from hurricanes, king tides, tsunamis, nor'easters push ocean inland), Urban floods (overwhelmed stormwater systems, poor drainage, concrete prevents absorption). Dangers quantified: 6 inches of moving water can knock down an adult. 12 inches can float most cars. 18-24 inches will carry away most vehicles including SUVs and trucks. Water moving at 6 mph exerts same force per unit area as air moving at 270 mph. Fast-moving water undercuts pavement creating invisible sinkholes and gaps - road appears intact but collapses under weight. Most flood deaths (75%) occur in vehicles - drivers attempt to cross flooded roads. 'Turn Around Don't Drown' - just 12 inches of water can sweep car away. Floodwater contamination: Raw sewage, agricultural runoff, industrial chemicals, gasoline, sharp debris (glass, metal, nails), disease organisms (E. coli, hepatitis, tetanus), wildlife (snakes, alligators, fire ants), and electrified water from downed power lines. Half of all flood insurance claims come from low or moderate risk areas - flooding happens everywhere, not just floodplains. Warning system: Flood Watch means conditions favorable for flooding - monitor situation closely. Flood Warning means flooding is occurring or will occur soon - take action immediately. Flash Flood Warning means life-threatening rapid flooding occurring now - act immediately, every second counts.",
      "questionVariants": [
        "What causes floods",
        "What is a flash flood",
        "How fast can flash floods occur",
        "How deep water to move a car",
        "Why are flooded roads dangerous",
        "What is river flooding vs flash flooding",
        "What diseases are in flood water",
        "Do I need flood insurance",
        "What is flash flood warning vs watch",
        "Can I drive through flooded road",
        "flood formation types",
        "flash flood danger",
        "flood water contamination",
        "vehicle in flood water",
        "turn around don't drown",
        "how much water to float a car",
        "coastal flooding causes",
        "urban flooding why happens",
        "flood insurance low risk areas",
        "flood watch vs flood warning"
      ]
    },
    {
      "title": "Floods - Complete Safety and Survival Protocol",
      "content": "FLOODS - What To Do: PREVENTION: Purchase flood insurance NOW - standard homeowners insurance does NOT cover flooding. NFIP flood insurance has 30-day waiting period, so plan ahead. Cost averages $700/year. Know your flood risk: visit FEMA Flood Map Service Center or msc.fema.gov to check if you're in 100-year (1% annual chance) or 500-year (0.2% chance) floodplain. Create detailed evacuation plan with multiple routes to high ground - main roads flood first. Pre-identify safe shelter locations on high ground. Make copies of important documents (insurance, IDs, deeds, medical records), store in waterproof container and upload to cloud storage. Photograph all possessions for insurance. Elevate furnace, water heater, electrical panel above expected flood level. Install sump pump with battery backup. Keep emergency kit accessible on upper floor or high shelf: water, non-perishable food, first aid, flashlight, battery radio, charged phone and battery pack, cash, medications, hygiene supplies. IMMEDIATE RESPONSE (Flood Watch): Monitor NOAA Weather Radio and local news constantly. Charge all devices. Fill vehicles with gas. Move vehicles to highest ground available. Bring outdoor furniture and valuables inside and to upper floors. Fill bathtubs and all clean containers with drinking water - treatment plants fail. Review evacuation routes. URGENT (Flood Warning - Flooding Imminent or Occurring): Evacuate IMMEDIATELY if ordered by authorities - do not delay or wait to see if water reaches you. Move to high ground. If trapped in building, go to HIGHEST floor possible. Only go to attic if you have axe, saw, or tool to cut through roof to escape - many people drown in attics as water rises. Call 911 with your location, address, and number of people. Wave bright colored cloth from window. Flash lights at night to signal location. NEVER attempt to walk, swim, or drive through floodwater: 6 inches of moving water knocks down adults and children. 12 inches floats most vehicles - you lose control, vehicle becomes boat in current. 18-24 inches sweeps away cars, trucks, SUVs. Currents below surface are much stronger than they appear - crosscurrents create undertows. Water conceals dangers: deep holes, missing pavement, downed power lines (entire puddle may be electrified 100+ yards away), sharp debris, chemical contamination, sewage, snakes, alligators, fire ants. Roads undermined and collapsed just beneath water surface - invisible until you're on it. One in three drowning deaths are vehicle-related. 'Turn Around Don't Drown' - find alternate route, no destination is worth your life. DURING FLOOD: If vehicle stalls in water, ABANDON IT IMMEDIATELY and move to high ground. Water can rise several feet in minutes. Don't waste time trying to restart. Don't return for belongings. If swept away by current: Stay calm (panic exhausts you), float on back with feet downstream pointing forward to fend off rocks and debris with legs, angle your body toward nearest shore, swim at 45-degree angle to current - don't fight it directly. Grab onto anything stable if possible. Call for help. If trapped in building, signal continuously. Don't use electrical appliances if wet or standing in water. Turn off electricity at main breaker if you can reach it safely. AFTER FLOOD: Wait for official all-clear from authorities. Return during daylight only. Document all damage with photos and video BEFORE touching anything - critical for insurance. Wear protective gear: waterproof boots, gloves, and N95 mask - contaminated water causes infections and diseases. Throw away any food, cosmetics, or medicine that contacted floodwater. Discard any porous materials (drywall, insulation, carpeting, padding, upholstery) that were soaked - cannot be safely cleaned. Disinfect everything else with bleach solution (1 cup bleach per gallon water). Check for structural damage before entering building: cracks in foundation, warped floors, buckled walls - hire inspector if unsure. Smell gas? Leave immediately, call utility from safe distance. Don't use matches, lighters, or electrical switches. Open windows and doors to dry out interior - use fans and dehumidifiers. Watch for displaced wildlife: snakes, spiders, rodents, fire ants, alligators driven to high ground or inside structures. Boil tap water for 1 minute before drinking/cooking until officials declare safe. Listen for ongoing flood warnings - additional rainfall can cause renewed flooding. Heavy rains upstream cause downstream flooding hours later. Get tetanus shot if cut by debris. Watch for signs of mold (health hazard) developing within 24-48 hours - requires professional remediation.",
      "questionVariants": [
        "What to do in a flood",
        "How to prepare for flooding",
        "Should I evacuate for flood",
        "Can I drive through flood water",
        "What to do if caught in flash flood",
        "How to survive flash flood",
        "Flood safety tips",
        "What to do if trapped by flood water",
        "How to clean up after flood",
        "Is flood water contaminated",
        "flood preparedness",
        "flood evacuation plan",
        "turn around don't drown meaning",
        "flood insurance when to buy",
        "vehicle swept away by flood",
        "flood water diseases",
        "how to signal for flood rescue",
        "flood damage cleanup",
        "attic flooding what to do",
        "flood water safety",
        "car stalled in flood",
        "swimming in flood current",
        "flood water contamination dangers",
        "mold after flooding",
        "tetanus from flood debris"
      ]
    },
    {
      "title": "Tornadoes - Formation, Classification, and Warning Recognition",
      "content": "TORNADOES - Formation and Characteristics: Tornadoes are violently rotating columns of air extending from thunderstorm to ground, with winds up to 300 mph. Formation: Develop from supercell thunderstorms when wind shear (changing wind speed and direction with altitude) creates horizontal rotating tube of air. Strong updraft (up to 150 mph) tilts rotation vertical, forming mesocyclone. If mesocyclone touches ground, it's a tornado. Can also form from squall lines, tropical cyclones, and in rare cases, fire tornadoes (firenadoes). Enhanced Fujita Scale rates damage: EF0 (65-85 mph, light damage - shingles off, gutters damaged, tree branches broken), EF1 (86-110 mph, moderate damage - roof surfaces peeled, mobile homes overturned, cars pushed off roads), EF2 (111-135 mph, considerable damage - roofs torn off frame houses, large trees uprooted, cars lifted off ground), EF3 (136-165 mph, severe damage - entire stories of structures destroyed, trains overturned, trees debarked, cars thrown), EF4 (166-200 mph, devastating damage - well-built houses leveled, structures with weak foundations blown away, cars become missiles), EF5 (over 200 mph, incredible damage - strong frame houses swept clean off foundations, automobile-sized missiles thrown 100+ yards, pavement stripped from roads, trees debarked). Geography and timing: Tornado Alley (Great Plains - Texas to South Dakota) has highest frequency, but tornadoes occur in all 50 states. Peak season: Spring (March-June) in South, Summer in Northern Plains, but possible year-round. Dixie Alley (Southeast) has significant tornado activity, often at night (more deadly - people sleeping). Average tornado: 5 miles long path, 50 yards wide, lasts 10 minutes. Violent tornadoes: Can be over 1 mile wide, track 50+ miles, last over an hour. Multiple-vortex tornadoes have several smaller funnels rotating around main circulation - cause extreme localized damage, appear to 'hop'. Warning signs: Dark, often greenish sky (green indicates hail). Wall cloud (lowering from storm base). Large hail. Loud roar like freight train or waterfall - indicates tornado even if you can't see it through rain. Visible debris cloud at ground level even without visible funnel. Sudden wind shift and intense rainfall followed by eerie calm, then violent winds from opposite direction. Warning system: Tornado Watch means atmospheric conditions favorable for tornadoes - stay alert, have plan ready. Tornado Warning means tornado spotted by trained spotter or indicated by Doppler radar - take shelter IMMEDIATELY, you may have only seconds.",
      "questionVariants": [
        "How do tornadoes form",
        "What causes tornadoes",
        "What are tornado categories",
        "Enhanced Fujita scale explained",
        "What is tornado alley",
        "When is tornado season",
        "What does tornado sound like",
        "What are tornado warning signs",
        "What is difference tornado watch vs warning",
        "How fast are tornado winds",
        "supercell thunderstorm tornado",
        "tornado formation process",
        "tornado danger signs",
        "multiple vortex tornado",
        "tornado watch meaning",
        "EF5 tornado damage",
        "what is mesocyclone",
        "green sky tornado",
        "wall cloud tornado",
        "Dixie Alley tornadoes",
        "tornado at night",
        "firenado formation"
      ]
    },
    {
      "title": "Tornadoes - Complete Shelter and Survival Protocol",
      "content": "TORNADOES - What To Do: PREVENTION: Know your county/parish name - NWS warnings issued by county. Identify best shelter NOW: Basement is best (put as many walls as possible between you and tornado, get under heavy table or workbench). No basement: Interior room (bathroom, closet, interior hallway) on LOWEST floor, away from windows and exterior walls. Get low (crouch/kneel), protect head/neck with arms, cover body with heavy blankets, sleeping bags, or mattress. Motorcycle/bicycle helmet provides excellent head protection. Avoid rooms with exterior walls, corners where two exterior walls meet (debris collects, walls fail first), large open rooms (more likely to collapse), upper floors (structural failure drops you). MOBILE HOMES ARE DEATH TRAPS: Even tied down, mobile/manufactured homes disintegrate in EF2+ tornadoes (111+ mph winds). If you live in mobile home, identify substantial permanent shelter nearby: community storm shelter, school, library, sturdy building, neighbor's basement. Leave immediately when Tornado Warning issued - you won't have time once tornado forms. Conduct tornado drills monthly so everyone knows exactly where to go - seconds matter. Store helmet, sturdy shoes, whistle, flashlight, and portable radio in shelter location. Install NOAA Weather Radio with SAME (Specific Area Message Encoding) alerts programmed for your county - alarm wakes you at night. IMMEDIATE RESPONSE (Tornado Watch): Monitor weather closely on TV, radio, or weather app. Postpone outdoor activities. Stay alert. Keep radio on. Move vehicles into garage or under cover if possible (hail damages vehicles). Charge phones. Have shoes and flashlight accessible. Delay travel. (Tornado Warning - Tornado Detected - Take Cover NOW): Go to predetermined shelter IMMEDIATELY. Do not wait to see the tornado - rain wraps hide them. If at home: Basement corner, under stairs or workbench. No basement: Interior bathroom, closet, or hallway on lowest floor. Get in bathtub if sturdy cast-iron, pull mattress over you. Get low, knees and hands, protect head and neck, cover with blankets. If in mobile home: LEAVE IMMEDIATELY to permanent shelter or closest sturdy building. If caught outside: Lie flat in ditch, ravine, or culvert below road level - protect head with hands clasped behind neck. If in vehicle with no time: Do NOT shelter under highway overpass - wind speeds actually increase, creates deadly debris wind tunnel, blocks escape routes. Last resort only: Abandon vehicle, lie flat in ditch below road grade, cover head. Better: Drive at right angles (perpendicular) to tornado path at maximum safe speed only if you can clearly see the tornado, know which direction it's moving, have clear paved roads, and are in open country - urban areas, don't try (traffic, obstructions). Never try to outrun tornado moving toward you or parallel to your path. If in large building (school, workplace, shopping center): Go to interior rooms on lowest floor, away from windows and exterior walls. Interior stairwells and bathrooms are good. Avoid large rooms with wide-span roofs (gymnasiums, auditoriums, cafeterias) - more likely to collapse. DURING TORNADO: Stay in protective position. Keep helmet on. Hold onto something sturdy. Breathing may become difficult due to rapid pressure changes - breathe normally as possible. Flying debris is the greatest danger - stay covered. Multiple tornadoes can occur - don't emerge until you're certain storm has passed, listen to radio. AFTER TORNADO: Exit shelter carefully. Building may be structurally unsound - watch for sagging floors/ceilings, leaning walls. Don't use flames or electrical switches if you smell gas - sparks cause explosions. Evacuate, call gas company from safe distance. Watch for: Downed power lines (NEVER touch, assume energized, stay 35+ feet away), broken gas lines (smell, hissing), sharp debris (nails, glass, metal), structural instability. Don't enter damaged buildings. Check for injured - render first aid. Use whistle to signal location if trapped under debris. Take photos of all damage for insurance. Don't drive unless absolutely necessary - roads blocked by debris, emergency vehicles responding. Be alert for additional tornadoes - outbreaks can produce dozens of tornadoes over many hours. Have supplies ready to shelter again. Watch for rapidly changing weather conditions.",
      "questionVariants": [
        "What to do in a tornado",
        "How to survive tornado",
        "Where is safest place in tornado",
        "Should I shelter in basement during tornado",
        "Are mobile homes safe in tornadoes",
        "Can I outrun tornado in car",
        "What to do if caught outside in tornado",
        "Should I hide under highway overpass in tornado",
        "Tornado safety tips",
        "What to do after tornado",
        "tornado shelter location",
        "tornado preparedness plan",
        "tornado in mobile home what to do",
        "tornado warning take cover",
        "bathtub tornado safety",
        "tornado debris protection",
        "southwest corner tornado myth",
        "gas leak after tornado",
        "tornado in vehicle what to do",
        "interior bathroom tornado safety",
        "helmet for tornado protection",
        "whistle for tornado rescue",
        "mobile home tornado death trap",
        "highway overpass tornado danger",
        "driving away from tornado"
      ]
    }
  ]
};

console.log('🚀 Starting Disaster Guide Integration');
console.log('=====================================\n');

async function addToKnowledgeBase() {
  console.log(`📚 Guide: ${disasterGuide.title}`);
  console.log(`📄 Chunks to process: ${disasterGuide.chunks.length}\n`);

  try {
    // First create the document manually
    console.log('Creating document...');
    const docResponse = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title: disasterGuide.title,
        content: disasterGuide.content,
        source: disasterGuide.source
      })
    });

    if (!docResponse.ok) {
      const error = await docResponse.text();
      console.error('❌ Failed to create document:', error);
      return;
    }

    const [document] = await docResponse.json();
    console.log(`✅ Document created: ${document.id}\n`);

    // Now add chunks one at a time using Mode 1
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < disasterGuide.chunks.length; i++) {
      const chunk = disasterGuide.chunks[i];
      console.log(`[${i + 1}/${disasterGuide.chunks.length}] ${chunk.title}`);
      console.log(`   Content: ${chunk.content.length} chars, Variants: ${chunk.questionVariants.length}`);

      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/add-knowledge`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentId: document.id,
            content: chunk.content,
            questionVariants: chunk.questionVariants
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ ${result.message}`);
          successCount++;
        } else {
          const error = await response.text();
          console.log(`   ❌ Failed: ${error.substring(0, 100)}`);
          errorCount++;
        }

        // Small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Final Results:');
    console.log(`   ✅ Successful chunks: ${successCount}/${disasterGuide.chunks.length}`);
    console.log(`   ❌ Failed chunks: ${errorCount}`);
    console.log(`   📈 Success rate: ${((successCount / disasterGuide.chunks.length) * 100).toFixed(1)}%`);

    if (successCount > 0) {
      console.log('\n🎉 Disaster guide integrated successfully!');
      console.log('\nKnowledge base now includes:');
      console.log('   • Earthquakes (formation, warnings, complete survival protocol)');
      console.log('   • Hurricanes (formation, categories, evacuation, survival)');
      console.log('   • Floods (types, dangers, complete safety protocol)');
      console.log('   • Tornadoes (formation, EF scale, shelter, survival)');
      console.log('\n✨ AI can now intelligently answer questions about these disasters!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addToKnowledgeBase().catch(console.error);
