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

const survivalPsychologyKnowledge = {
  title: "Survival Psychology & Mental Resilience",
  content: "Comprehensive guide to mental resilience and psychological survival techniques including stress management, panic control, breath work, mindfulness meditation, and mental endurance strategies.",
  source: "Sigma 3 Survival School - Mental Resilience Module",
  chunks: [
    {
      content: "Survival is as much a mental challenge as a physical one. The human brain responds to immediate threats with the fight-or-flight response, pumping adrenaline and cortisol, which can impair cognitive function and cause panic. Prolonged stress wears down natural resilience, leading to decision fatigue, impaired judgment, and despair. Mental resilience enables clear thinking, measured action, adaptability, and emotional endurance over days or months of survival hardship.",
      questionVariants: [
        "How does stress affect survival", "What is the psychology of survival", "Why is mental strength important in survival",
        "How does the brain respond to survival situations", "What happens mentally during a crisis", "Why do people panic in emergencies",
        "How does adrenaline affect decision making", "What is survival psychology", "How important is mental resilience",
        "Why is mindset critical for survival", "What are the psychological challenges of survival", "How does panic affect survival chances",
        "What causes decision fatigue in survival", "How does cortisol impact survival", "Why is emotional control important",
        "What is the mental aspect of survival", "How do I stay mentally strong", "What is fight or flight response",
        "How does stress impair thinking", "Why is clear thinking important in crisis", "mental survival techniques",
        "psychological survival strategies", "how to survive mentally", "mental toughness in emergencies",
        "stress response in survival", "brain under stress", "panic in survival situations",
        "mental challenges of survival", "psychological resilience", "emotional survival skills"
      ]
    },
    {
      content: "The brain's stress physiology affects memory, attention, and decision-making capacity. High cortisol levels shrink the hippocampus's ability to encode new memories and recall past knowledge, critical in survival. Overwhelmed people may freeze, panic, or take unfocused actions that waste energy and resources. Conversely, calm, purposeful thinking stems from trained breath control, practiced mindfulness, and rehearsed responses.",
      questionVariants: [
        "How does stress affect memory", "Why can't I think clearly under stress", "What happens to the brain during panic",
        "How does cortisol affect memory", "Why do people freeze in emergencies", "How can I stay calm under pressure",
        "What is the hippocampus role in survival", "Why do I forget things when stressed", "How does breathing help with stress",
        "What is mindfulness in survival", "How do I avoid panic", "Why does my brain shut down in crisis",
        "How can I improve decision making under stress", "What causes people to freeze", "How do I maintain focus in emergencies",
        "What are stress responses", "How does breath control help", "Why is staying calm important",
        "How can I think clearly in crisis", "What helps with panic management", "brain function under stress",
        "memory loss during crisis", "why people freeze up", "panic response explained",
        "staying calm techniques", "cognitive function in survival", "stress and memory",
        "brain fog in emergencies", "freeze response", "calm under pressure methods"
      ]
    },
    {
      content: "Begin a daily mindfulness meditation, focusing on breath awareness for 10-20 minutes, training your nervous system to relax on command. Learn and regularly rehearse controlled breathing techniques such as box breathing (inhale-hold-exhale-hold) or the 4-7-8 method to reduce panic and maintain focus. Practice decision-making under duress with timed drills to build confidence in quick, accurate problem-solving.",
      questionVariants: [
        "How do I practice meditation for survival", "What is box breathing", "How can I calm myself down",
        "What breathing techniques help with panic", "How do I train my nervous system", "What is the 4-7-8 breathing method",
        "How can I reduce panic", "How do I build mental resilience", "What are breathing exercises for stress",
        "How can I stay focused under pressure", "How do I practice for emergencies", "What is mindfulness meditation",
        "How long should I meditate", "How can I control my breathing", "What are panic reduction techniques",
        "How do I train for crisis situations", "What is breath awareness", "How can I improve my stress response",
        "How do I practice decision making", "What drills help with survival", "meditation for emergencies",
        "breathing exercises survival", "box breathing technique", "4-7-8 breathing",
        "calm breathing methods", "training nervous system", "emergency preparedness drills",
        "mindfulness practice", "breath control techniques", "stress reduction breathing"
      ]
    },
    {
      content: "Use the S.T.O.P technique to interrupt panic cycles during crises: Halt all impulsive actions; Think rationally; Observe environmental cues; Plan your priorities. Set micro-goals whenever tasks seem overwhelming, allowing small, achievable steps to build momentum. Use positive affirmations emphasizing capability and control such as 'I adapt and survive' or 'I have skills and resources'.",
      questionVariants: [
        "What is the STOP technique", "How do I stop panicking", "How can I interrupt panic",
        "What should I do when overwhelmed", "How do I set survival goals", "What are micro-goals",
        "How can I stay rational in crisis", "What are positive affirmations", "How do I break down survival tasks",
        "How can I observe my environment", "What should I prioritize in crisis", "How do I halt impulsive actions",
        "How can I think clearly when scared", "What helps with feeling overwhelmed", "How do I plan priorities",
        "What are crisis management techniques", "How do I stay in control", "What affirmations help survival",
        "How can I build momentum", "How do I avoid impulsive decisions", "STOP method explained",
        "panic interruption technique", "crisis management STOP", "small achievable goals",
        "survival affirmations", "managing overwhelming situations", "step by step survival",
        "rational thinking in crisis", "priority planning", "impulse control survival"
      ]
    },
    {
      content: "Prioritize nourishment and hydration—mental acuity deteriorates rapidly with deprivation. Avoid caffeine, nicotine, and other stimulants that can exacerbate anxiety and dehydration. Keep journals or mental logs to track progress, setbacks, and emotional states for self-awareness. Foster social interaction with companions to share labor and emotional burdens, even when limited.",
      questionVariants: [
        "How does hunger affect mental state", "Why is hydration important for thinking", "Should I avoid caffeine in survival",
        "How does dehydration affect the brain", "Why keep a survival journal", "How can I track my mental state",
        "Why is social connection important", "How does food affect mood", "What stimulants should I avoid",
        "How can I maintain mental clarity", "Why is nutrition critical for survival", "How do I monitor my emotions",
        "What role does community play", "How does nicotine affect survival", "Why share burdens with others",
        "How can I stay self-aware", "What helps with emotional regulation", "How does water intake affect cognition",
        "Why avoid stimulants in crisis", "How do I maintain mental acuity", "food and mental performance",
        "hydration brain function", "survival journaling", "emotional tracking",
        "social support survival", "nutrition cognition", "avoid caffeine crisis",
        "stimulants in emergencies", "community in survival", "mental clarity nutrition"
      ]
    },
    {
      content: "Use humor and storytelling in groups to reduce tension and strengthen bonds. Recognize signs of cognitive overload or exhaustion; rest deliberately to reboot mental functions. Practice grounding techniques—focus on present-day sensory experiences—to re-center during panic. Maintain physical fitness regularly to increase hormonal regulation and stress resilience.",
      questionVariants: [
        "How does humor help in survival", "What are grounding techniques", "How do I recognize mental exhaustion",
        "Why is rest important for cognition", "How can I reduce group tension", "What are sensory grounding exercises",
        "How does fitness affect mental health", "Why tell stories in survival situations", "How do I reboot my brain",
        "What helps with cognitive overload", "How can I strengthen group bonds", "Why is physical fitness important",
        "How do I re-center myself", "What are signs of mental fatigue", "How does exercise help stress",
        "Why focus on senses", "How can storytelling help", "What is deliberate rest",
        "How do I manage exhaustion", "Why maintain fitness in survival", "humor in crisis",
        "group bonding survival", "grounding exercises", "sensory awareness techniques",
        "mental fatigue signs", "fitness stress management", "storytelling groups",
        "cognitive rest", "mental reboot", "exercise mental health"
      ]
    },
    {
      content: "Cultivate hope by reviewing daily accomplishments; set goals for short-term wins. Distribute leadership and responsibilities fairly to sustain group function and morale. Establish daily routines for meals, work, and rest to maintain psychological order. Visualize a successful rescue and reunion to boost optimism. Be patient: survival is a marathon requiring mental and physical pacing over time.",
      questionVariants: [
        "How do I maintain hope", "Why set daily goals in survival", "How can I stay optimistic",
        "What are short-term wins", "How do I maintain morale", "Why establish routines",
        "How does visualization help", "What is fair leadership", "How can I boost group morale",
        "Why celebrate small victories", "How do routines help psychologically", "What helps maintain hope",
        "How do I visualize rescue", "Why distribute responsibilities", "How can I stay positive",
        "What creates psychological order", "How do I sustain optimism", "Why review accomplishments",
        "How does structure help mentally", "What visualization techniques work", "maintaining hope survival",
        "daily routines crisis", "group leadership survival", "visualization techniques",
        "psychological structure", "survival marathon mindset", "pacing in survival",
        "morale boosting", "optimism in crisis", "small wins matter"
      ]
    }
  ]
};

const shelterManagementKnowledge = {
  title: "Shelter & Exposure Management",
  content: "Comprehensive guide to building shelters and managing environmental exposure including debris huts, snow caves, urban shelters, and protection from elements.",
  source: "Sigma 3 Survival School - Shelter Module",
  chunks: [
    {
      content: "Environmental exposure—cold, wet, wind, heat—accounts for the majority of deaths in survival situations. The human body loses heat through conduction, convection, radiation, and evaporation. Shelters conserve body heat by trapping warm air, blocking wind, and preventing moisture contact. Wet clothes increase heat loss dramatically, and wind accelerates cooling exponentially (wind chill effect).",
      questionVariants: [
        "What is the biggest survival threat", "How does exposure kill", "Why is shelter the priority",
        "How do you lose body heat", "What is wind chill", "Why are wet clothes dangerous",
        "How does shelter save lives", "What causes hypothermia", "How fast can exposure kill",
        "Why is cold so dangerous", "What is heat loss", "How does wind affect survival",
        "Why is staying dry important", "What are the types of heat loss", "How does moisture affect temperature",
        "What is conduction heat loss", "How does radiation cool the body", "Why does wind make it colder",
        "What is convection", "How does evaporation cool you", "exposure deaths",
        "shelter number one priority", "heat loss mechanisms", "wind chill explained",
        "wet clothes danger", "hypothermia causes", "staying warm survival",
        "blocking wind", "trapping body heat", "cold weather survival"
      ]
    },
    {
      content: "Shelters also provide protection from excessive heat, direct sunlight, rain, snow, predators, insects, and create a psychological sanctuary. A well-built shelter increases rest quality and decision-making ability, reducing stress and physical strain. In urban scenarios, shelters must also protect against chemical, biological, radiological, and physical threats, demanding sealing techniques and structural reinforcement.",
      questionVariants: [
        "What does a shelter protect from", "Why is shelter important psychologically", "How does shelter help with sleep",
        "What are urban shelter needs", "How do I protect from predators", "Why shelter from sun",
        "What is a psychological sanctuary", "How does shelter reduce stress", "What about chemical threats",
        "How do I seal a shelter", "Why is rest quality important", "What are shelter benefits",
        "How does shelter improve decisions", "What is structural reinforcement", "How do I protect from insects",
        "What are CBRN threats", "Why is mental space important", "How does shelter help thinking",
        "What about radiation protection", "How do I reinforce urban shelter", "shelter benefits",
        "psychological shelter", "urban survival shelter", "CBRN protection",
        "sealing techniques", "predator protection", "insect protection shelter",
        "heat protection", "rain shelter", "mental sanctuary"
      ]
    },
    {
      content: "Survey surroundings to choose high, dry ground avoiding flood plains, mudslides, or avalanche zones. Identify natural windbreaks such as dense trees, rock outcroppings, or hillsides. Avoid areas near animal trails, insect nests, or stagnant water which attract pests. Collect a variety of dry insulating materials—pine needles, leaves, moss, dried grass, bark. Gather sturdy sticks and branches in multiple sizes for frame construction.",
      questionVariants: [
        "Where should I build a shelter", "How do I choose shelter location", "What is high ground",
        "Why avoid flood plains", "What are natural windbreaks", "How do I avoid avalanches",
        "What materials insulate best", "Why avoid animal trails", "How do I find dry ground",
        "What are good insulating materials", "Where do I not build shelter", "How do I identify hazard zones",
        "What makes good shelter location", "Why stay away from water", "How do I use windbreaks",
        "What natural features help", "How do I avoid mudslides", "What materials should I collect",
        "Why avoid insect nests", "How much insulation do I need", "shelter site selection",
        "high dry ground", "windbreak identification", "hazard zone avoidance",
        "insulating materials", "natural shelter materials", "collecting debris",
        "shelter frame materials", "location safety", "avoiding dangers"
      ]
    },
    {
      content: "Begin shelter frame by establishing a ridgepole between two solid supports at shoulder height. Lean sticks symmetrically against ridgepole to create an even A-frame shape. Pile at least 24 inches thickness of insulating debris over frame, pressing loosely to trap air. Construct a small, low entrance facing away from prevailing wind; install brush door for wind barrier. Line shelter floor thickly with insulating debris to reduce conductive heat loss.",
      questionVariants: [
        "How do I build an A-frame shelter", "What is a ridgepole", "How thick should insulation be",
        "How do I make a shelter frame", "What is an A-frame shelter", "How do I trap air in shelter",
        "Which way should entrance face", "How do I block wind", "What is a debris shelter",
        "How do I build a shelter door", "How high should ridgepole be", "How do I arrange sticks",
        "Why 24 inches of insulation", "How do I make it windproof", "What is prevailing wind",
        "How do I support the frame", "What makes a good shelter entrance", "How do I pile debris",
        "Why keep entrance small", "How do I build emergency shelter", "A-frame construction",
        "ridgepole setup", "debris hut building", "insulation thickness",
        "wind direction shelter", "shelter entrance", "floor insulation",
        "trapping air", "windproof shelter", "emergency shelter building"
      ]
    },
    {
      content: "In snow environments, safely dig out a cave large enough to sit upright; smooth interior walls to prevent dripping. Drill ventilation holes near top to provide fresh air and vent smoke. Insulate snow cave floor with dry branches, sleeping pads, or spare clothing. Remove wet clothes promptly and dry body and garments near fire. Always maintain shelter ventilation to avoid carbon monoxide poisoning from indoor fires.",
      questionVariants: [
        "How do I build a snow cave", "What is a snow shelter", "How big should snow cave be",
        "Why ventilate a shelter", "What is carbon monoxide poisoning", "How do I prevent CO poisoning",
        "How do I insulate snow cave floor", "Why smooth snow cave walls", "What do I do with wet clothes",
        "How do I dry wet clothing", "Why ventilation with fire", "Where do ventilation holes go",
        "How do I stay warm in snow", "What prevents CO poisoning", "How do I dig snow cave",
        "What about fire safety indoors", "Why remove wet clothes fast", "How much headroom snow cave",
        "What materials for snow cave floor", "How do I survive in snow", "snow cave construction",
        "snow shelter building", "ventilation importance", "CO poisoning prevention",
        "drying wet clothes", "snow survival", "cold weather shelter",
        "winter shelter", "ice cave", "snow camping shelter"
      ]
    },
    {
      content: "In urban areas, select interior rooms farthest from windows; seal doors and windows with tape and plastic sheeting. Barricade openings with sturdy furniture or boards to protect from explosions and intruders. Use tarps, plastic sheeting or heavy fabric to make rainproof roofing and windbreaks. Layer clothing properly: moisture-wicking base layer, insulation mid-layer, waterproof and windproof outer shell.",
      questionVariants: [
        "How do I shelter in urban areas", "How do I seal a room", "What is urban shelter-in-place",
        "How do I protect from explosions", "How do I barricade a room", "What materials seal windows",
        "How do I layer clothing", "What is the clothing layering system", "How do I stay dry",
        "What is moisture-wicking", "How do I protect from intruders", "What room is safest",
        "How do I make waterproof roof", "Why avoid windows", "What is base layer",
        "How do I create windbreak", "What furniture for barricade", "How do I seal with plastic",
        "What is outer shell layer", "How do I urban survival shelter", "urban shelter tactics",
        "room sealing", "shelter in place", "explosion protection",
        "clothing layers", "waterproof layering", "urban survival",
        "interior room safety", "barricading techniques", "city survival shelter"
      ]
    },
    {
      content: "Build fire pit downwind at least 10 feet from shelter; shelter fire with natural wind barrier. Inspect shelter daily for structural integrity, leaks, or pest entry; repair immediately. Regularly replace wet bedding with dry debris; store dry bedding off ground. Clear 10-foot perimeter around shelter and fire area to prevent spread of wildfires. Burn green leafy branches to create smoke screens deterring insects and predators.",
      questionVariants: [
        "How far should fire be from shelter", "What is fire pit safety", "How do I maintain a shelter",
        "How often inspect shelter", "How do I prevent wildfires", "How do I deter insects",
        "What is smoke screening", "Why keep fire away from shelter", "Where should campfire be",
        "How do I check for leaks", "What repairs are needed", "How do I keep pests out",
        "How do I keep bedding dry", "What is fire perimeter clearing", "Why clear around fire",
        "How does smoke deter bugs", "How often change bedding", "Why use green branches",
        "What is downwind", "How do I shelter a fire", "fire safety distance",
        "shelter maintenance", "wildfire prevention", "insect deterrent",
        "smoke screen", "bedding management", "fire clearing",
        "pest prevention", "structural inspection", "fire pit location"
      ]
    },
    {
      content: "Suspend food caches in trees or secure boxes to minimize attracting wildlife near shelter. Control lighting and noise levels within camp to avoid unnecessary attention. Use natural scent masking agents—pine boughs or smoke—to reduce risk of animal encounters. Plan for quick evacuation routes; keep shelter entrance clear and accessible. Practice rapid shelter building in drills to increase proficiency under pressure.",
      questionVariants: [
        "How do I store food away from camp", "Why keep food away from shelter", "How do I hang food in trees",
        "How do I prevent bears", "What attracts predators", "What are food caches",
        "How high to hang food", "How do I secure food", "How do I avoid wildlife",
        "Why control noise at camp", "What about light discipline", "How do I mask scent",
        "What are evacuation routes", "Why practice shelter building", "How do I get better at shelters",
        "What is scent masking", "How do I avoid animal encounters", "Why keep entrance clear",
        "What is rapid shelter building", "How do I practice survival skills", "food storage survival",
        "bear prevention", "wildlife safety", "scent masking techniques",
        "evacuation planning", "shelter drills", "camp security",
        "predator avoidance", "quick shelter", "survival practice"
      ]
    }
  ]
};

async function addKnowledge(knowledge, label) {
  console.log(`\n📚 Adding ${label}...`);
  console.log(`   Chunks: ${knowledge.chunks.length}`);

  let totalVariants = 0;
  knowledge.chunks.forEach(chunk => {
    totalVariants += chunk.questionVariants.length;
  });
  console.log(`   Question variants: ${totalVariants}`);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/add-knowledge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(knowledge),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Success!`);
    console.log(`   Document ID: ${result.document_id}`);
    console.log(`   Chunks added: ${result.chunks_added}`);
    return result;
  } catch (error) {
    console.error(`❌ Error adding ${label}:`);
    console.error(`   ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🌱 SproutChat Knowledge Base Population');
  console.log('========================================\n');
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  try {
    await addKnowledge(survivalPsychologyKnowledge, 'Psychology & Mental Resilience');
    await addKnowledge(shelterManagementKnowledge, 'Shelter & Exposure Management');

    console.log('\n🎉 All knowledge successfully added to database!');
    console.log('\nYou can now ask questions like:');
    console.log('  - "How do I stay calm in a crisis?"');
    console.log('  - "What is box breathing?"');
    console.log('  - "How do I build a snow shelter?"');
    console.log('  - "Why is mental resilience important?"');
    console.log('  - "How far should my fire be from shelter?"');
  } catch (error) {
    console.error('\n💥 Failed to add all knowledge');
    process.exit(1);
  }
}

main();
