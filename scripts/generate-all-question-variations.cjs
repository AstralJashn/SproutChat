const https = require('https');

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrdm15dWZubG5pa3huZmx4bGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NzU3MDYsImV4cCI6MjA3NjI1MTcwNn0.3RhqRaY9KFRUAbZXSvc8OrDQ3kNVTjDIf11Tnoi7wOs';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrdm15dWZubG5pa3huZmx4bGh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY3NTcwNiwiZXhwIjoyMDc2MjUxNzA2fQ.RdmqHOO-tE0H2JE2D1YsP8kQxzKOdqo2LqzmYhf-4u0';

// Ultra comprehensive question variations for stressed users
const questionVariations = {
  earthquake: {
    disaster_type: 'earthquake',
    questions: [
      // Panicked / Stressed
      { q: 'earthquake happening now what do i do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'EARTHQUAKE HELP', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'ground shaking really bad help me', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'what do I do earthquake happening right now', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'earthquake started where do i go', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'building shaking what to do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'im scared earthquake help', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'everything is shaking what should i do', urgency: 'high', complexity: 'simple', context: 'during_event' },

      // During earthquake
      { q: 'should i run outside during earthquake', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'where is safe spot in earthquake', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'doorway safe earthquake', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'under table earthquake good', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'what if im in bed earthquake', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'im driving earthquake what do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'earthquake in car pull over', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'drop cover hold on what mean', urgency: 'high', complexity: 'simple', context: 'during_event' },

      // After earthquake
      { q: 'earthquake just stopped what now', urgency: 'high', complexity: 'simple', context: 'after_event' },
      { q: 'aftershock coming what do', urgency: 'high', complexity: 'simple', context: 'after_event' },
      { q: 'building damaged earthquake safe to stay', urgency: 'high', complexity: 'moderate', context: 'after_event' },
      { q: 'smell gas after earthquake what do', urgency: 'high', complexity: 'simple', context: 'after_event' },
      { q: 'earthquake over is it safe now', urgency: 'medium', complexity: 'simple', context: 'after_event' },
      { q: 'how check for damage earthquake', urgency: 'medium', complexity: 'moderate', context: 'after_event' },
      { q: 'water not working after earthquake', urgency: 'medium', complexity: 'simple', context: 'after_event' },
      { q: 'power out after earthquake', urgency: 'medium', complexity: 'simple', context: 'after_event' },

      // Before / Preparedness
      { q: 'how prepare for earthquake', urgency: 'low', complexity: 'moderate', context: 'preparation' },
      { q: 'earthquake kit what need', urgency: 'low', complexity: 'moderate', context: 'preparation' },
      { q: 'earthquake supplies list', urgency: 'low', complexity: 'simple', context: 'preparation' },
      { q: 'how secure furniture earthquake', urgency: 'low', complexity: 'moderate', context: 'preparation' },
      { q: 'earthquake drill practice', urgency: 'low', complexity: 'simple', context: 'preparation' },
      { q: 'what to do before earthquake', urgency: 'low', complexity: 'moderate', context: 'preparation' },

      // General / Learning
      { q: 'what is earthquake', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'how earthquakes work', urgency: 'low', complexity: 'moderate', context: 'general' },
      { q: 'earthquake safety tips', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'earthquake magnitude scale', urgency: 'low', complexity: 'moderate', context: 'general' },
      { q: 'aftershocks how long', urgency: 'low', complexity: 'simple', context: 'general' }
    ]
  },

  flood: {
    disaster_type: 'flood',
    questions: [
      // Emergency / During
      { q: 'water rising fast what do i do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'FLOOD HELP WATER COMING IN', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'trapped in house flooding', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'car stalled in flood water', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'water up to my knees what now', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'should i evacuate flood', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'flooding where go now', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'water coming fast help', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'flash flood what do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'can i drive through water', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'how deep is too deep to drive', urgency: 'high', complexity: 'moderate', context: 'during_event' },
      { q: 'stuck on roof flood rescue', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'flood water rising to second floor', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'go to attic flood', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'swept away in water what do', urgency: 'high', complexity: 'simple', context: 'during_event' },

      // Before / Warning
      { q: 'flood warning what should i do', urgency: 'high', complexity: 'simple', context: 'warning' },
      { q: 'flood watch what mean', urgency: 'medium', complexity: 'simple', context: 'warning' },
      { q: 'heavy rain flooding soon', urgency: 'medium', complexity: 'simple', context: 'warning' },
      { q: 'how prepare for flood', urgency: 'medium', complexity: 'moderate', context: 'preparation' },
      { q: 'flood insurance need', urgency: 'low', complexity: 'moderate', context: 'preparation' },
      { q: 'what to do when flood warning', urgency: 'high', complexity: 'moderate', context: 'warning' },

      // After
      { q: 'flood water receding safe to go back', urgency: 'medium', complexity: 'moderate', context: 'after_event' },
      { q: 'house flooded what do now', urgency: 'medium', complexity: 'moderate', context: 'after_event' },
      { q: 'flood damage cleanup', urgency: 'medium', complexity: 'moderate', context: 'after_event' },
      { q: 'water contaminated flood', urgency: 'medium', complexity: 'simple', context: 'after_event' },
      { q: 'can i drink tap water after flood', urgency: 'medium', complexity: 'simple', context: 'after_event' },
      { q: 'snakes after flood', urgency: 'medium', complexity: 'simple', context: 'after_event' },
      { q: 'mold from flood', urgency: 'low', complexity: 'moderate', context: 'after_event' },

      // General
      { q: 'turn around dont drown what mean', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'how much water move car', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'flash flood vs river flood', urgency: 'low', complexity: 'moderate', context: 'general' }
    ]
  },

  hurricane: {
    disaster_type: 'hurricane',
    questions: [
      // Emergency / During
      { q: 'hurricane hitting now what do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'HURRICANE HELP', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'winds really strong where hide', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'hurricane eye calm can i go outside', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'is eye of hurricane safe', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'water coming in hurricane storm surge', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'hurricane safe room where go', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'hurricane in mobile home what do', urgency: 'high', complexity: 'simple', context: 'during_event' },

      // Before / Preparation / Evacuation
      { q: 'should i evacuate hurricane', urgency: 'high', complexity: 'moderate', context: 'evacuation' },
      { q: 'hurricane coming in 2 days what do', urgency: 'medium', complexity: 'moderate', context: 'preparation' },
      { q: 'hurricane category 3 evacuate', urgency: 'high', complexity: 'simple', context: 'evacuation' },
      { q: 'evacuation zone how find', urgency: 'medium', complexity: 'moderate', context: 'evacuation' },
      { q: 'hurricane supplies list', urgency: 'medium', complexity: 'simple', context: 'preparation' },
      { q: 'board windows hurricane', urgency: 'medium', complexity: 'moderate', context: 'preparation' },
      { q: 'fill bathtub hurricane why', urgency: 'medium', complexity: 'simple', context: 'preparation' },
      { q: 'get gas hurricane', urgency: 'medium', complexity: 'simple', context: 'preparation' },
      { q: 'cash hurricane why need', urgency: 'medium', complexity: 'simple', context: 'preparation' },
      { q: 'when evacuate hurricane', urgency: 'high', complexity: 'simple', context: 'evacuation' },
      { q: 'too late to evacuate hurricane', urgency: 'high', complexity: 'simple', context: 'evacuation' },
      { q: 'hurricane category 5 coming', urgency: 'high', complexity: 'simple', context: 'evacuation' },

      // After
      { q: 'hurricane passed over safe to go out', urgency: 'medium', complexity: 'simple', context: 'after_event' },
      { q: 'power lines down after hurricane', urgency: 'high', complexity: 'simple', context: 'after_event' },
      { q: 'standing water after hurricane safe', urgency: 'high', complexity: 'simple', context: 'after_event' },
      { q: 'generator use hurricane', urgency: 'medium', complexity: 'moderate', context: 'after_event' },
      { q: 'when power back after hurricane', urgency: 'low', complexity: 'simple', context: 'after_event' },
      { q: 'water safe to drink after hurricane', urgency: 'medium', complexity: 'simple', context: 'after_event' },

      // General
      { q: 'what is hurricane', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'hurricane categories explained', urgency: 'low', complexity: 'moderate', context: 'general' },
      { q: 'storm surge what is', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'hurricane season when', urgency: 'low', complexity: 'simple', context: 'general' }
    ]
  },

  tornado: {
    disaster_type: 'tornado',
    questions: [
      // Emergency / During
      { q: 'tornado warning where go NOW', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'TORNADO HELP', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'tornado siren going off what do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'funnel cloud spotted what do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'tornado no basement where go', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'bathtub tornado safe', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'mobile home tornado what do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'car tornado what do', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'outside tornado no shelter', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'ditch tornado safe', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'highway overpass tornado', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'tornado coming drive away', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'sky green tornado coming', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'sounds like train tornado', urgency: 'high', complexity: 'simple', context: 'during_event' },

      // Before / Preparation
      { q: 'tornado watch what do', urgency: 'medium', complexity: 'simple', context: 'preparation' },
      { q: 'tornado warning vs watch', urgency: 'medium', complexity: 'simple', context: 'general' },
      { q: 'safe room tornado where', urgency: 'medium', complexity: 'moderate', context: 'preparation' },
      { q: 'tornado drill practice', urgency: 'low', complexity: 'simple', context: 'preparation' },
      { q: 'tornado safety plan', urgency: 'low', complexity: 'moderate', context: 'preparation' },
      { q: 'helmet tornado why', urgency: 'low', complexity: 'simple', context: 'preparation' },

      // After
      { q: 'tornado passed safe to come out', urgency: 'medium', complexity: 'simple', context: 'after_event' },
      { q: 'house damaged tornado what do', urgency: 'medium', complexity: 'moderate', context: 'after_event' },
      { q: 'gas leak smell tornado', urgency: 'high', complexity: 'simple', context: 'after_event' },
      { q: 'trapped in rubble tornado', urgency: 'high', complexity: 'simple', context: 'after_event' },
      { q: 'power lines down tornado', urgency: 'high', complexity: 'simple', context: 'after_event' },

      // General
      { q: 'what is tornado', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'EF scale tornado', urgency: 'low', complexity: 'moderate', context: 'general' },
      { q: 'tornado alley where', urgency: 'low', complexity: 'simple', context: 'general' }
    ]
  },

  panic: {
    disaster_type: 'panic',
    questions: [
      // High stress / panic
      { q: 'cant breathe panic help', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'freaking out what do', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'panic attack help now', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'cant calm down emergency', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'so scared cant think', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'hyperventilating what do', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'heart racing panic help', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'feeling overwhelmed disaster', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'too stressed cant function', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'anxiety attack emergency', urgency: 'high', complexity: 'simple', context: 'emergency' },

      // Managing stress
      { q: 'how stay calm emergency', urgency: 'medium', complexity: 'moderate', context: 'coping' },
      { q: 'stop panic attack breathing', urgency: 'medium', complexity: 'simple', context: 'coping' },
      { q: 'calm down fast', urgency: 'medium', complexity: 'simple', context: 'coping' },
      { q: 'stress management survival', urgency: 'medium', complexity: 'moderate', context: 'coping' },
      { q: 'stop technique panic', urgency: 'medium', complexity: 'moderate', context: 'coping' },
      { q: 'breathing exercises stress', urgency: 'medium', complexity: 'moderate', context: 'coping' },
      { q: 'how control fear', urgency: 'medium', complexity: 'moderate', context: 'coping' },
      { q: 'feeling hopeless what do', urgency: 'medium', complexity: 'simple', context: 'coping' },
      { q: 'overwhelmed by situation help', urgency: 'medium', complexity: 'simple', context: 'coping' },

      // General
      { q: 'what is panic attack', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'why do i panic in emergency', urgency: 'low', complexity: 'moderate', context: 'general' },
      { q: 'fight or flight response', urgency: 'low', complexity: 'moderate', context: 'general' },
      { q: 'stress survival importance', urgency: 'low', complexity: 'moderate', context: 'general' }
    ]
  },

  power_outage: {
    disaster_type: 'power_outage',
    questions: [
      // Emergency / During
      { q: 'power out what do now', urgency: 'medium', complexity: 'simple', context: 'during_event' },
      { q: 'electricity gone help', urgency: 'medium', complexity: 'simple', context: 'during_event' },
      { q: 'no power lights', urgency: 'medium', complexity: 'simple', context: 'during_event' },
      { q: 'blackout what do', urgency: 'medium', complexity: 'simple', context: 'during_event' },
      { q: 'power out food safe', urgency: 'medium', complexity: 'simple', context: 'during_event' },
      { q: 'refrigerator no power how long', urgency: 'medium', complexity: 'simple', context: 'during_event' },
      { q: 'freezer food safe no power', urgency: 'medium', complexity: 'simple', context: 'during_event' },
      { q: 'no heat power out cold', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'no AC power out hot', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'generator use safely', urgency: 'medium', complexity: 'moderate', context: 'during_event' },
      { q: 'generator indoors safe', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'carbon monoxide generator', urgency: 'high', complexity: 'simple', context: 'during_event' },
      { q: 'candles power out safe', urgency: 'medium', complexity: 'simple', context: 'during_event' },
      { q: 'phone battery dying no power', urgency: 'medium', complexity: 'simple', context: 'during_event' },
      { q: 'medical equipment no power', urgency: 'high', complexity: 'simple', context: 'during_event' },

      // Heating/Cooling
      { q: 'stay warm no power', urgency: 'high', complexity: 'moderate', context: 'during_event' },
      { q: 'stay cool no power', urgency: 'high', complexity: 'moderate', context: 'during_event' },
      { q: 'heat house no power', urgency: 'high', complexity: 'moderate', context: 'during_event' },
      { q: 'space heater no power', urgency: 'medium', complexity: 'simple', context: 'during_event' },

      // General
      { q: 'when power back', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'report power outage', urgency: 'medium', complexity: 'simple', context: 'general' },
      { q: 'prepare for power outage', urgency: 'low', complexity: 'moderate', context: 'preparation' }
    ]
  },

  shelter: {
    disaster_type: 'shelter',
    questions: [
      // Emergency wilderness
      { q: 'need shelter now wilderness', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'build shelter fast', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'cold night no shelter', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'lost woods need shelter', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'freezing need shelter quick', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'emergency shelter wilderness', urgency: 'high', complexity: 'moderate', context: 'emergency' },

      // Building shelter
      { q: 'how build shelter wilderness', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'lean to shelter how make', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'debris shelter build', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'snow shelter how make', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'quinzhee build', urgency: 'medium', complexity: 'complex', context: 'instruction' },
      { q: 'cave shelter safe', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'tarp shelter setup', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'ground insulation shelter', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'best location shelter', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'wind protection shelter', urgency: 'medium', complexity: 'moderate', context: 'instruction' },

      // General
      { q: 'what is survival shelter', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'shelter vs fire priority', urgency: 'low', complexity: 'moderate', context: 'general' },
      { q: 'hypothermia without shelter', urgency: 'medium', complexity: 'moderate', context: 'general' },
      { q: 'rule of 3 shelter', urgency: 'low', complexity: 'simple', context: 'general' }
    ]
  },

  water: {
    disaster_type: 'water',
    questions: [
      // Emergency / Critical need
      { q: 'no water help', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'dying of thirst where find water', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'dehydrated need water now', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'out of water wilderness', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'find water fast', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'really thirsty no water', urgency: 'high', complexity: 'simple', context: 'emergency' },

      // Finding water
      { q: 'how find water wilderness', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'where find water survival', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'follow animals to water', urgency: 'medium', complexity: 'simple', context: 'instruction' },
      { q: 'collect rainwater', urgency: 'medium', complexity: 'simple', context: 'instruction' },
      { q: 'morning dew collect', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'solar still make', urgency: 'medium', complexity: 'complex', context: 'instruction' },
      { q: 'plants water extract', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'stream water safe', urgency: 'medium', complexity: 'simple', context: 'safety' },

      // Purifying water
      { q: 'purify water wilderness', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'boil water how long', urgency: 'medium', complexity: 'simple', context: 'instruction' },
      { q: 'water filter wilderness', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'no way to purify water', urgency: 'high', complexity: 'moderate', context: 'emergency' },
      { q: 'drink untreated water safe', urgency: 'medium', complexity: 'simple', context: 'safety' },
      { q: 'giardia water', urgency: 'medium', complexity: 'simple', context: 'safety' },
      { q: 'sick from bad water', urgency: 'medium', complexity: 'moderate', context: 'safety' },

      // Dehydration
      { q: 'signs of dehydration', urgency: 'medium', complexity: 'simple', context: 'general' },
      { q: 'how much water need per day', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'dehydration symptoms', urgency: 'medium', complexity: 'simple', context: 'general' },
      { q: 'urine color dehydration', urgency: 'medium', complexity: 'simple', context: 'general' },

      // What NOT to drink
      { q: 'drink ocean water', urgency: 'medium', complexity: 'simple', context: 'safety' },
      { q: 'drink urine survival', urgency: 'medium', complexity: 'simple', context: 'safety' },
      { q: 'drink blood survival', urgency: 'medium', complexity: 'simple', context: 'safety' },

      // General
      { q: 'rule of 3 water', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'water or food first', urgency: 'low', complexity: 'simple', context: 'general' }
    ]
  },

  fire: {
    disaster_type: 'fire',
    questions: [
      // Emergency / Critical need
      { q: 'freezing need fire now', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'hypothermia need fire help', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'cant start fire freezing', urgency: 'high', complexity: 'simple', context: 'emergency' },
      { q: 'wet wood cant start fire', urgency: 'high', complexity: 'moderate', context: 'emergency' },
      { q: 'no matches how start fire', urgency: 'high', complexity: 'moderate', context: 'emergency' },
      { q: 'fire wont start help', urgency: 'high', complexity: 'simple', context: 'emergency' },

      // Starting fire
      { q: 'how start fire wilderness', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'start fire no matches', urgency: 'medium', complexity: 'complex', context: 'instruction' },
      { q: 'friction fire how', urgency: 'medium', complexity: 'complex', context: 'instruction' },
      { q: 'bow drill fire', urgency: 'medium', complexity: 'complex', context: 'instruction' },
      { q: 'ferro rod use', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'flint and steel fire', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'magnifying glass fire', urgency: 'medium', complexity: 'moderate', context: 'instruction' },

      // Fire materials
      { q: 'tinder for fire', urgency: 'medium', complexity: 'simple', context: 'instruction' },
      { q: 'kindling what is', urgency: 'medium', complexity: 'simple', context: 'instruction' },
      { q: 'fuzz stick make', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'fatwood find', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'best wood for fire', urgency: 'low', complexity: 'simple', context: 'instruction' },
      { q: 'wet conditions start fire', urgency: 'medium', complexity: 'complex', context: 'instruction' },
      { q: 'rain start fire', urgency: 'medium', complexity: 'complex', context: 'instruction' },

      // Fire structure
      { q: 'teepee fire build', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'log cabin fire', urgency: 'medium', complexity: 'moderate', context: 'instruction' },
      { q: 'dakota fire hole', urgency: 'medium', complexity: 'complex', context: 'instruction' },

      // Fire safety
      { q: 'fire safety wilderness', urgency: 'medium', complexity: 'moderate', context: 'safety' },
      { q: 'put out fire properly', urgency: 'medium', complexity: 'moderate', context: 'safety' },
      { q: 'fire in shelter safe', urgency: 'high', complexity: 'moderate', context: 'safety' },
      { q: 'carbon monoxide fire', urgency: 'high', complexity: 'simple', context: 'safety' },

      // General
      { q: 'why fire important survival', urgency: 'low', complexity: 'simple', context: 'general' },
      { q: 'fire vs shelter priority', urgency: 'low', complexity: 'moderate', context: 'general' },
      { q: 'signal fire rescue', urgency: 'medium', complexity: 'moderate', context: 'instruction' }
    ]
  }
};

// Insert question to database
async function insertQuestion(question, disasterType, urgency, complexity, context) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      question: question,
      disaster_type: disasterType,
      urgency_level: urgency,
      complexity: complexity,
      context: context,
      expected_topics: [disasterType],
      times_tested: 0,
      metadata: {
        generated_at: new Date().toISOString(),
        source: 'comprehensive_stressed_variations'
      }
    });

    const options = {
      hostname: 'skvmyufnlnikxnflxlhu.supabase.co',
      path: '/rest/v1/disaster_questions',
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve();
      } else {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.error(`Error inserting question: ${body}`);
          reject(new Error(body));
        });
      }
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Main function
(async () => {
  console.log('🚀 Generating comprehensive question variations for stressed users...\n');

  let totalQuestions = 0;

  for (const [topic, data] of Object.entries(questionVariations)) {
    console.log(`\n📋 Processing ${topic.toUpperCase()} (${data.questions.length} variations)`);

    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      try {
        await insertQuestion(
          q.q,
          data.disaster_type,
          q.urgency,
          q.complexity,
          q.context
        );
        totalQuestions++;
        process.stdout.write(`  ✅ ${i + 1}/${data.questions.length}\r`);
        await new Promise(r => setTimeout(r, 100)); // Rate limit
      } catch (error) {
        console.error(`\n  ❌ Failed: "${q.q}"`);
      }
    }
    console.log(`\n  ✓ Completed ${topic}`);
  }

  console.log(`\n\n✅ DONE! Added ${totalQuestions} comprehensive question variations for stressed users!`);
  console.log('\nBreakdown:');
  for (const [topic, data] of Object.entries(questionVariations)) {
    console.log(`  - ${topic}: ${data.questions.length} variations`);
  }
})();
