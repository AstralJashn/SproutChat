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

const realisticDisasterQuestions = [
  // IMMEDIATE URGENCY - Psychological
  {
    question: "I'm hyperventilating and can't think straight. What do I do RIGHT NOW?",
    disaster_type: "psychological_crisis",
    urgency_level: "immediate",
    complexity: "simple",
    context: "Person is experiencing acute panic attack in survival situation, breathing rapidly, feeling dizzy",
    expected_topics: ["breathing techniques", "box breathing", "4-7-8 method", "immediate calming", "STOP technique"]
  },
  {
    question: "My friend just went into shock after seeing someone injured. How do I snap them out of it?",
    disaster_type: "psychological_crisis",
    urgency_level: "immediate",
    complexity: "moderate",
    context: "Companion is frozen, unresponsive, pale, needs to function to help with emergency",
    expected_topics: ["freeze response", "grounding techniques", "sensory awareness", "immediate intervention", "safety assessment"]
  },
  {
    question: "I keep freezing when I try to make decisions. People are depending on me. Help!",
    disaster_type: "psychological_crisis",
    urgency_level: "urgent",
    complexity: "moderate",
    context: "Group leader experiencing decision paralysis, others looking to them for guidance",
    expected_topics: ["decision fatigue", "STOP technique", "micro-goals", "breaking down tasks", "leadership stress"]
  },

  // IMMEDIATE URGENCY - Shelter/Exposure
  {
    question: "It's getting dark and the temperature is dropping fast. I have 30 minutes of daylight. What's my priority?",
    disaster_type: "shelter_emergency",
    urgency_level: "immediate",
    complexity: "moderate",
    context: "Lost hiker, no shelter, temperature dropping below freezing, dusk approaching",
    expected_topics: ["shelter priority", "heat loss", "site selection", "rapid shelter building", "insulation"]
  },
  {
    question: "I'm soaking wet and starting to shiver uncontrollably. What do I do first?",
    disaster_type: "exposure_emergency",
    urgency_level: "immediate",
    complexity: "simple",
    context: "Person fell in water or got caught in rain, early signs of hypothermia",
    expected_topics: ["wet clothes danger", "removing wet clothing", "hypothermia stages", "getting dry", "heat conservation"]
  },
  {
    question: "Wind is ripping through my shelter. Should I rebuild or try to reinforce it?",
    disaster_type: "shelter_emergency",
    urgency_level: "urgent",
    complexity: "moderate",
    context: "Severe weather, existing shelter compromised, darkness or storm preventing relocation",
    expected_topics: ["shelter reinforcement", "wind protection", "emergency repairs", "site assessment", "backup options"]
  },

  // URGENT - Mixed Scenarios
  {
    question: "Everyone in our group is arguing about what to do next. How do I prevent this from falling apart?",
    disaster_type: "psychological_crisis",
    urgency_level: "urgent",
    complexity: "complex",
    context: "Group survival situation, tensions high, conflicting opinions creating dysfunction",
    expected_topics: ["group dynamics", "leadership distribution", "conflict resolution", "morale maintenance", "communication"]
  },
  {
    question: "I haven't slept in 48 hours and I'm making stupid mistakes. Should I rest even though we need to keep moving?",
    disaster_type: "psychological_crisis",
    urgency_level: "urgent",
    complexity: "moderate",
    context: "Exhausted person recognizing cognitive impairment, weighing rest vs progress",
    expected_topics: ["exhaustion signs", "cognitive overload", "deliberate rest", "decision making impairment", "priorities"]
  },
  {
    question: "We're stuck in an urban building during a disaster. Windows everywhere. Where's the safest place?",
    disaster_type: "shelter_emergency",
    urgency_level: "urgent",
    complexity: "moderate",
    context: "Urban disaster, explosions or debris hazards, need shelter-in-place location",
    expected_topics: ["urban shelter", "window hazards", "interior rooms", "barricading", "explosion protection"]
  },

  // IMPORTANT - Planning & Prevention
  {
    question: "How do I stop my team from panicking if something goes wrong tomorrow?",
    disaster_type: "psychological_preparedness",
    urgency_level: "important",
    complexity: "moderate",
    context: "Pre-disaster scenario, preparing group mentally for potential challenges",
    expected_topics: ["mental preparation", "rehearsed responses", "contingency planning", "calm communication", "stress inoculation"]
  },
  {
    question: "What's the most important survival skill I should practice before an emergency?",
    disaster_type: "general_preparedness",
    urgency_level: "important",
    complexity: "simple",
    context: "Person wanting to prepare, asking for priority training focus",
    expected_topics: ["shelter building", "Rule of 3s", "priority skills", "practice drills", "fire building"]
  },
  {
    question: "If I can only teach my family ONE thing before a disaster, what should it be?",
    disaster_type: "psychological_preparedness",
    urgency_level: "important",
    complexity: "moderate",
    context: "Parent preparing family, wants most critical single skill or knowledge",
    expected_topics: ["STOP technique", "calm under pressure", "basic shelter", "family planning", "communication"]
  },

  // ROUTINE - Knowledge Building
  {
    question: "Why do I need to know about shelter if I'm just going on a day hike?",
    disaster_type: "general_education",
    urgency_level: "routine",
    complexity: "simple",
    context: "Novice hiker questioning relevance of survival knowledge for short trips",
    expected_topics: ["exposure dangers", "unexpected situations", "Rule of 3s", "preparation importance", "weather changes"]
  },
  {
    question: "What's the difference between being stressed and being in survival mode mentally?",
    disaster_type: "psychological_education",
    urgency_level: "routine",
    complexity: "moderate",
    context: "Person learning about psychology, wants to understand stress vs crisis response",
    expected_topics: ["stress physiology", "fight or flight", "cortisol effects", "cognitive changes", "survival mindset"]
  },
  {
    question: "Can you explain the Rule of 3s and why it matters?",
    disaster_type: "general_education",
    urgency_level: "routine",
    complexity: "simple",
    context: "New learner asking about fundamental survival principle",
    expected_topics: ["3 minutes air", "3 hours shelter", "3 days water", "3 weeks food", "priority hierarchy"]
  },

  // COMPLEX SCENARIOS - Multiple Issues
  {
    question: "I'm alone, it's freezing, I'm exhausted, and I can't stop crying. I don't know what to do first.",
    disaster_type: "compound_crisis",
    urgency_level: "immediate",
    complexity: "complex",
    context: "Solo survivor overwhelmed by multiple immediate threats and emotional breakdown",
    expected_topics: ["STOP technique", "priority assessment", "shelter first", "emotional regulation", "micro-goals", "self-rescue"]
  },
  {
    question: "Our shelter collapsed in the night. It's -10°F. Two people are hurt. What's the order of operations?",
    disaster_type: "compound_emergency",
    urgency_level: "immediate",
    complexity: "complex",
    context: "Multiple casualties, severe cold, shelter destroyed, group needs triage and action plan",
    expected_topics: ["triage", "immediate shelter", "injury assessment", "cold exposure", "group organization", "priorities"]
  },
  {
    question: "I built a shelter but I'm still freezing. What am I doing wrong?",
    disaster_type: "shelter_technique",
    urgency_level: "urgent",
    complexity: "moderate",
    context: "Person has shelter but inadequate insulation or heat loss issues",
    expected_topics: ["insulation thickness", "floor insulation", "air gaps", "wet materials", "body heat retention", "common mistakes"]
  },

  // SPECIFIC TECHNICAL QUESTIONS
  {
    question: "How do I know if I'm building my shelter in a safe location?",
    disaster_type: "shelter_technique",
    urgency_level: "important",
    complexity: "moderate",
    context: "Person about to build shelter, wants to avoid hazardous locations",
    expected_topics: ["site selection", "high ground", "flood zones", "wind breaks", "hazard identification", "animal trails"]
  },
  {
    question: "What's the minimum shelter I can build if I only have 20 minutes before dark?",
    disaster_type: "shelter_emergency",
    urgency_level: "urgent",
    complexity: "moderate",
    context: "Time-critical situation, need emergency shelter quickly",
    expected_topics: ["rapid shelter", "debris pile", "insulation priority", "survival mindset", "improvisation"]
  },
  {
    question: "My fire pit is next to my shelter. Is that dangerous?",
    disaster_type: "shelter_safety",
    urgency_level: "urgent",
    complexity: "simple",
    context: "Person has fire too close to shelter, carbon monoxide and fire spread risk",
    expected_topics: ["fire safety distance", "10 feet minimum", "carbon monoxide", "ventilation", "fire positioning"]
  },

  // EMOTIONAL & PSYCHOLOGICAL DEPTH
  {
    question: "I'm starting to lose hope. How do I keep going when everything seems impossible?",
    disaster_type: "psychological_crisis",
    urgency_level: "urgent",
    complexity: "complex",
    context: "Person experiencing despair, questioning ability to survive, needs hope restoration",
    expected_topics: ["hope cultivation", "daily accomplishments", "micro-goals", "visualization", "short-term wins", "mental resilience"]
  },
  {
    question: "Why can't I remember simple things? I know this stuff but my brain won't work.",
    disaster_type: "psychological_crisis",
    urgency_level: "urgent",
    complexity: "moderate",
    context: "Stress-induced memory impairment, person knows they're not thinking clearly",
    expected_topics: ["cortisol effects", "hippocampus", "stress memory", "cognitive function", "breathing to reset", "hydration"]
  },
  {
    question: "Is it normal to feel detached from what's happening, like I'm watching a movie?",
    disaster_type: "psychological_education",
    urgency_level: "important",
    complexity: "moderate",
    context: "Person experiencing dissociation or emotional numbing during crisis",
    expected_topics: ["dissociation", "shock response", "grounding techniques", "sensory anchoring", "normal stress responses"]
  },

  // PRACTICAL APPLICATION QUESTIONS
  {
    question: "I'm trying box breathing but I keep getting distracted. Am I doing it wrong?",
    disaster_type: "psychological_technique",
    urgency_level: "important",
    complexity: "simple",
    context: "Person attempting calming technique, struggling with focus",
    expected_topics: ["box breathing practice", "4-7-8 method", "distraction normal", "persistence", "technique refinement"]
  },
  {
    question: "How thick does my debris layer need to be for real insulation?",
    disaster_type: "shelter_technique",
    urgency_level: "important",
    complexity: "simple",
    context: "Building debris shelter, wants to know adequate insulation depth",
    expected_topics: ["24 inches minimum", "air trapping", "loose packing", "insulation materials", "testing warmth"]
  },
  {
    question: "Can I use snow as insulation or will it make me colder?",
    disaster_type: "shelter_technique",
    urgency_level: "important",
    complexity: "moderate",
    context: "Cold weather survival, questioning snow shelter physics",
    expected_topics: ["snow caves", "snow insulation properties", "air pockets", "proper technique", "dry vs wet snow"]
  },

  // GROUP DYNAMICS
  {
    question: "Someone in our group is making dangerous decisions but won't listen. What do I do?",
    disaster_type: "psychological_crisis",
    urgency_level: "urgent",
    complexity: "complex",
    context: "Group conflict, safety concern, leadership challenge",
    expected_topics: ["group safety", "leadership distribution", "communication", "intervention", "decision making", "conflict resolution"]
  },
  {
    question: "How do I keep morale up when we've been stuck here for days?",
    disaster_type: "psychological_technique",
    urgency_level: "important",
    complexity: "moderate",
    context: "Extended survival situation, group morale declining",
    expected_topics: ["morale maintenance", "routines", "storytelling", "humor", "small victories", "hope cultivation"]
  },

  // ENVIRONMENTAL SPECIFIC
  {
    question: "The wind chill is -30°F. How long before exposure becomes life-threatening?",
    disaster_type: "exposure_knowledge",
    urgency_level: "immediate",
    complexity: "moderate",
    context: "Extreme cold exposure, need to understand time urgency",
    expected_topics: ["wind chill", "exposure timeline", "3 hours rule", "frostbite", "hypothermia progression", "immediate shelter"]
  },
  {
    question: "I'm in a city during a chemical/biological threat. How do I seal a room properly?",
    disaster_type: "urban_shelter",
    urgency_level: "urgent",
    complexity: "moderate",
    context: "Urban CBRN scenario, need shelter-in-place techniques",
    expected_topics: ["room sealing", "plastic sheeting", "tape", "ventilation control", "interior room", "CBRN basics"]
  },

  // BEGINNER CONFUSION
  {
    question: "Everyone talks about shelter first, but isn't water more important?",
    disaster_type: "general_education",
    urgency_level: "routine",
    complexity: "simple",
    context: "Beginner questioning survival priorities, needs Rule of 3s explanation",
    expected_topics: ["Rule of 3s", "exposure kills faster", "3 hours vs 3 days", "priority hierarchy", "context dependent"]
  },
  {
    question: "What's the STOP technique and when should I use it?",
    disaster_type: "psychological_education",
    urgency_level: "routine",
    complexity: "simple",
    context: "Learning panic management technique",
    expected_topics: ["STOP acronym", "halt think observe plan", "panic interruption", "application timing", "crisis management"]
  }
];

async function insertDisasterQuestions() {
  console.log('🧠 Generating Realistic Disaster Questions');
  console.log('==========================================\n');

  console.log(`Preparing to insert ${realisticDisasterQuestions.length} questions...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const q of realisticDisasterQuestions) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/disaster_questions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(q)
      });

      if (response.ok) {
        successCount++;
        console.log(`✅ [${successCount}] ${q.question.substring(0, 60)}...`);
      } else {
        errorCount++;
        const error = await response.text();
        console.error(`❌ Failed: ${error.substring(0, 100)}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Successfully inserted: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📈 Success rate: ${((successCount / realisticDisasterQuestions.length) * 100).toFixed(1)}%`);

  if (successCount > 0) {
    console.log('\n🎉 Disaster questions loaded successfully!');
    console.log('\nQuestion Breakdown:');
    const byUrgency = realisticDisasterQuestions.reduce((acc, q) => {
      acc[q.urgency_level] = (acc[q.urgency_level] || 0) + 1;
      return acc;
    }, {});
    console.log('   By Urgency:', JSON.stringify(byUrgency, null, 2));

    const byComplexity = realisticDisasterQuestions.reduce((acc, q) => {
      acc[q.complexity] = (acc[q.complexity] || 0) + 1;
      return acc;
    }, {});
    console.log('   By Complexity:', JSON.stringify(byComplexity, null, 2));
  }
}

insertDisasterQuestions();
