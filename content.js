/* Clearing — content
   Original curriculum. Written in Australian English.
   Evidence levels: established | mixed | emerging | lens
   Not affiliated with, or derived from the text of, any book or programme. */
(function () {
  const has = (arr, v) => Array.isArray(arr) && arr.includes(v);
  const first = (p) => (p && p.name ? p.name : "");

  const REFS = {
    nhmrc: "National Health and Medical Research Council (2020). Australian guidelines to reduce health risks from drinking alcohol. nhmrc.gov.au/health-advice/alcohol",
    harkin: "Harkin B, et al. (2016). Does monitoring goal progress promote goal attainment? A meta-analysis. Psychological Bulletin, 142(2), 198–229.",
    michie: "Michie S, et al. (2013). The behavior change technique taxonomy (v1) of 93 hierarchically clustered techniques. Annals of Behavioral Medicine, 46(1), 81–95.",
    wiers: "Wiers RW, et al. (2002). Implicit and explicit alcohol-related cognitions in heavy and light drinkers. Journal of Abnormal Psychology, 111(4), 648–658.",
    woodquinn: "Wood W, Quinn JM, Kashy DA (2002). Habits in everyday life: thought, emotion, and action. Journal of Personality and Social Psychology, 83(6), 1281–1297.",
    woodrunger: "Wood W, Rünger D (2016). Psychology of habit. Annual Review of Psychology, 67, 289–314.",
    woodneal: "Wood W, Neal DT (2007). A new look at habits and the habit–goal interface. Psychological Review, 114(4), 843–863.",
    marlatt73: "Marlatt GA, Demming B, Reid JB (1973). Loss of control drinking in alcoholics: an experimental analogue. Journal of Abnormal Psychology, 81(3), 233–241.",
    begue: "Bègue L, et al. (2013). ‘Beauty is in the eye of the beer holder’: people who think they are drunk also think they are attractive. British Journal of Psychology, 104(2), 225–234.",
    hagger: "Hagger MS, et al. (2016). A multilab preregistered replication of the ego-depletion effect. Perspectives on Psychological Science, 11(4), 546–573.",
    galla: "Galla BM, Duckworth AL (2015). More than resisting temptation: beneficial habits mediate the relationship between self-control and positive life outcomes. Journal of Personality and Social Psychology, 109(3), 508–525.",
    carter: "Carter BL, Tiffany ST (1999). Meta-analysis of cue-reactivity in addiction research. Addiction, 94(3), 327–340.",
    bowen: "Bowen S, Marlatt GA (2009). Surfing the urge: brief mindfulness-based intervention for college student smokers. Psychology of Addictive Behaviors, 23(4), 666–671.",
    schultz: "Schultz W (1998). Predictive reward signal of dopamine neurons. Journal of Neurophysiology, 80(1), 1–27.",
    berridge: "Berridge KC, Robinson TE (2016). Liking, wanting, and the incentive-sensitization theory of addiction. American Psychologist, 71(8), 670–679.",
    boileau: "Boileau I, et al. (2003). Alcohol promotes dopamine release in the human nucleus accumbens. Synapse, 49(4), 226–231.",
    sayette: "Sayette MA (1993). An appraisal-disruption model of alcohol’s effects on stress responses in social drinkers. Psychological Bulletin, 114(3), 459–476.",
    koob: "Koob GF, Volkow ND (2016). Neurobiology of addiction: a neurocircuitry analysis. The Lancet Psychiatry, 3(8), 760–773.",
    sinha: "Sinha R (2008). Chronic stress, drug use, and vulnerability to addiction. Annals of the New York Academy of Sciences, 1141, 105–130.",
    marsh: "Marsh B, et al. (2019). Shyness, alcohol use disorders and ‘hangxiety’: a naturalistic study of social drinkers. Personality and Individual Differences, 139, 13–18.",
    ebrahim: "Ebrahim IO, Shapiro CM, Williams AJ, Fenwick PB (2013). Alcohol and sleep I: effects on normal sleep. Alcoholism: Clinical and Experimental Research, 37(4), 539–549.",
    pietila: "Pietilä J, et al. (2018). Acute effect of alcohol intake on cardiovascular autonomic regulation during the first hours of sleep in a large real-world sample of Finnish employees. JMIR Mental Health, 5(1), e23.",
    prentice: "Prentice DA, Miller DT (1993). Pluralistic ignorance and alcohol use on campus. Journal of Personality and Social Psychology, 64(2), 243–256.",
    steele: "Steele CM, Josephs RA (1990). Alcohol myopia: its prized and dangerous effects. American Psychologist, 45(8), 921–933.",
    kahneman: "Kahneman D, Fredrickson BL, Schreiber CA, Redelmeier DA (1993). When more pain is preferred to less: adding a better end. Psychological Science, 4(6), 401–405.",
    lieberman: "Lieberman MD, et al. (2007). Putting feelings into words: affect labeling disrupts amygdala activity in response to affective stimuli. Psychological Science, 18(5), 421–428.",
    gollwitzer: "Gollwitzer PM, Sheeran P (2006). Implementation intentions and goal achievement: a meta-analysis of effects and processes. Advances in Experimental Social Psychology, 38, 69–119.",
    devisser: "de Visser RO, Robinson E, Bond R (2016). Voluntary temporary abstinence from alcohol during ‘Dry January’ and subsequent alcohol use. Health Psychology, 35(3), 281–289.",
    martell: "Martell CR, Addis ME, Jacobson NS (2001). Depression in context: strategies for guided action. New York: Norton.",
    biolcati: "Biolcati R, Passini S, Mancini G (2016). ‘I cannot stand the boredom.’ Binge drinking expectancies in adolescence. Addictive Behaviors Reports, 3, 70–76.",
    bryant: "Bryant FB, Veroff J (2007). Savoring: a new model of positive experience. Mahwah, NJ: Lawrence Erlbaum.",
    iarc: "International Agency for Research on Cancer (2012). Personal habits and indoor combustions. IARC Monographs, Volume 100E (alcohol classified as Group 1).",
    bem: "Bem DJ (1972). Self-perception theory. Advances in Experimental Social Psychology, 6, 1–62.",
    bryan: "Bryan CJ, Walton GM, Rogers T, Dweck CS (2011). Motivating voter turnout by invoking the self. PNAS, 108(31), 12653–12656. (Later replications were mixed.)",
    marlatt85: "Marlatt GA, Gordon JR (Eds.) (1985). Relapse prevention: maintenance strategies in the treatment of addictive behaviors. New York: Guilford.",
    adams: "Adams CE, Leary MR (2007). Promoting self-compassionate attitudes toward eating among restrictive and guilty eaters. Journal of Social and Clinical Psychology, 26(10), 1120–1144.",
    holt: "Holt-Lunstad J, Smith TB, Layton JB (2010). Social relationships and mortality risk: a meta-analytic review. PLoS Medicine, 7(7), e1000316.",
    lally: "Lally P, van Jaarsveld CHM, Potts HWW, Wardle J (2010). How are habits formed: modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.",
    ryan: "Ryan RM, Deci EL (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. American Psychologist, 55(1), 68–78.",
    zaccaro: "Zaccaro A, et al. (2018). How breath-control can change your life: a systematic review on psycho-physiological correlates of slow breathing. Frontiers in Human Neuroscience, 12, 353.",
    pennebaker: "Pennebaker JW (1997). Writing about emotional experiences as a therapeutic process. Psychological Science, 8(3), 162–166.",
    withdrawal: "MedlinePlus (US National Library of Medicine). Alcohol withdrawal. medlineplus.gov/ency/article/000764.htm",
  };

  const EVIDENCE = {
    established: { label: "Well supported", note: "Consistent findings across many studies." },
    mixed: { label: "Evidence is mixed", note: "Some studies support this, others don’t. Treat it as useful, not settled." },
    emerging: { label: "Early evidence", note: "Promising but based on smaller or fewer studies." },
    lens: { label: "A lens, not a finding", note: "A way of looking at your experience. Test it against your own data." },
  };

  /* ---------- Belief library ---------- */
  const BELIEFS = [
    {
      id: "relax", statement: "Alcohol helps me relax.",
      short: "Relief, borrowed against later",
      body: [
        "This one is partly true, which is why it’s so persuasive. Alcohol acts on GABA, the brain’s main braking system, and in the first drink or two many people feel their shoulders drop. Researchers have also found that alcohol can blunt how threatening a situation seems, especially if it’s in your system before the stress arrives.",
        "The catch is what happens next. As alcohol leaves the body, the brain’s counterbalancing systems are still running, and some people feel a rebound: lighter sleep, a jumpy 3am, a flatter or more anxious next day. With regular drinking the brain adapts, so the baseline you need relief from can quietly rise.",
        "None of this means your relaxation was imaginary. It means it was borrowed, and it’s worth checking the repayment terms in your own life."
      ],
      questions: [
        "What exactly do you feel in the first ten minutes of a drink? Be specific.",
        "How do you feel two hours later, and the next morning?",
        "What else reliably drops your shoulders, even a little?"
      ],
      test: "Next time you want a drink to unwind, try a ten-minute alternative first (shower, walk, lying on the floor with music). Rate your tension before and after.",
      refs: ["sayette", "koob", "marsh"],
    },
    {
      id: "confidence", statement: "Alcohol makes me more confident.",
      short: "Expectation does a lot of the lifting",
      body: [
        "In experiments where people are told they’re drinking alcohol but are actually given tonic, many still become chattier, bolder and more pleased with themselves. In one French study, people who believed they’d been drinking rated themselves as more attractive, whether or not their drink contained alcohol.",
        "Alcohol also narrows attention to what’s right in front of you. That can quieten the self-monitoring voice that makes us feel awkward, but it also quietens the judgement that keeps us from saying the thing we regret.",
        "The useful question isn’t ‘does it work?’ but ‘what part of it is me?’ If expectation and permission do much of the work, the confidence may be more yours than you think."
      ],
      questions: [
        "When have you felt socially at ease without a drink? What made that possible?",
        "What do you give yourself permission to do after a drink that you could choose to do anyway?",
        "What is the cost of relying on it for confidence?"
      ],
      test: "Do one small socially brave thing sober this week: start a conversation, speak first in a meeting, stay ten minutes longer. Note what actually happened versus what you predicted.",
      refs: ["marlatt73", "begue", "steele"],
    },
    {
      id: "social", statement: "Socialising is more enjoyable with alcohol.",
      short: "Who you’re with, or what’s in the glass?",
      body: [
        "Most of what makes a good night good is people, setting, food, music and the feeling of belonging. Alcohol is often present for all of it, so it gets the credit. That’s a classic case of two things travelling together and our minds assuming one causes the other.",
        "We also tend to overestimate how much other people drink and how much they’d care if we didn’t. Psychologists call this pluralistic ignorance: many people privately feel lukewarm about the drinking culture around them while assuming everyone else loves it.",
        "Some sober nights will feel flat at first. That’s worth knowing, not proof. Early sober socialising is a skill, like dancing in shoes you haven’t worn in."
      ],
      questions: [
        "Think of the best social night you can remember. What made it great?",
        "Which people in your life would genuinely notice or mind if you didn’t drink?",
        "What do you do with your hands, and your nerves, at the start of a night?"
      ],
      test: "Go to one social thing alcohol-free and rate it out of 10 at the time, then again the next morning. Compare with a drinking night you remember.",
      refs: ["prentice", "nhmrc"],
    },
    {
      id: "switchoff", statement: "I need alcohol to switch off.",
      short: "A ritual doing the work of a doorway",
      body: [
        "For many people the first drink of the evening isn’t really about the alcohol. It’s a signal: work is over, the day is mine now. That signal is powerful, and it was learned. Which means it can be relearned.",
        "Habits attach to contexts: a time, a place, a sound, a mood. The pour, the clink, the first sip have become a doorway between ‘on’ and ‘off’. You don’t necessarily need the alcohol. You might need a doorway.",
        "The experiment is to keep the transition and change what fills it."
      ],
      questions: [
        "What does ‘switching off’ actually feel like for you? What changes?",
        "What exactly are you switching off from?",
        "What else has ever worked as a doorway at the end of a day?"
      ],
      test: "Design a five-minute ‘doorway’ for the end of work: change clothes, a particular glass with something cold, one song, step outside. Repeat it for three days and see if the signal starts to take.",
      refs: ["woodneal", "woodrunger"],
    },
    {
      id: "reward", statement: "Alcohol is my reward after a difficult day.",
      short: "Wanting isn’t the same as liking",
      body: [
        "After a hard day you deserve something good. That part isn’t in question. What’s worth examining is whether a drink delivers the reward you’re after or just the anticipation of it.",
        "Neuroscientists separate ‘wanting’ (the pull, driven heavily by dopamine and anticipation) from ‘liking’ (the actual pleasure). With repeated use, the wanting can grow stronger while the liking stays the same or fades. That’s why the first sip can feel like the best one, and the rest is often chasing it.",
        "A reward that leaves you more tired tomorrow is a strange kind of reward. You might not need a smaller treat. You might need a better one."
      ],
      questions: [
        "On a scale of 1 to 10, how much did you want your last drink? How much did you enjoy it?",
        "What would feel like a genuine reward tonight?",
        "Who decided a drink was the default prize?"
      ],
      test: "Rate your anticipation before an alcohol-free treat (a bath, a great meal, a film) and your enjoyment during it. Do the same in memory for a drink. Compare the gaps.",
      refs: ["berridge", "schultz", "boileau"],
    },
    {
      id: "sleep", statement: "A drink helps me sleep.",
      short: "Faster to sleep, worse at sleeping",
      body: [
        "Alcohol often helps people fall asleep sooner. A large review of sleep studies found it shortens the time to fall asleep and deepens the first part of the night.",
        "The second half is a different story. As alcohol is metabolised, sleep tends to become lighter and more broken, and dreaming sleep (REM) is suppressed early in the night. A large Finnish study of real-world sleep found that even modest amounts changed heart-rate patterns associated with recovery during the first hours of sleep.",
        "So the honest summary is: quicker in, rougher through. Whether that matters to you is something you can observe."
      ],
      questions: [
        "How do you usually feel on waking after a drinking night versus an alcohol-free night?",
        "Do you wake around 2–4am more on drinking nights?",
        "What does your evening wind-down look like without a drink?"
      ],
      test: "Rate your sleep each morning in your check-in. After a week or two, look at the Insights screen to compare alcohol-free nights and drinking nights. It’s a pattern, not proof, but it’s yours.",
      refs: ["ebrahim", "pietila"],
    },
    {
      id: "taste", statement: "I drink because I love the taste.",
      short: "Taste, or what the taste promises?",
      body: [
        "Some people genuinely love the craft of wine, beer or a good cocktail, and that’s a real pleasure. It’s also true that most people’s first taste of alcohol was not love at first sip. The taste was learned, often alongside the effect.",
        "A useful test: how much would you enjoy the same drink if it had no alcohol in it at all? If the answer is ‘mostly fine’, the taste is doing the work. If the answer is ‘there’d be no point’, it’s the effect you’re after, and that’s worth knowing too."
      ],
      questions: [
        "What did you think of the first alcoholic drink you ever tasted?",
        "Which drinks would you still want if they had no alcohol?",
        "How much do you taste the third drink compared with the first?"
      ],
      test: "Try a well-made alcohol-free version of what you usually drink. Taste it slowly. Write down what you miss, specifically.",
      refs: ["berridge"],
    },
    {
      id: "celebrate", statement: "It’s not really a celebration without a drink.",
      short: "The ritual and the reason are different things",
      body: [
        "Toasts, champagne, a round at the pub: alcohol is woven into how many cultures, including ours, mark good moments. The ritual is real. It says ‘this matters, we’re together, let’s pause.’",
        "But the ritual and the substance can be separated. What people tend to remember from celebrations are the words, the faces, who showed up. Memory research suggests we remember experiences largely by their high points and their endings, and those rarely hinge on what was in the glass."
      ],
      questions: [
        "What do you remember most from the best celebration you’ve been to?",
        "What would you need, to feel a moment had been properly marked?",
        "Is there a celebration coming up? How do you want to remember it?"
      ],
      test: "At the next small win, mark it deliberately without alcohol: a call to someone, a meal out, a walk somewhere beautiful. Note whether it felt marked.",
      refs: ["kahneman"],
    },
  ];

  /* ---------- 30 days ---------- */
  const PHASES = ["Curiosity", "Awareness", "Understanding", "Challenging", "Confidence", "Change", "Autonomy"];

  const DAYS = [
    {
      n: 1, phase: "Curiosity", title: "An experiment, not a vow",
      kicker: "Why you’re here, and why ‘experiment’ is the right word.",
      intentions: ["Approach today with curiosity, not rules.", "Notice alcohol wherever it shows up.", "Be honest in what I record."],
      lesson: [
        "Most attempts to change drinking start with a rule and a deadline. Rules invite a pass-or-fail mindset: you’re either on track or you’ve blown it. Experiments work differently. A scientist doesn’t ‘fail’ when the data is surprising; that’s the interesting bit.",
        "For the next thirty days you are both scientist and subject. The question isn’t ‘can I be good?’ It’s ‘what is alcohol actually doing for me, and what happens when I take it out of the equation for a while?’",
        "The method is simple: notice, record, reflect. Self-monitoring is one of the most consistently useful tools in behaviour change research. Tracking what you do, and how it feels, tends to change behaviour on its own, partly because it turns autopilot into attention.",
        "Today you’ll record a baseline: how strongly you believe some common ideas about drinking. You’ll revisit these later. Answer honestly. There are no right numbers."
      ],
      pull: "You can’t fail an experiment. You can only learn something.",
      evidence: "established", refs: ["harkin", "michie"],
      exercise: { type: "beliefs", title: "Your baseline", intro: "Slide to show how true each statement feels for you right now. Go with your gut. You’ll see these again." },
      experiment: { title: "Count the cues", body: "Today, quietly count every time alcohol shows up: ads, menus, social posts, conversations, the bottle-o you drive past. Tally them in your evening reflection. Most people are surprised." },
      tip: "If a craving shows up today, it’s not a sign anything is wrong. It’s your first data point. Tap ‘Craving’ and log it.",
      evening: ["Roughly how many alcohol cues did you notice today? Which surprised you?", "What did it feel like to call this an experiment rather than a challenge?"],
      personal: (p) => p.motivation ? `You said this matters because: “${p.motivation}”. Keep that sentence nearby.` : "",
    },
    {
      n: 2, phase: "Curiosity", title: "The two minds",
      kicker: "What you think about drinking, and what you actually do.",
      intentions: ["Catch one automatic moment.", "Be kind to the part of me that runs on habit.", "Notice the gap between thinking and doing."],
      lesson: [
        "You have opinions about alcohol that you could explain at a dinner party. You also have associations you’ve never examined: the sound of a cork meaning ‘weekend’, the feel of a cold glass meaning ‘relief’.",
        "Psychologists often describe two systems at work. One is slow, deliberate and verbal. The other is fast, automatic and built from repetition and emotion. Studies have found that people’s quick, automatic associations with alcohol can predict their drinking even when their stated beliefs say otherwise.",
        "This is why deciding to drink less doesn’t always translate into drinking less. The decision lives in one system; the behaviour is often driven by the other. Change tends to stick when both are brought along, which means not just knowing differently but noticing and feeling differently.",
        "Today’s work is to make the automatic visible."
      ],
      pull: "The decision lives in one part of you. The habit lives in another.",
      evidence: "established", refs: ["wiers", "woodquinn"],
      exercise: {
        type: "prompts", title: "Two columns",
        intro: "Write quickly. Don’t edit.",
        prompts: [
          { id: "think", q: "What I think about alcohol (the version I’d say out loud):", ph: "I think it’s fine in moderation, but…" },
          { id: "feel", q: "What I feel about it (the gut version, without explaining):", ph: "Friday. Relief. A reward. A bit of dread…" },
          { id: "where", q: "Where do those two versions disagree?", ph: "" },
        ],
      },
      experiment: { title: "Catch the autopilot", body: "Find one moment today where you do something automatically (reach for your phone, open the fridge, pour a drink of anything). Pause for three seconds. Ask: did I decide this?" },
      tip: "Automatic doesn’t mean weak. Most of what we do daily runs on habit. It’s an efficient brain doing its job.",
      evening: ["What automatic moment did you catch? What happened in the pause?", "Which ‘gut’ association with alcohol surprised you most?"],
      personal: (p) => p.time ? `You said you usually drink ${labelTime(p.time)}. Watch that window today. It’s where the fast system lives.` : "",
    },
    {
      n: 3, phase: "Curiosity", title: "What you expect is what you get",
      kicker: "How much of alcohol’s effect starts in the mind.",
      intentions: ["Separate the drink from the expectation.", "Make something ordinary feel special.", "Stay curious about my own reactions."],
      lesson: [
        "In the 1970s, researchers started running clever experiments. Some people got alcohol and were told it was tonic; others got tonic and were told it was alcohol. Over and over, what people believed they were drinking shaped how they behaved: how much they wanted more, how disinhibited they became, how they rated themselves.",
        "This doesn’t mean alcohol has no effect. It clearly does. But it means a meaningful share of what we experience as ‘the drink’ is expectation, permission and ritual. That share is yours, and it doesn’t need alcohol to work.",
        "Today’s exercise asks you to spell out what you expect alcohol to do for you. Expectations that stay unspoken stay powerful. Written down, they become something you can test."
      ],
      pull: "Part of what you feel from a drink, you bring to it.",
      evidence: "established", refs: ["marlatt73", "begue"],
      exercise: {
        type: "sliders", title: "What I expect a drink to do",
        intro: "How strongly do you expect each of these from a couple of drinks?",
        items: [
          { id: "calm", label: "Make me calmer" },
          { id: "fun", label: "Make things more fun" },
          { id: "talk", label: "Make me easier to talk to" },
          { id: "forget", label: "Help me forget about problems" },
          { id: "close", label: "Make me feel closer to people" },
          { id: "treat", label: "Feel like a treat I’ve earned" },
        ],
        left: "Not at all", right: "Very much",
      },
      experiment: { title: "The good glass", body: "Make an alcohol-free drink in the glass you’d normally use for wine or a cocktail. Ice, a garnish, the full ritual. Sit down with it at your usual drinking time. Notice what the ritual does on its own." },
      tip: "Ritual is powerful and it’s portable. The glass, the moment, the sitting down: all of that is still available to you.",
      evening: ["How did the ‘good glass’ experiment feel? What part of the ritual mattered most?", "Which of your expectations do you most want to test this month?"],
      personal: (p) => has(p.benefits, "relax") ? "You named relaxing as one of alcohol’s jobs for you. Keep an eye on how much of that relief arrives before the drink even touches your lips." : "",
    },
    {
      n: 4, phase: "Awareness", title: "Why willpower is a tired strategy",
      kicker: "Stop fighting temptation. Rearrange the room.",
      intentions: ["Make the easy choice the good choice.", "Change one thing in my space.", "Be strategic, not heroic."],
      lesson: [
        "For years, a popular theory held that willpower is like a muscle that gets used up over the day. It made intuitive sense. But when dozens of labs tried to reproduce the key finding in a large coordinated study, the effect was close to zero. The jury is still out, but the simple ‘tank of willpower’ story looks shakier than it once did.",
        "What holds up better is this: people who seem to have great self-control often aren’t resisting more. They’re resisting less, because they’ve arranged their lives so temptation shows up less often. They rely on routines and environments rather than heroics.",
        "So today isn’t about trying harder. It’s about friction. Make alcohol slightly harder to reach and alternatives slightly easier. Small changes in friction have big effects on what we do on autopilot."
      ],
      pull: "People with ‘great willpower’ mostly just face fewer fights.",
      evidence: "mixed", refs: ["hagger", "galla", "woodrunger"],
      exercise: {
        type: "chips", title: "Your friction audit", multi: true,
        intro: "Which of these could you change in the next 24 hours? Choose any that fit.",
        options: ["Move alcohol out of sight", "Give unopened bottles away or put them in a box in the garage", "Stock a few alcohol-free drinks I actually like", "Change my route past the bottle-o", "Take my usual drinking chair out of play", "Tell one person what I’m doing", "Plan something for my usual drinking time", "Turn off alcohol delivery and promo emails"],
        followup: { q: "Which one will you do first, and when?", ph: "Tonight after dinner I’ll…" },
      },
      experiment: { title: "Add one point of friction", body: "Do the first item you chose. That’s all. Notice whether your mind protests, and what it says." },
      tip: "If your mind says ‘this is silly’, that’s worth writing down. It’s often the habit talking.",
      evening: ["What did you change? Did any part of you object?", "Where else in your day could a little friction help?"],
      personal: (p) => (p.concerns && p.concerns.length) ? `You mentioned worrying about ${listJoin(p.concerns.map(labelConcern)).toLowerCase()}. Friction won’t solve all of it, but it lowers the number of decisions you have to make.` : "",
    },
    {
      n: 5, phase: "Awareness", title: "The anatomy of a craving",
      kicker: "Cravings feel like orders. They’re closer to weather.",
      intentions: ["Treat a craving as something to observe.", "Time how long an urge actually lasts.", "Stay with discomfort a little longer."],
      lesson: [
        "A craving is your brain making a prediction: in this situation, a drink usually followed. Cues that have been paired with alcohol (a time of day, a place, a feeling, even a smell) can trigger measurable reactions in the body and a strong pull towards drinking. Researchers call this cue reactivity, and it’s one of the most studied effects in addiction science.",
        "Cravings tend to feel urgent and permanent. In practice they rise, peak and fall. Clinicians who teach ‘urge surfing’ describe watching an urge the way you’d watch a wave, without acting on it and without fighting it. In a small trial with smokers, this kind of noticing weakened the link between cravings and actually smoking.",
        "Every time a craving passes without a drink, the prediction gets a little weaker. That’s not willpower. It’s learning."
      ],
      pull: "A craving is a prediction, not a command.",
      evidence: "established", refs: ["carter", "bowen"],
      exercise: {
        type: "prompts", title: "Map your last craving",
        intro: "Think of the most recent time you really wanted a drink.",
        prompts: [
          { id: "when", q: "Where were you, and what time was it?", ph: "" },
          { id: "before", q: "What happened just before?", ph: "" },
          { id: "body", q: "Where did you feel it in your body?", ph: "Chest, jaw, mouth, a restless feeling…" },
          { id: "after", q: "What happened next, and how long did the pull last?", ph: "" },
        ],
      },
      experiment: { title: "Time it", body: "Next time you feel an urge (for anything: a drink, a snack, your phone), note the time and check again in ten minutes. Use the craving tool if it’s a drink. You’re collecting evidence about how long these things last for you." },
      tip: "The craving tool has a 90-second urge-surfing exercise. It’s there for exactly this.",
      evening: ["Did you notice an urge today? How long did it last?", "What did it feel like to watch it instead of obeying or fighting it?"],
      personal: (p) => (p.triggers && p.triggers.length) ? `Your most likely moments, from what you told us: ${listJoin(p.triggers.slice(0, 3).map(labelTrigger)).toLowerCase()}.` : "",
    },
    {
      n: 6, phase: "Awareness", title: "Wanting is not liking",
      kicker: "What dopamine is really doing.",
      intentions: ["Notice anticipation as its own feeling.", "Rate how much I enjoy, not just how much I want.", "Find one pleasure that delivers."],
      lesson: [
        "Dopamine is often called the pleasure chemical. That’s not quite right. Much of its job is anticipation and learning: it fires when we expect a reward, and especially when a reward is better than expected. It’s the signal that says ‘pay attention, go get that’.",
        "Alcohol does increase dopamine release in the brain’s reward circuitry. Over time, with repetition, the cues that predict a drink can start to trigger that ‘go get it’ signal by themselves. Some researchers argue that wanting can grow stronger with repeated use even when liking doesn’t, which helps explain why we can crave something we don’t particularly enjoy once we have it.",
        "This gives you a useful tool: rate them separately. How much do I want this? How much did I actually enjoy it? The gap between those numbers is information."
      ],
      pull: "The first sip often feels like the best one because the anticipation was the high.",
      evidence: "established", refs: ["schultz", "berridge", "boileau"],
      exercise: {
        type: "sliders", title: "Want versus enjoy",
        intro: "Think of your last few drinks. Be honest about the gap.",
        items: [
          { id: "want1", label: "How much I wanted the first drink" },
          { id: "like1", label: "How much I enjoyed the first drink" },
          { id: "want3", label: "How much I wanted the third drink" },
          { id: "like3", label: "How much I enjoyed the third drink" },
        ],
        left: "Barely", right: "Intensely",
      },
      experiment: { title: "Rate a pleasure", body: "Pick one alcohol-free pleasure today: good coffee, a swim, a meal, a song. Rate how much you want it before, and how much you enjoy it during. You’re training a new habit of noticing whether rewards deliver." },
      tip: "When a craving arrives, try asking: ‘is this wanting or liking?’ Just naming it can loosen the grip.",
      evening: ["What was your want-versus-enjoy gap for today’s pleasure?", "What did you notice about the gap for alcohol?"],
      personal: (p) => has(p.benefits, "reward") ? "You told us a drink often feels like a reward. Today is a good day to check how much of that reward is the wanting." : "",
    },
    {
      n: 7, phase: "Awareness", title: "Week one, looked at closely",
      kicker: "Your first week of data, in your own words.",
      intentions: ["Look at the week without judging it.", "Find one pattern.", "Rest."],
      lesson: [
        "A week is long enough to start seeing patterns and short enough that they’re still easy to miss. Today you’ll look back at what you recorded.",
        "Look for three things: when cravings appeared (time of day, place, feeling), what helped, and anything that surprised you. Surprises are the most valuable data in any experiment. They’re where your assumptions were wrong.",
        "If the week didn’t go to plan, that’s data too. You’re not starting again; you’re continuing with more information than you had seven days ago."
      ],
      pull: "Surprises are where your assumptions were wrong. That’s the gold.",
      evidence: "established", refs: ["harkin"],
      exercise: {
        type: "review", week: 1, title: "Your week one summary",
        intro: "Read your summary, then answer below.",
        prompts: [
          { id: "pattern", q: "One pattern I noticed:", ph: "" },
          { id: "surprise", q: "One thing that surprised me:", ph: "" },
          { id: "next", q: "One thing I’ll do differently in week two:", ph: "" },
        ],
      },
      experiment: { title: "A purely good hour", body: "Do something today with no purpose except enjoyment. Not productive, not improving. Just good. It’s part of the research: what feels good to you when alcohol isn’t the default?" },
      tip: "Rest is part of the experiment. Nothing to prove today.",
      evening: ["What did you do with your purely good hour?", "How would you describe week one to a friend, in one sentence?"],
    },
    {
      n: 8, phase: "Understanding", title: "The stress-relief paradox",
      kicker: "Why the thing that relieves stress can raise the baseline.",
      intentions: ["Meet stress with something that actually helps.", "Notice the rebound if it comes.", "Take a real break at my usual drinking time."],
      lesson: [
        "Alcohol does reduce the feeling of stress in the short term. One well-supported explanation is that it interferes with how we appraise threats, so the same problem feels less pressing.",
        "The body, though, likes balance. When a depressant is repeatedly present, the brain adjusts by turning up its own stress and arousal systems to compensate. When the alcohol wears off, those adjustments are still running. Researchers studying addiction describe this as a shifting baseline: over time, the relief from a drink can increasingly be relief from a state partly created by previous drinks.",
        "This is the paradox. A drink can genuinely ease tonight’s stress and still make tomorrow’s a little harder to bear. Many people notice their anxiety settles after a couple of alcohol-free weeks, though this varies and isn’t guaranteed.",
        "The aim isn’t to remove stress relief. It’s to find relief that doesn’t send a bill."
      ],
      pull: "Relief that sends a bill the next morning isn’t free relief.",
      evidence: "established", refs: ["sayette", "koob", "sinha"],
      exercise: {
        type: "prompts", title: "Trace a stressful evening",
        intro: "Pick a recent evening when you drank to take the edge off.",
        prompts: [
          { id: "before", q: "How stressed were you before (and what about)?", ph: "" },
          { id: "during", q: "How did you feel an hour after the first drink?", ph: "" },
          { id: "after", q: "How did you feel at 3am, or the next morning?", ph: "" },
          { id: "solved", q: "Did the original problem change at all?", ph: "" },
        ],
      },
      experiment: { title: "Ten minutes of decompression", body: "At the time you’d normally pour a drink, take ten minutes for something that lowers your stress without borrowing from tomorrow: a walk, a shower, slow breathing, lying on the floor with music. Rate your stress before and after (0–10)." },
      tip: "Slow breathing (in for 4, out for 6) is one of the best-studied quick ways to dial down arousal. It’s in the craving tool.",
      evening: ["What was your stress rating before and after the ten minutes?", "Have you noticed any change in your baseline stress since day one?"],
      personal: (p) => p.time ? `Your usual drinking window is ${labelTime(p.time)}. That’s when to run today’s experiment.` : "",
    },
    {
      n: 9, phase: "Understanding", title: "What happens to sleep",
      kicker: "Quicker to sleep, rougher through the night.",
      intentions: ["Pay attention to how I wake up.", "Protect my wind-down.", "Rate my sleep honestly."],
      lesson: [
        "Alcohol is one of the most widely used sleep aids in the world, and it does help many people nod off faster. Sleep research is consistent on that. It’s also consistent on what follows.",
        "As your body metabolises alcohol during the night, sleep tends to fragment. Dream (REM) sleep is suppressed early on, and there can be more waking in the second half of the night. A large Finnish study using heart-rate monitors found that even low to moderate amounts of alcohol changed markers of overnight recovery.",
        "Some people notice better sleep within days of stopping. Others find the first week or two unsettled before it improves. We don’t measure your physiology here, and we won’t promise outcomes. What you can do is watch your own nights. Your morning sleep ratings, over a few weeks, will tell you more than any average."
      ],
      pull: "Falling asleep and sleeping well are not the same thing.",
      evidence: "established", refs: ["ebrahim", "pietila"],
      exercise: {
        type: "chips", title: "Your sleep notes", multi: true,
        intro: "Since you started the experiment, have you noticed any of these?",
        options: ["Falling asleep takes longer", "Fewer 2–4am wake-ups", "More vivid dreams", "Waking more refreshed", "Waking earlier", "No change yet", "Sleep feels worse for now", "Less thirsty overnight"],
        followup: { q: "Anything else about your nights?", ph: "" },
      },
      experiment: { title: "A real wind-down", body: "Give yourself 30 minutes before bed with low light, no work and something calming. Rate your sleep in tomorrow’s morning check-in." },
      tip: "If sleep feels worse in the first fortnight, that’s common and usually temporary. If it doesn’t improve, it’s worth a chat with your GP.",
      evening: ["What did you do for your wind-down?", "If sleep has changed, how? If not, what do you notice instead?"],
      personal: (p) => has(p.benefits, "sleep") ? "You told us a drink helps you sleep. Your morning ratings over the next weeks are the real test." : "",
    },
    {
      n: 10, phase: "Understanding", title: "Looking closely at ‘it helps me relax’",
      kicker: "The belief most people hold most tightly.",
      intentions: ["Find three things that relax me.", "Notice what relaxation actually feels like.", "Rate the belief honestly."],
      lesson: [
        "Of all the beliefs about drinking, this one tends to be the strongest, and with reason. You’ve felt it work. A drink at the end of the day has delivered real relief, probably hundreds of times.",
        "So let’s be precise. What alcohol reliably delivers is sedation and a narrowing of attention, so worries feel further away. What it doesn’t deliver is resolution: the problem is still there, and as the drink wears off, the nervous system may swing the other way. One study of social drinkers found that people who were shyer tended to report more next-day anxiety after drinking, which some have nicknamed ‘hangxiety’. The research is early, but many people recognise the feeling.",
        "Relaxation that holds up usually has one of three ingredients: the body slowing down (movement, warmth, breath), the mind putting something down (finishing, writing, talking), or the setting changing (outside, a different room, different clothes)."
      ],
      pull: "Sedation and relaxation feel similar for about an hour.",
      evidence: "mixed", refs: ["sayette", "koob", "marsh"],
      exercise: {
        type: "list", title: "Your relaxation menu",
        intro: "List things that genuinely relax you, even a little. Aim for five. Include at least one for the body, one for the mind and one that changes the setting.",
        fields: [{ id: "item", label: "What", ph: "Bath with the door shut" }, { id: "time", label: "How long", ph: "20 min" }],
        min: 3,
        examples: ["Walk the dogs the long way", "Shower and change into soft clothes", "Write tomorrow’s to-do list, then close the notebook", "Lie on the floor with one album", "Garden for fifteen minutes", "Call someone who makes you laugh"],
      },
      experiment: { title: "Test two relaxers", body: "Try two items from your menu today. Rate your tension (0–10) before and after each. Then revisit the ‘relax’ belief in the library and re-rate it if anything has shifted." },
      tip: "Your relaxation menu is saved. You’ll find it in the craving tool when you need it.",
      evening: ["Which relaxer worked best, and by how much?", "Has your belief that alcohol helps you relax shifted at all? Which way?"],
      personal: (p) => has(p.benefits, "relax") ? "This was one of the reasons you gave for drinking. Today is yours." : "",
    },
    {
      n: 11, phase: "Understanding", title: "Who taught you to drink?",
      kicker: "Where your ideas about alcohol came from.",
      intentions: ["Notice drinking messages around me.", "Separate my views from ones I inherited.", "Remember the people who don’t drink."],
      lesson: [
        "Nobody arrives at adulthood with neutral views on alcohol. Most of us absorbed them early: from parents and their friends, from television, sport, advertising, the rituals of the 18th, the work Christmas party, the ‘you’ve earned it’ ads.",
        "Australia has a strong drinking culture, and it’s easy to believe everyone is drinking all the time. Yet around one in five Australian adults doesn’t drink at all, according to national figures. Research on ‘pluralistic ignorance’ found that students privately felt less comfortable with campus drinking norms than they assumed their peers did, and adjusted their own behaviour to fit a norm few actually held.",
        "None of this makes alcohol good or bad. It makes your relationship with it partly inherited, and inherited things can be reconsidered."
      ],
      pull: "Some of your beliefs about drinking were handed to you before you could choose them.",
      evidence: "established", refs: ["prentice", "nhmrc"],
      exercise: {
        type: "chips", title: "Where your views came from", multi: true,
        intro: "Which of these shaped your early ideas about alcohol?",
        options: ["Parents or family", "Friends at school or uni", "TV and film", "Sport and sponsorship", "Advertising", "Work culture", "Music", "Religion or community", "Social media", "Travel or living overseas"],
        followup: { q: "What’s one message about drinking you absorbed without choosing?", ph: "A real adult has a drink after work…" },
      },
      experiment: { title: "Spot the script", body: "Watch one show, film or ad break today with fresh eyes. Count how often alcohol appears and what it’s used to signal: celebration, stress, sophistication, connection, comedy." },
      tip: "Noticing a message is different from obeying it. You’re allowed to find it interesting.",
      evening: ["What did alcohol signal in what you watched today?", "Whose voice do you hear when you think about drinking?"],
    },
    {
      n: 12, phase: "Understanding", title: "Liquid courage",
      kicker: "Where confidence actually comes from.",
      intentions: ["Do one slightly brave thing sober.", "Notice the predicting voice.", "Let awkward be fine."],
      lesson: [
        "Alcohol has a narrowing effect on attention. Researchers called it ‘alcohol myopia’: the here-and-now becomes vivid and the background worries, including worries about how we’re coming across, fade. That can feel like confidence.",
        "But remember the placebo studies from day three. People who only believe they’ve been drinking often act more boldly too. Much of liquid courage is permission: a socially accepted reason to stop monitoring yourself so closely.",
        "You can give yourself that permission. It’s harder at first because the habit is ‘drink, then relax into it’. The first few sober social moments can feel exposed. Most people find that awkwardness fades with repetition, and that the confidence they build sober is more reliable because it shows up the next morning too."
      ],
      pull: "A lot of liquid courage is permission you could give yourself.",
      evidence: "established", refs: ["steele", "marlatt73", "begue"],
      exercise: {
        type: "prompts", title: "Confident without it",
        intro: "Evidence that the confidence is yours.",
        prompts: [
          { id: "time", q: "Describe a time you felt socially confident without a drink.", ph: "" },
          { id: "made", q: "What made that possible?", ph: "" },
          { id: "story", q: "What do you tell yourself about who you are after a drink, that you don’t believe sober?", ph: "" },
        ],
      },
      experiment: { title: "One small brave thing", body: "Do one socially slightly-uncomfortable thing sober today: start a conversation, say what you actually think, ask the question. Before, predict how it’ll go. After, write what actually happened." },
      tip: "Your predictions about social awkwardness are usually worse than reality. Keep score.",
      evening: ["What was your small brave thing? Prediction versus reality?", "Where did confidence come from today?"],
      personal: (p) => has(p.benefits, "confidence") ? "You said alcohol helps you feel confident. Today you’re collecting counter-evidence." : "",
    },
    {
      n: 13, phase: "Understanding", title: "Remembering a good night",
      kicker: "The night you remember and the night you had.",
      intentions: ["Remember a night honestly, start to finish.", "Notice the best moment of today.", "End today well."],
      lesson: [
        "Psychologists distinguish between the experiencing self, who lives through each moment, and the remembering self, who keeps the story. The remembering self is a selective editor. Studies of how people rate experiences suggest we judge them heavily by their peak moments and how they ended, and pay surprisingly little attention to how long the good or bad parts lasted.",
        "With drinking, the remembering self often keeps the highlights (the laughter, the first glass, the moment everyone was singing) and quietly edits out the slurred hour, the argument, the 2am kebab and the next morning. This isn’t lying to yourself. It’s how memory works.",
        "Today’s exercise is to play a recent drinking night forward, all the way to the end. Not to feel bad, but to see the whole film rather than the trailer."
      ],
      pull: "Memory keeps the trailer. Today, watch the whole film.",
      evidence: "established", refs: ["kahneman"],
      exercise: {
        type: "prompts", title: "Play the tape forward",
        intro: "Choose a recent night out or in. Walk through it in stages.",
        prompts: [
          { id: "t1", q: "The first drink. How did it feel?", ph: "" },
          { id: "t2", q: "Two hours in. What was happening?", ph: "" },
          { id: "t3", q: "The end of the night. How did it finish?", ph: "" },
          { id: "t4", q: "The next morning. How did you feel, and what did you do?", ph: "" },
          { id: "t5", q: "Which part do you usually remember when you think of nights like this?", ph: "" },
        ],
      },
      experiment: { title: "Notice the peak, shape the end", body: "Today, notice the best moment as it happens. Then end the day deliberately well: a good last hour, a proper goodnight. See how you remember today tomorrow." },
      tip: "‘Play the tape forward’ is also a quick craving tool. When you want a drink, imagine tonight and tomorrow morning in full.",
      evening: ["What was the best moment of today?", "How did you choose to end the day?"],
    },
    {
      n: 14, phase: "Challenging", title: "Halfway",
      kicker: "Fourteen days of evidence. What has it said?",
      intentions: ["Look at how far my beliefs have moved.", "Credit myself for showing up.", "Choose the focus of the second half."],
      lesson: [
        "Two weeks is a meaningful sample. You’ve now lived with less alcohol (or none) through two full weekends, probably a few hard days and at least one moment that tested you.",
        "Today you’ll re-rate the beliefs you scored on day one. Don’t try to give the ‘right’ answer. A belief that hasn’t moved is as interesting as one that has: it tells you where to point the second half of the experiment.",
        "It’s also worth noticing what has been easier than you expected. People are notoriously bad at predicting how future situations will feel. We overestimate how bad the hard things will be and how long they’ll last. Your actual data is a better guide than your forecasts."
      ],
      pull: "A belief that hasn’t moved is telling you where to look next.",
      evidence: "lens", refs: ["harkin"],
      exercise: { type: "beliefs", title: "Re-rate your beliefs", intro: "Rate each statement again, fresh. Your day-one score is shown faintly for comparison.", compare: true },
      experiment: { title: "Read your letter", body: "If you wrote a letter to your future self, it stays sealed until day 30. Instead, reread your reasons for change in ‘Future self’ and add one you’ve discovered since starting." },
      tip: "Halfway is a classic wobble point. If motivation dips, that’s normal. Look at what you’ve learned, not how far there is to go.",
      evening: ["Which belief moved most? Which didn’t move at all?", "What would you like to understand better by day 30?"],
    },
    {
      n: 15, phase: "Challenging", title: "Mapping your habit loop",
      kicker: "Cue, routine, reward. Keep two, change one.",
      intentions: ["Find my main cue.", "Keep the reward, swap the routine.", "Repeat the new version."],
      lesson: [
        "Habits are learned links between a context and an action. Researchers estimate that a large share of what we do each day, by some counts around four in ten actions, happens in the same place and at the same time, largely on autopilot.",
        "A useful way to see a drinking habit is in three parts. The cue: what sets it off (5:30pm, walking in the door, cooking, Friday). The routine: what you do (pour a glass). The reward: what you get (a feeling of transition, relief, treat, company).",
        "The most reliable way to change a habit isn’t to remove it but to keep the cue and the reward, and change the routine in the middle. The cue will keep firing for a while. Each time it’s met with the new routine, the old link weakens and the new one strengthens."
      ],
      pull: "Keep the cue. Keep the reward. Change what happens in between.",
      evidence: "established", refs: ["woodquinn", "woodneal", "woodrunger"],
      exercise: {
        type: "prompts", title: "Your loop",
        intro: "Map the drinking habit you’d most like to change.",
        prompts: [
          { id: "cue", q: "The cue (time, place, feeling, people):", ph: "Walking in the door after work" },
          { id: "routine", q: "The routine:", ph: "Open the fridge, pour a wine while cooking" },
          { id: "reward", q: "The reward I’m really after:", ph: "Feeling like the day is officially over" },
          { id: "swap", q: "A new routine that could deliver the same reward:", ph: "Change out of work clothes, pour a cold sparkling water with lime, put a record on" },
        ],
      },
      experiment: { title: "Run the new loop", body: "When your cue arrives today, run the new routine on purpose. Do it fully, even if it feels a bit staged. Repetition is the whole game here." },
      tip: "Expect the cue to keep firing for a while. That isn’t failure. It’s the old link taking time to fade.",
      evening: ["Did your cue show up? What happened when you ran the new routine?", "How close did the new routine get to the reward?"],
      personal: (p) => has(p.benefits, "switchoff") ? "You said a drink helps you switch off. The ‘switch’ is often the cue-and-reward part, which you can keep." : "",
    },
    {
      n: 16, phase: "Challenging", title: "Name it to tame it",
      kicker: "The feeling underneath the urge.",
      intentions: ["Name my feelings three times today.", "Look underneath one craving.", "Meet a need directly."],
      lesson: [
        "Many urges to drink aren’t really about alcohol. They’re about a feeling we want to change: tired, lonely, anxious, bored, flat, overwhelmed. Alcohol is a fast, general-purpose answer to many questions, which is part of why the habit forms.",
        "There’s an interesting finding from brain imaging: simply putting a feeling into words (‘I feel anxious’, ‘this is frustration’) is associated with reduced activity in the brain’s alarm centre. Naming the feeling doesn’t fix it, but it can create a sliver of space.",
        "Recovery communities have long used a shorthand, HALT: hungry, angry, lonely, tired. It’s a rule of thumb rather than a scientific model, but it’s a useful first check. Before treating an urge as a need for alcohol, ask whether it’s actually one of these, and whether there’s a more direct answer."
      ],
      pull: "Ask what the craving is trying to fix. Then fix that.",
      evidence: "mixed", refs: ["lieberman", "pennebaker"],
      exercise: {
        type: "chips", title: "What sits underneath", multi: true,
        intro: "When you’ve wanted a drink lately, which feelings were there?",
        options: ["Tired", "Stressed", "Anxious", "Lonely", "Bored", "Angry or frustrated", "Sad or flat", "Restless", "Celebratory", "Overwhelmed", "Hungry", "Left out"],
        followup: { q: "Pick the most common one. What would meet that need directly?", ph: "If it’s tired, it’s probably sleep, not wine…" },
      },
      experiment: { title: "Label three times", body: "Three times today, at random, stop and name what you’re feeling in a word or two. Note any time a feeling was followed by a pull towards a drink." },
      tip: "The craving tool asks ‘what do you actually need?’ That question is today’s lesson in one line.",
      evening: ["What feelings did you name today?", "Was there a moment where naming the feeling changed what you did?"],
      personal: (p) => (p.triggers && p.triggers.length) ? `From your onboarding, your common triggers include ${listJoin(p.triggers.slice(0, 3).map(labelTrigger)).toLowerCase()}. Which feeling usually sits underneath them?` : "",
    },
    {
      n: 17, phase: "Confidence", title: "If this, then that",
      kicker: "Deciding in advance, so you don’t have to decide in the moment.",
      intentions: ["Write three plans for my hardest moments.", "Use one plan today.", "Trust my earlier self."],
      lesson: [
        "One of the most robust findings in behaviour change research is deceptively simple. People who make specific ‘if–then’ plans (‘If it’s 5:30 and I’m cooking, then I’ll pour a ginger beer with lime’) are considerably more likely to follow through than people who simply intend to change. A large review of nearly a hundred studies found a medium-to-large effect.",
        "The reason it works is that it hands the decision to your automatic system ahead of time. When the moment arrives, you’re not negotiating; you’re following a plan your calmer self already made.",
        "The best plans are specific about the situation and the action, and they’re realistic. ‘If I’m stressed, I’ll meditate for an hour’ won’t survive contact with a Tuesday. ‘If I’m stressed, I’ll step outside for two minutes’ might."
      ],
      pull: "Decide once, calmly. Then let the moment follow the plan.",
      evidence: "established", refs: ["gollwitzer"],
      exercise: {
        type: "list", title: "Your if–then plans",
        intro: "Write plans for your three trickiest moments. Be specific.",
        fields: [{ id: "if", label: "If…", ph: "someone offers me a drink at Friday knock-offs" }, { id: "then", label: "Then I’ll…", ph: "say ‘I’m good with this, thanks’ and hold up my soda" }],
        min: 3,
        examples: [],
      },
      experiment: { title: "Use one plan", body: "Run at least one of your if–then plans today, even if the situation is mild. Notice how it feels to follow a decision you already made." },
      tip: "Your plans are saved and show up in the craving tool. Your past self has your back.",
      evening: ["Which plan did you use, and how did it go?", "Which plan needs adjusting?"],
    },
    {
      n: 18, phase: "Confidence", title: "Social situations, with a plan",
      kicker: "What to say, what to hold, when to leave.",
      intentions: ["Have a line ready.", "Hold something I enjoy.", "Leave when I want to."],
      lesson: [
        "Social events are where many alcohol-free experiments wobble. Not because the craving is strongest, but because of the questions: ‘Not drinking?’ ‘Are you pregnant?’ ‘Come on, just one.’",
        "Most people care far less than you expect. In studies of people who took a month off drinking, many reported that turning down drinks got easier with practice, and that confidence in refusing lasted well beyond the month. The first few times are the hardest.",
        "Three things help. A short, unapologetic line (you don’t owe a reason). Something in your hand that you actually like. And an exit plan: deciding beforehand when you’ll leave, so the end of the night is yours."
      ],
      pull: "‘No thanks’ is a complete sentence. You can add a smile if you like.",
      evidence: "established", refs: ["devisser", "prentice"],
      exercise: {
        type: "chips", title: "Choose your lines", multi: true,
        intro: "Pick a few that sound like you. Edit them below.",
        options: ["“I’m good with this, thanks.”", "“I’m doing a month off. Feeling great.”", "“I’m driving.”", "“I’ve got an early one tomorrow.”", "“Not tonight.”", "“I’m doing an experiment on myself. Ask me in thirty days.”", "“I’ll grab the next round of these.”"],
        followup: { q: "Write your own line, the way you’d actually say it:", ph: "" },
      },
      experiment: { title: "Order something you like", body: "Next time you’re out, order something alcohol-free that feels like a proper choice: a good ginger beer, a NA beer if that suits you, soda with fresh lime, a well-made mocktail. If no event is coming up, rehearse the order out loud." },
      tip: "If an event is coming up, open the craving tool beforehand and read your if–then plans.",
      evening: ["Which line felt most like you?", "Is there a social event ahead? What’s your plan, including when you’ll leave?"],
      personal: (p) => has(p.concerns, "social") || has(p.concerns, "work") || has(p.concerns, "holidays") ? "You said social situations worried you. This is the day built for that." : "",
    },
    {
      n: 19, phase: "Confidence", title: "Building a better reward",
      kicker: "If not a drink, then what?",
      intentions: ["Add one genuine reward to my evening.", "Spend on pleasure deliberately.", "Notice what delivers."],
      lesson: [
        "Remove a reward without replacing it and you leave a hole. Holes get filled, usually by the old habit. So this experiment needs new rewards, and they need to be genuinely rewarding, not virtuous substitutes you feel you ought to enjoy.",
        "Therapies that help people out of low mood often work by deliberately scheduling activities that bring pleasure or a sense of achievement, then noticing their effect. The same logic applies here. You’re building a menu of rewards and testing which ones actually deliver.",
        "Good rewards tend to share a few qualities: they’re immediate enough to compete with a drink, they feel like a treat rather than a chore, and they leave you no worse off tomorrow. Some of the best are sensory: taste, warmth, music, being outside."
      ],
      pull: "Don’t just remove a reward. Replace it with a better one.",
      evidence: "established", refs: ["martell", "berridge"],
      exercise: {
        type: "list", title: "Your reward menu",
        intro: "List rewards you’d genuinely look forward to. Mix small (five minutes) and bigger (an evening).",
        fields: [{ id: "item", label: "Reward", ph: "Takeaway from the good Thai place" }, { id: "size", label: "Small or big?", ph: "Big" }],
        min: 4,
        examples: ["A cold ginger beer with fresh lime in a heavy glass", "A long bath with the good stuff", "A new book, bought on purpose", "A massage, paid for with drink money", "Sunset at the beach with the dogs", "The fancy cheese, eaten slowly"],
      },
      experiment: { title: "Try one tonight", body: "Use one reward from your menu at your usual drinking time. Rate how much you wanted it, and how much you enjoyed it. Compare with your day-six numbers." },
      tip: "Use the money you’re not spending. Insights shows an estimate based on your own numbers.",
      evening: ["Which reward did you try? Want versus enjoy?", "What would you add to the menu now?"],
      personal: (p) => p.weeklySpend ? `Before starting, you estimated about $${Math.round(p.weeklySpend)} a week on alcohol. That’s a real budget for better rewards.` : "",
    },
    {
      n: 20, phase: "Confidence", title: "The long, empty evening",
      kicker: "Boredom, and what to do with the time you’ve got back.",
      intentions: ["Plan tonight before it arrives.", "Let boredom be interesting.", "Start something with my hands."],
      lesson: [
        "Many people find the hardest part of not drinking isn’t the big events. It’s ordinary weeknights: the stretch between dinner and bed that a few drinks used to fill. Boredom is one of the most commonly reported reasons for drinking, especially among younger people, and it rarely gets the attention stress does.",
        "Boredom is information. It says: I want more stimulation, meaning or connection than I have right now. Alcohol answers that by making the same evening feel more interesting. The alternative is to change the evening.",
        "That doesn’t mean filling every hour. It might mean one project you look forward to, one regular thing with someone else, and one way to properly rest. Many people rediscover old interests during a month off. Others find new ones. Some find that a quiet evening, once it stops feeling like something missing, is exactly what they wanted."
      ],
      pull: "Boredom is a signal that you want more from the evening. So give it more.",
      evidence: "emerging", refs: ["biolcati", "martell"],
      exercise: {
        type: "prompts", title: "Redesign one evening",
        intro: "Plan the evening that’s usually hardest.",
        prompts: [
          { id: "which", q: "Which evening is usually the longest?", ph: "Sunday" },
          { id: "start", q: "How will it start (the doorway)?", ph: "" },
          { id: "middle", q: "What will fill the middle?", ph: "" },
          { id: "end", q: "How will it end?", ph: "" },
          { id: "old", q: "Something you used to love doing that you could pick up again:", ph: "" },
        ],
      },
      experiment: { title: "Do the planned evening", body: "Run your redesigned evening tonight, or schedule it for the night it’s planned for. Afterwards, rate it out of 10." },
      tip: "Starting something with your hands (cooking, gardening, drawing, fixing) is a reliable way out of a restless mood.",
      evening: ["How did the redesigned evening go?", "What did you do with the time you’d usually spend drinking?"],
      personal: (p) => has(p.triggers, "boredom") ? "Boredom was one of the triggers you named. Today’s plan is your counter-move." : "",
    },
    {
      n: 21, phase: "Confidence", title: "Week three, looked at closely",
      kicker: "Your evidence so far, and what it’s saying.",
      intentions: ["Read my data kindly.", "Notice what’s getting easier.", "Pick one thing to practise in the final stretch."],
      lesson: [
        "Three weeks in, you have something most people never collect: a detailed record of how alcohol fits into your life, and what happens when it doesn’t.",
        "Look at your craving log. Are they less frequent, less intense, or easing faster? Look at your mood and sleep. Any shift is a pattern worth noticing, not proof of a cause. Life changes in many ways at once over three weeks.",
        "Also look at what hasn’t shifted. The final stretch is the best time to focus on the beliefs or situations that still feel strong."
      ],
      pull: "What’s getting easier is evidence. What isn’t is the next assignment.",
      evidence: "lens", refs: ["harkin"],
      exercise: {
        type: "review", week: 3, title: "Your week three summary",
        intro: "Read your summary, then answer below.",
        prompts: [
          { id: "easier", q: "What’s easier than it was on day one?", ph: "" },
          { id: "still", q: "What still feels hard?", ph: "" },
          { id: "focus", q: "One thing I’ll focus on in the final nine days:", ph: "" },
        ],
      },
      experiment: { title: "Tell someone what you’ve learned", body: "Share one genuine discovery from this experiment with someone you trust. Not a progress report, a discovery." },
      tip: "Looking back over the Journal timeline can be quietly powerful. Try it tonight.",
      evening: ["What did you share, and how did they respond?", "Describe the last three weeks in a sentence."],
    },
    {
      n: 22, phase: "Change", title: "Rediscovering enjoyment",
      kicker: "Pleasure, without the edit.",
      intentions: ["Savour something ordinary.", "Slow down for one minute.", "Tell someone about something good."],
      lesson: [
        "Some people worry that life without alcohol will be duller. It’s worth looking at that fear directly, because sometimes the opposite happens: pleasures that were blurred or rushed come back into focus.",
        "Psychologists who study ‘savouring’ describe it as the skill of noticing, appreciating and extending good experiences. It can be practised: slowing down, paying attention with the senses, sharing good things with others, and pausing to mark the moment. People who savour more tend to report higher wellbeing.",
        "Today is a savouring practice. One minute, fully with one good thing."
      ],
      pull: "Enjoyment is a skill. It gets better with attention.",
      evidence: "established", refs: ["bryant"],
      exercise: {
        type: "timer", seconds: 60, title: "One minute of savouring",
        intro: "Choose something in front of you: a cup of tea, the view, a piece of fruit, the feel of sun. Start the timer and give it your full attention.",
        prompts: [
          { id: "what", q: "What did you savour?", ph: "" },
          { id: "noticed", q: "What did you notice that you’d normally miss?", ph: "" },
        ],
      },
      experiment: { title: "Savour three things", body: "Find three moments today to savour deliberately, even for ten seconds each. Food, music, a conversation, a smell. Write them down tonight." },
      tip: "Sharing a good thing with someone tends to make it last longer. Tell someone about something you enjoyed today.",
      evening: ["What three things did you savour?", "What’s something you’ve enjoyed more this month than you expected?"],
    },
    {
      n: 23, phase: "Change", title: "What you’re noticing in yourself",
      kicker: "Your observations, not our promises.",
      intentions: ["Notice how I feel in the morning.", "Record changes without inflating them.", "Stay honest about what hasn’t changed."],
      lesson: [
        "Many wellness apps promise you’ll lose weight, glow, sleep like a baby and cure your anxiety in thirty days. We won’t. Bodies differ, three weeks is short, and plenty changes in a month besides drinking.",
        "What is well established: alcohol is a Group 1 carcinogen, it carries about seven calories per gram, and Australia’s national guidelines say the less you drink, the lower your risk of harm. Those are long-term risks, not things you can feel in a month.",
        "What you can do is notice. Some people report clearer mornings, more energy, steadier mood, better skin, less heartburn, more patience. Some notice little change. Some feel worse at first. All of those are valid results. Today, record what you’re actually observing, honestly and without exaggeration."
      ],
      pull: "Your observations are evidence. They don’t need to be dramatic to count.",
      evidence: "established", refs: ["iarc", "nhmrc"],
      exercise: {
        type: "chips", title: "What you’ve noticed", multi: true,
        intro: "Choose anything you’ve genuinely noticed since starting. Leave out anything you’re unsure about.",
        options: ["Clearer mornings", "More energy", "Better sleep", "Steadier mood", "Less anxiety", "More patience", "Better focus", "Less heartburn or reflux", "Changes in appetite", "More time", "More money", "Nothing much yet", "Some things feel harder"],
        followup: { q: "Describe one change in your own words, as precisely as you can:", ph: "" },
      },
      experiment: { title: "The morning audit", body: "Tomorrow morning, before your phone, take one minute: how does your head feel, your body, your mood? Write three words in your check-in notes." },
      tip: "If you have ongoing health concerns, your GP is the right person to talk to. This app doesn’t measure your health.",
      evening: ["What change surprised you most, if any?", "What hasn’t changed that you expected to?"],
    },
    {
      n: 24, phase: "Change", title: "Who you’re becoming",
      kicker: "Identity without labels.",
      intentions: ["Act as the person I want to be, once today.", "Notice what I do, not what I call myself.", "Avoid labels that don’t fit."],
      lesson: [
        "You don’t need to call yourself anything. You don’t need to be ‘sober’, ‘a non-drinker’ or anything else that doesn’t feel true. Labels can help some people and trap others.",
        "What’s interesting is how identity forms in the first place. One influential idea in psychology is that we partly work out who we are by watching what we do, much as we’d judge someone else. Act consistently enough in a certain way and you start to see yourself as ‘someone who…’. A few studies have found that framing behaviour as identity (‘be a voter’ rather than ‘vote’) increased follow-through, though later attempts to replicate this were mixed.",
        "So rather than declaring a new identity, gather evidence for one. Each choice is a small vote for the kind of person you’re becoming."
      ],
      pull: "You don’t need a label. Each choice is a small vote for who you are.",
      evidence: "mixed", refs: ["bem", "bryan"],
      exercise: {
        type: "prompts", title: "Someone who…",
        intro: "Complete these in ways that feel true, or true-in-progress.",
        prompts: [
          { id: "who1", q: "I’m someone who…", ph: "notices what she actually wants" },
          { id: "who2", q: "I’m becoming someone who…", ph: "" },
          { id: "evidence", q: "My evidence from this month:", ph: "" },
          { id: "label", q: "How do you feel about labels (sober, non-drinker, sober-curious, mindful drinker, none)?", ph: "" },
        ],
      },
      experiment: { title: "One vote", body: "Do one thing today purely because it’s what the person you’re becoming would do. Small is fine. Note it tonight." },
      tip: "If someone asks ‘so are you sober now?’, ‘I’m just seeing how I feel without it’ is a perfectly good answer.",
      evening: ["What was your vote today?", "What does ‘who you’re becoming’ look like, in one sentence?"],
    },
    {
      n: 25, phase: "Change", title: "When things don’t go to plan",
      kicker: "Lapses, the ‘what-the-hell’ effect, and why kindness works.",
      intentions: ["Speak to myself as I would to a friend.", "Write my plan for a wobble.", "Remember one drink is just data."],
      lesson: [
        "Researchers working on relapse noticed a pattern they called the ‘abstinence violation effect’: after a single slip, people often decided they’d failed entirely, felt worse about themselves, and drank more as a result. A one-off lapse became a full relapse because of what people told themselves about it.",
        "The opposite approach is treating a lapse as information. What happened? What was the situation? What did I need? What will I plan for next time? This is less about being soft and more about being accurate: one drink doesn’t erase twenty days of learning.",
        "There’s also evidence that self-compassion helps rather than hinders. In one study of people trying to manage eating, those encouraged to be kind to themselves after ‘breaking the rules’ actually ate less afterwards than those who weren’t. Self-criticism feels like accountability, but it often fuels the cycle."
      ],
      pull: "A lapse is a data point, not a verdict.",
      evidence: "established", refs: ["marlatt85", "adams"],
      exercise: {
        type: "prompts", title: "Your wobble plan",
        intro: "Write this now, while things are calm. You’ll find it in the app if you ever log a drink.",
        prompts: [
          { id: "say", q: "What I’ll say to myself if I drink when I didn’t plan to:", ph: "That happened. I’m curious what led to it." },
          { id: "ask", q: "The questions I’ll ask:", ph: "What was going on? What did I need?" },
          { id: "do", q: "What I’ll do the next day:", ph: "" },
          { id: "who", q: "Someone I could talk to:", ph: "" },
        ],
      },
      experiment: { title: "A kinder sentence", body: "Notice one moment today where you’re hard on yourself, about anything. Rewrite the sentence as if you were speaking to a friend you respect." },
      tip: "Logging a drink never resets your progress here. Your days, insights and discoveries all stay.",
      evening: ["What harsh sentence did you catch? How did you rewrite it?", "If you have drunk during this experiment, what did you learn from it?"],
    },
    {
      n: 26, phase: "Autonomy", title: "The people around you",
      kicker: "Telling people, asking for support, and holding your ground.",
      intentions: ["Be honest with one person.", "Ask for what I need.", "Let other people’s choices be theirs."],
      lesson: [
        "Your relationship with alcohol sits inside other relationships: with a partner who drinks, friends whose catch-ups centre on the pub, colleagues and family traditions. Changing your drinking can change those dynamics, which is often harder than the drinking itself.",
        "It helps to separate three things: what you’re doing (your choice), what you need (which you can ask for), and what others do (which is theirs). You can ask a partner not to pour you one without asking them to stop drinking. You can suggest a walk instead of the pub without making a speech.",
        "Strong social connection is one of the most reliable predictors of wellbeing and long life that researchers have found. The aim isn’t to pull away from people who drink. It’s to find ways of being close that don’t depend on it."
      ],
      pull: "You can change what’s in your glass without changing who you love.",
      evidence: "established", refs: ["holt"],
      exercise: {
        type: "prompts", title: "Your people",
        intro: "Think about who’s around you.",
        prompts: [
          { id: "support", q: "Who has been most supportive this month, and how?", ph: "" },
          { id: "tricky", q: "Which relationship is trickiest when it comes to drinking?", ph: "" },
          { id: "ask", q: "What could you ask for that would help?", ph: "Could we do a walk on Sundays instead of the pub?" },
          { id: "together", q: "A way to spend time with someone that doesn’t involve alcohol:", ph: "" },
        ],
      },
      experiment: { title: "One honest ask", body: "Ask one person for something that would help. Keep it small and specific. Notice how they respond." },
      tip: "If someone you live with is worried about their own drinking, Family Drug Support (1300 368 186) is there for families too.",
      evening: ["Who did you talk to, and how did it go?", "What would make the people side easier?"],
      personal: (p) => has(p.triggers, "partner") ? "You named a partner or housemate drinking as a trigger. Today is about asking for what you need without asking them to change." : "",
    },
    {
      n: 27, phase: "Autonomy", title: "The quiet gains",
      kicker: "Money, time and attention you’ve got back.",
      intentions: ["Spend something I’ve saved on purpose.", "Notice time I didn’t have before.", "Count what I’ve gained, not only what I’ve given up."],
      lesson: [
        "It’s easy to measure an experiment like this by what you’ve given up. It’s just as valid to measure what you’ve gained.",
        "Money is the easiest to see. Your Insights screen shows an estimate based on what you told us about your usual spending, compared with what you’ve logged. It’s an estimate, not an accounting, but it’s based on your numbers, not averages.",
        "Time is harder to count but often more valuable: hours that would have gone to drinking, feeling foggy or recovering. And attention: conversations you remember, mornings you were present for.",
        "Today, spend some of what you’ve gained, deliberately."
      ],
      pull: "Count the gains too. They’re quieter, but they’re real.",
      evidence: "lens", refs: [],
      exercise: {
        type: "prompts", title: "What you’ve gained",
        intro: "Your money estimate is shown above. Now the rest.",
        prompts: [
          { id: "money", q: "What would you like to do with the money?", ph: "" },
          { id: "time", q: "What have you done with time you’d have spent drinking or recovering?", ph: "" },
          { id: "attention", q: "Something you were present for that you might have missed:", ph: "" },
        ],
        showMoney: true,
      },
      experiment: { title: "Spend it on purpose", body: "Spend some of the money or time you’ve gained on something you’ll genuinely enjoy. Not a ‘sensible’ purchase, a chosen one." },
      tip: "Some people move their drink money into a separate account each week. It makes the gain visible.",
      evening: ["What did you spend your gains on?", "What gain surprised you most?"],
    },
    {
      n: 28, phase: "Autonomy", title: "The long view",
      kicker: "Why change takes longer than thirty days, and why that’s fine.",
      intentions: ["Think beyond day 30.", "Be patient with slow change.", "Notice what has become automatic."],
      lesson: [
        "There’s a popular idea that habits take 21 days to form. It isn’t supported. In a well-known study that tracked people building new daily habits, the median time to reach automaticity was about 66 days, with a huge range (from 18 to over 250 days) depending on the person and the habit.",
        "So thirty days won’t have rewired everything. What it can do is give you real information and a head start. Research following people who took part in a month-long break from alcohol found that many were still drinking less six months later, including some who didn’t complete the month, and that their confidence in refusing drinks had grown.",
        "Today, look at what’s already starting to feel automatic, and what still takes effort. Both are normal at this stage."
      ],
      pull: "Thirty days is a strong beginning, not a finished change.",
      evidence: "established", refs: ["lally", "devisser"],
      exercise: {
        type: "review", week: 4, title: "Your week four summary",
        intro: "Read your summary, then answer below.",
        prompts: [
          { id: "auto", q: "What has started to feel automatic?", ph: "" },
          { id: "effort", q: "What still takes effort?", ph: "" },
          { id: "protect", q: "What do you most want to protect beyond day 30?", ph: "" },
        ],
      },
      experiment: { title: "Picture day 60", body: "Spend two minutes imagining an ordinary Tuesday evening a month from now. Where are you? What are you drinking, if anything? How do you feel? Write a few lines in your journal." },
      tip: "You can extend the experiment from day 30. Nothing ends unless you want it to.",
      evening: ["What does an ordinary evening look like in a month’s time?", "What would make that easier to reach?"],
    },
    {
      n: 29, phase: "Autonomy", title: "Deciding what comes next",
      kicker: "Your choice, made with better information.",
      intentions: ["Make a decision, not a resolution.", "Base it on my own evidence.", "Remember I can change my mind."],
      lesson: [
        "Tomorrow the experiment closes. Today is for deciding what comes next, using everything you’ve learned rather than the beliefs you started with.",
        "There are no wrong answers. Some people decide to keep going alcohol-free. Some decide to drink occasionally, with clear personal rules. Some want more time before deciding. Research on motivation suggests that changes we choose for our own reasons tend to last longer than those imposed from outside, including by ourselves at our most self-critical.",
        "If you’re considering drinking again, Australia’s national guidelines are a useful reference: for healthy adults, no more than 10 standard drinks a week and no more than 4 on any one day, with the note that the less you drink, the lower the risk. If drinking in moderation has been hard before, take that seriously in your decision."
      ],
      pull: "Decide with the evidence you have now, not the beliefs you started with.",
      evidence: "established", refs: ["ryan", "nhmrc"],
      exercise: {
        type: "chips", title: "Leaning towards", multi: false,
        intro: "Which feels closest right now? You’ll make the final choice tomorrow.",
        options: ["Keep going alcohol-free", "Drink occasionally, with clear rules", "Extend the experiment before deciding", "Not sure yet"],
        followup: { q: "What evidence from this month points you that way?", ph: "" },
      },
      experiment: { title: "Write your rules (or reasons)", body: "Whatever you’re leaning towards, write it down specifically. If it’s occasional drinking: when, how much, with whom, and what you’ll skip. If it’s alcohol-free: what will keep it feeling like a choice." },
      tip: "Whatever you choose, you can revisit it. This is your call, not a contract.",
      evening: ["What are you leaning towards, and why?", "What would you want to remember if things get hard?"],
    },
    {
      n: 30, phase: "Autonomy", title: "Closing the experiment",
      kicker: "What you thought then. What you know now.",
      intentions: ["Look back honestly.", "Read my letter.", "Choose what’s next."],
      lesson: [
        "Thirty days ago you started an experiment with a set of beliefs, a reason, some hopes and some worries. Today you get to compare them with what actually happened.",
        "Whatever the result, you now know things about yourself and alcohol that you didn’t know before. That knowledge doesn’t expire. You can use it to keep going, to drink differently, or simply to choose with clearer eyes.",
        "Below is your before-and-after: your beliefs on day one beside your beliefs now, your hopes and how they played out, and the numbers from your own records. After that, your letter. Then it’s up to you."
      ],
      pull: "You came in with beliefs. You leave with evidence.",
      evidence: "lens", refs: [],
      exercise: { type: "final", title: "Then and now", intro: "Your experiment, start to finish." },
      experiment: { title: "Choose what’s next", body: "Choose your next step below: extend the experiment, set your own guidelines, or simply keep journaling. Then export your report so you have a record that’s yours." },
      tip: "You can keep using everything here: check-ins, the craving tool, your journal and insights.",
      evening: ["What is the single most important thing you learned?", "What would you say to yourself on day one?"],
    },
  ];

  /* Practice prompts for days beyond 30 */
  const PRACTICE = [
    "What did you notice about alcohol today, if anything?",
    "Where did you feel most like yourself today?",
    "What was today’s best moment?",
    "Was there a moment you would once have reached for a drink? What happened instead?",
    "What’s one belief about drinking you’ve stopped holding?",
    "What did your body tell you today?",
    "What are you looking forward to this week?",
    "What’s one thing you’re doing now that you weren’t doing two months ago?",
    "What’s one situation coming up that you want a plan for?",
    "What did you enjoy today, slowly?",
    "Who did you connect with today?",
    "What would you tell someone on their first day of an experiment like this?",
  ];

  const TRIGGERS = [
    ["stress", "Stress"], ["endofwork", "End of the workday"], ["cooking", "Cooking dinner"], ["friday", "Friday and weekends"], ["friends", "Being with friends"], ["partner", "A partner or housemate drinking"], ["boredom", "Boredom"], ["lonely", "Loneliness"], ["celebration", "Celebrations"], ["sport", "Watching sport"], ["dining", "Restaurants and bars"], ["anxiety", "Anxiety"], ["tired", "Tiredness"], ["conflict", "Arguments or conflict"],
  ];
  const BENEFITS = [
    ["relax", "Relaxing"], ["confidence", "Confidence"], ["social", "More fun socially"], ["switchoff", "Switching off"], ["reward", "A reward"], ["sleep", "Helping me sleep"], ["taste", "The taste"], ["celebrate", "Celebrating"], ["boredom", "Something to do"], ["connection", "Feeling connected"], ["creativity", "Creativity"],
  ];
  const CONCERNS = [
    ["social", "Social events"], ["work", "Work functions"], ["holidays", "The holiday season"], ["stress", "Getting through stressful days"], ["partner", "People I live with"], ["boredom", "Boredom"], ["sleep", "Sleep"], ["fomo", "Missing out"], ["selfdoubt", "Not following through"],
  ];
  const MOTIVATIONS = [
    ["curious", "I’m curious what it’s like"], ["health", "My health"], ["sleep", "Better sleep"], ["energy", "More energy"], ["mood", "My mood or anxiety"], ["control", "Feeling more in control"], ["money", "Money"], ["family", "My family or relationships"], ["work", "Work and focus"], ["habit", "It’s become a habit I didn’t choose"],
  ];
  const HOPES = [
    ["sleep", "Sleep better"], ["energy", "More energy"], ["mornings", "Clearer mornings"], ["mood", "Steadier mood"], ["money", "Save money"], ["control", "Feel in control"], ["understand", "Understand myself better"], ["confidence", "Feel confident without it"], ["choice", "Make a clear choice about drinking"],
  ];
  const TIMES = [
    ["afterwork", "after work"], ["dinner", "with dinner"], ["late", "later in the evening"], ["weekends", "mostly on weekends"], ["social", "mostly when I’m out"], ["varies", "at different times"],
  ];

  /* Craving support */
  const SENSATIONS = ["Tight chest", "Restless", "Dry mouth or thirsty", "Stomach", "Tense jaw or shoulders", "Buzzy or anxious", "Flat or tired", "Racing thoughts", "Picturing the drink", "Nothing physical"];
  const NEEDS = [
    { id: "rest", label: "Rest", hint: "I’m tired", alts: ["Lie down for ten minutes, legs up the wall", "Shower and pyjamas: call the day finished", "An early night, no negotiation"] },
    { id: "relief", label: "Relief", hint: "I’m stressed or anxious", alts: ["Walk around the block, phone in your pocket", "Write the worry down, and one thing you’ll do about it tomorrow", "Slow breathing: in for 4, out for 6, ten rounds"] },
    { id: "connection", label: "Connection", hint: "I’m lonely or left out", alts: ["Message someone a real question, not ‘how are you’", "Call someone while you walk", "Go where people are: the shops, the park, a café"] },
    { id: "reward", label: "Reward", hint: "I’ve earned something", alts: ["Make something special to drink in your best glass", "Use one item from your reward menu", "Order the good takeaway with drink money"] },
    { id: "transition", label: "A doorway", hint: "I need the day to be over", alts: ["Change clothes, change rooms", "Step outside for five minutes", "Put one particular song on, loud"] },
    { id: "stimulation", label: "Something to do", hint: "I’m bored or restless", alts: ["Start something with your hands: cook, garden, sketch, fix", "Ten-minute tidy with music", "Leave the house for half an hour"] },
    { id: "comfort", label: "Comfort", hint: "I’m sad or flat", alts: ["Something warm: tea, a blanket, a familiar film", "Let it be sad for ten minutes with a timer", "Text someone ‘rough day, can you call?’"] },
    { id: "celebration", label: "Celebration", hint: "Something good happened", alts: ["Tell someone the good news out loud", "Mark it with a meal, a photo or a plan", "Buy flowers for yourself, seriously"] },
    { id: "ritual", label: "The ritual", hint: "It’s just the time or place", alts: ["Do the ritual, change the liquid", "Do it somewhere different tonight", "Use your if–then plan"] },
  ];
  const SURF_CUES = [
    "Breathe in slowly…",
    "Notice where the urge sits in your body.",
    "Is it rising, peaking or easing?",
    "You don’t have to do anything with it.",
    "Watch it like a wave. Let it pass under you.",
    "Name it: ‘this is wanting’.",
    "Soften your jaw and shoulders.",
    "Still here. Still breathing. That’s enough.",
  ];
  const DRINK_IDEAS = ["Soda water with fresh lime and mint", "Ginger beer with lime in a heavy glass", "Iced tea with orange slices", "Kombucha (note: can contain traces of alcohol)", "A well-made non-alcoholic beer or wine, if that suits you", "Tonic with cucumber and lots of ice", "Hot chocolate or a chai on cold nights", "Sparkling water with a splash of cranberry"];
  const LINES = ["“I’m good with this, thanks.”", "“Not tonight.”", "“I’m doing a month off.”", "“I’m driving.”", "“I’ll get the next round of these.”"];

  const RESOURCES = [
    { name: "Emergency", detail: "If you or someone else is in immediate danger", tel: "000", hours: "24/7" },
    { name: "National Alcohol and Other Drug Hotline", detail: "Free, confidential advice. Connects you to your state’s service.", tel: "1800 250 015", hours: "24/7" },
    { name: "Lifeline", detail: "Crisis support and suicide prevention", tel: "13 11 14", hours: "24/7" },
    { name: "Alcohol and Drug Support Line (WA)", detail: "Counselling and referral for Western Australians. Country callers 1800 198 024.", tel: "(08) 9442 5000", hours: "24/7" },
    { name: "DirectLine (VIC)", detail: "Alcohol and drug counselling and referral in Victoria", tel: "1800 888 236", hours: "24/7" },
    { name: "Family Drug Support", detail: "For families and friends of someone who drinks", tel: "1300 368 186", hours: "24/7" },
    { name: "13YARN", detail: "Crisis support by and for Aboriginal and Torres Strait Islander people", tel: "13 92 76", hours: "24/7" },
    { name: "Beyond Blue", detail: "Anxiety and depression support", tel: "1300 22 4636", hours: "24/7" },
    { name: "Counselling Online", detail: "Free text-based alcohol and drug counselling", url: "https://www.counsellingonline.org.au", hours: "24/7" },
    { name: "Your GP", detail: "The right first step if you drink heavily or daily, have had withdrawal symptoms, are pregnant or take medication.", hours: "" },
  ];

  /* helpers used inside personal() strings */
  function labelFrom(list, id) { const f = list.find((x) => x[0] === id); return f ? f[1] : id; }
  function labelTrigger(id) { return labelFrom(TRIGGERS, id); }
  function labelConcern(id) { return labelFrom(CONCERNS, id); }
  function labelTime(id) { return labelFrom(TIMES, id); }
  function listJoin(a) { return a.length < 2 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }

  window.CONTENT = { REFS, EVIDENCE, BELIEFS, DAYS, PHASES, PRACTICE, TRIGGERS, BENEFITS, CONCERNS, MOTIVATIONS, HOPES, TIMES, SENSATIONS, NEEDS, SURF_CUES, DRINK_IDEAS, LINES, RESOURCES, labelFrom, listJoin };
})();
