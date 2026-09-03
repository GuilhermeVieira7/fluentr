/* FLUENTR — English SOS packs ("I need English now")
   Structured, offline "survival kits" for a real situation about to happen.
   Most packs share a schema: essential phrases, a 3-question warm-up, and
   a checklist of things that might come up. The Interview pack is richer
   (category -> question -> structure -> example), matching the SOS
   Interview spec closely. */

window.WL_DATA = window.WL_DATA || {};
window.WL_DATA.sos = {

  packs: [
    {
      id: 'meeting', title: 'Meeting', icon: 'users',
      essentialPhrases: [
        { phrase: 'Just to clarify...', meaning: 'só para esclarecer...' },
        { phrase: 'From my side...', meaning: 'da minha parte...' },
        { phrase: "I'll look into it.", meaning: 'vou verificar isso.' },
        { phrase: 'Could you elaborate on that?', meaning: 'você pode detalhar mais isso?' },
        { phrase: 'That makes sense.', meaning: 'faz sentido.' },
        { phrase: "I'll keep you updated.", meaning: 'vou manter você atualizado.' }
      ],
      warmup: [
        { question: 'Your manager asks for an update. Best opener?', options: ['Things happened.', "Sure — here's where things stand.", 'I do not know exactly.'], answer: 1, explanation: '"Here\'s where things stand" is a natural, confident way to begin an update.' },
        { question: 'You want to check you understood correctly. Best phrase?', options: ['Is right?', 'Just to make sure I understood correctly...', 'You say what?'], answer: 1, explanation: 'This is one of the most useful confirmation phrases in professional English.' },
        { question: 'Someone asks if you have blockers. You do. Best response?', options: ['No.', "Yes, actually — I'm waiting on approval from the design team.", 'Blocker, yes, problem.'], answer: 1, explanation: 'Naming the specific blocker helps the team actually help you.' }
      ],
      possibleQuestions: ['What are you working on?', 'Any blockers?', 'What are the next steps?', 'Do you need help from anyone?']
    },
    {
      id: 'presentation', title: 'Presentation', icon: 'monitor',
      essentialPhrases: [
        { phrase: "I'd like to walk you through...", meaning: 'gostaria de apresentar/explicar...' },
        { phrase: "Let's move on to the next slide.", meaning: 'vamos para o próximo slide.' },
        { phrase: 'As you can see here...', meaning: 'como podem ver aqui...' },
        { phrase: "I'll pause here for questions.", meaning: 'vou parar aqui para perguntas.' },
        { phrase: 'To sum up...', meaning: 'resumindo...' },
        { phrase: 'Thanks for your attention.', meaning: 'obrigado pela atenção.' }
      ],
      warmup: [
        { question: 'How do you open a presentation naturally?', options: ['Today I will talk you about...', "Today, I'd like to walk you through...", 'This presentation is starting now.'], answer: 1, explanation: '"I\'d like to walk you through..." is the natural, professional opener.' },
        { question: 'How do you invite questions at the end?', options: ['Now you can ask me things.', "I'll pause here for any questions.", 'Questions if exist say now.'], answer: 1, explanation: 'A smooth, natural way to open the floor for questions.' },
        { question: 'How do you transition between slides?', options: ["Let's move on to the next slide.", 'Slide change now.', 'Next, going.'], answer: 0, explanation: '"Move on to" is the standard phrasal verb for a presentation transition.' }
      ],
      possibleQuestions: ['Can you go back one slide?', 'What data supports this?', 'What are the next steps?', 'How does this compare to last quarter?']
    },
    {
      id: 'customer-call', title: 'Customer Call', icon: 'phone',
      essentialPhrases: [
        { phrase: 'How can I help you today?', meaning: 'como posso te ajudar hoje?' },
        { phrase: 'I completely understand the frustration.', meaning: 'eu entendo totalmente a frustração.' },
        { phrase: "Let me look into that for you.", meaning: 'deixa eu verificar isso para você.' },
        { phrase: 'I appreciate your patience.', meaning: 'agradeço sua paciência.' },
        { phrase: 'Is there anything else I can help with?', meaning: 'tem mais alguma coisa que eu possa ajudar?' }
      ],
      warmup: [
        { question: 'A customer is upset. What should you say first?', options: ['Calm down.', 'I completely understand the frustration — let me help.', 'That is not our fault.'], answer: 1, explanation: 'Acknowledging the emotion first is key to de-escalating a frustrated customer.' },
        { question: 'You need more time to investigate. Best phrase?', options: ['Wait.', "Let me look into this and I'll get back to you shortly.", 'I do not know, bye.'], answer: 1, explanation: 'This sets a clear, professional expectation for follow-up.' },
        { question: 'How do you close the call politely?', options: ['Bye.', 'Is there anything else I can help with today?', 'Call over now.'], answer: 1, explanation: 'A standard, warm way to check if the customer needs anything else before ending the call.' }
      ],
      possibleQuestions: ['Can you walk me through the issue?', 'When did this start happening?', 'Have you tried restarting?', 'Can I follow up by email?']
    },
    {
      id: 'message', title: 'Message', icon: 'message',
      essentialPhrases: [
        { phrase: 'Quick question when you have a sec.', meaning: 'pergunta rápida quando tiver um segundo.' },
        { phrase: 'No rush, just following up.', meaning: 'sem pressa, só dando um retorno/cobrança.' },
        { phrase: "I'll take a look now.", meaning: 'vou dar uma olhada agora.' },
        { phrase: 'Sounds good!', meaning: 'combinado! / parece bom!' },
        { phrase: 'Sorry for the late reply.', meaning: 'desculpa a demora para responder.' }
      ],
      warmup: [
        { question: 'You need a quick answer without being pushy. Best opener?', options: ['ANSWER NOW.', 'Quick question when you have a sec —', 'Why nobody answer?'], answer: 1, explanation: 'Casual and respectful — the right tone for chat messages between colleagues.' },
        { question: 'How do you confirm you\'ll do something quickly?', options: ["Sure, I'll take a look now.", 'Ok I do.', 'Yes doing.'], answer: 0, explanation: 'Short, natural, and confirms the action clearly.' },
        { question: 'How do you check on a pending item without pressure?', options: ['Where is it?!', 'No rush, just following up on this.', 'You forgot?'], answer: 1, explanation: '"No rush" softens the check-in and keeps it friendly.' }
      ],
      possibleQuestions: ['Can you take a look when you get a chance?', 'Any update on this?', 'Does this work for you?', 'Let me know if you have questions.']
    },
    {
      id: 'email', title: 'Email', icon: 'mail',
      essentialPhrases: [
        { phrase: 'I hope this email finds you well.', meaning: 'espero que esteja tudo bem com você.' },
        { phrase: 'Please find attached...', meaning: 'segue em anexo...' },
        { phrase: 'Looking forward to hearing from you.', meaning: 'aguardo seu retorno.' },
        { phrase: 'Please let me know if you have any questions.', meaning: 'me avise se tiver alguma dúvida.' },
        { phrase: 'Best regards,', meaning: 'atenciosamente,' }
      ],
      warmup: [
        { question: 'Best way to open an email to someone you don\'t know well?', options: ['Hey!', 'Hi [Name], I hope this email finds you well.', 'To whoever reads this,'], answer: 1, explanation: 'A friendly-professional opening that works for most business contexts.' },
        { question: 'How do you share a file?', options: ['Please find attached the report.', 'The report is going with this email.', 'File is here take it.'], answer: 0, explanation: '"Please find attached" is the standard business-email phrase.' },
        { question: 'How do you close professionally, expecting a reply?', options: ['Bye.', 'Looking forward to hearing from you.', 'Answer me soon.'], answer: 1, explanation: 'A standard, polite closing line before signing off.' }
      ],
      possibleQuestions: ['Could you confirm receipt?', 'When would be convenient for a call?', 'Do you need any more information?', 'Would Thursday work for you?']
    },
    {
      id: 'difficult-conversation', title: 'Difficult Conversation', icon: 'alert',
      essentialPhrases: [
        { phrase: 'I see your point, but...', meaning: 'entendo seu ponto, mas...' },
        { phrase: 'Can we find a middle ground?', meaning: 'podemos encontrar um meio-termo?' },
        { phrase: "I want to understand your perspective.", meaning: 'quero entender seu ponto de vista.' },
        { phrase: "Let's take a step back.", meaning: 'vamos dar um passo atrás.' },
        { phrase: 'I appreciate you being direct with me.', meaning: 'agradeço por ser direto comigo.' }
      ],
      warmup: [
        { question: 'You disagree but want to stay respectful. Best opener?', options: ["That's wrong.", 'I see your point, but I have a different take.', 'No.'], answer: 1, explanation: 'Acknowledging their view first keeps disagreement constructive.' },
        { question: 'The conversation is getting tense. What can you say?', options: ["Let's take a step back for a second.", 'Stop talking.', 'This is going bad.'], answer: 0, explanation: 'A calm, natural way to de-escalate and reset the tone.' },
        { question: 'You want to propose a compromise. Best phrase?', options: ['Do what I say.', 'Can we find a middle ground here?', 'You decide only.'], answer: 1, explanation: '"Middle ground" is the natural idiom for compromise.' }
      ],
      possibleQuestions: ['Can you help me understand why?', 'What would work better for you?', 'Where do we agree?', 'Can we revisit this tomorrow?']
    },
    {
      id: 'technical-incident', title: 'Technical Incident', icon: 'terminal',
      essentialPhrases: [
        { phrase: "We're currently experiencing an issue with...", meaning: 'estamos enfrentando um problema com...' },
        { phrase: "We're actively investigating.", meaning: 'estamos investigando ativamente.' },
        { phrase: 'A fix has been identified and is being deployed.', meaning: 'uma correção foi identificada e está sendo implantada.' },
        { phrase: "We'll share an update within the hour.", meaning: 'vamos compartilhar uma atualização dentro de uma hora.' },
        { phrase: 'The issue has been resolved.', meaning: 'o problema foi resolvido.' }
      ],
      warmup: [
        { question: 'How do you open an incident announcement?', options: ['Something bad happen.', "We're currently experiencing an issue with the payment service.", 'System broke, sorry.'], answer: 1, explanation: 'Clear, calm, and specific — the standard way to open incident communication.' },
        { question: 'How do you set expectations for the next update?', options: ["We'll share an update within the hour.", 'Update maybe soon.', 'Do not ask again.'], answer: 0, explanation: 'A specific time commitment builds trust during an incident.' },
        { question: 'How do you announce resolution?', options: ['Fixed.', 'The issue has been resolved. Thanks for your patience.', 'No more problem now ok.'], answer: 1, explanation: 'Clear closure plus appreciation is the professional standard for incident updates.' }
      ],
      possibleQuestions: ['What was the root cause?', 'How many users were affected?', 'When will this be fully resolved?', 'What are we doing to prevent this?']
    },
    {
      id: 'small-talk', title: 'Small Talk', icon: 'chat',
      essentialPhrases: [
        { phrase: "How's it going?", meaning: 'como vai?' },
        { phrase: 'Any plans for the weekend?', meaning: 'algum plano para o fim de semana?' },
        { phrase: "It's been a busy week.", meaning: 'foi uma semana corrida.' },
        { phrase: "That sounds fun!", meaning: 'isso parece divertido!' },
        { phrase: 'Nice catching up with you.', meaning: 'foi bom colocar o papo em dia.' }
      ],
      warmup: [
        { question: 'Someone asks about your weekend. Natural reply?', options: ['It was good, thanks! Mostly relaxed. You?', 'Weekend was positive in general.', 'I do not discuss this.'], answer: 0, explanation: 'A short, friendly answer that returns the question — the small-talk pattern.' },
        { question: 'How do you start a friendly greeting with a colleague?', options: ['How is your health today?', "Hey, how's it going?", 'State your wellbeing.'], answer: 1, explanation: 'Casual and natural — perfect for daily workplace greetings.' },
        { question: 'How do you close small talk politely?', options: ['Bye.', "Anyway, nice catching up — talk soon!", 'Conversation over.'], answer: 1, explanation: 'A warm, natural way to wrap up a casual chat.' }
      ],
      possibleQuestions: ['How was your weekend?', 'Busy week?', 'Have you tried the new place downtown?', 'How\'s the new project going?']
    }
  ],

  interview: {
    categories: [
      {
        id: 'general', name: 'General',
        questions: [
          { q: 'Tell me about yourself.', structure: 'Present role → past experience → key strength → what you\'re looking for now.', example: "I'm currently working in IT support with a growing focus on infrastructure. Before that, I built a solid foundation in networking. I'm known for staying calm under pressure, and I'm now looking for a role with more hands-on infrastructure work." },
          { q: 'Why do you want to work here?', structure: 'Something specific you learned about them → how it connects to your goals.', example: "I've noticed your team invests heavily in automation, which matches how I like to work — I think I'd grow the fastest in that kind of environment." },
          { q: 'What are your strengths?', structure: 'Name it → quick example → connect to the role.', example: "One of my strengths is staying calm under pressure — during a major outage, I followed our checklist methodically, which helped us recover quickly." },
          { q: 'What is your biggest weakness?', structure: 'Real but not disqualifying → show self-awareness → the action you\'re taking.', example: "I used to avoid presenting to groups. I've been actively working on it by volunteering for small team updates, and it's gotten much easier." }
        ]
      },
      {
        id: 'technology', name: 'Technology',
        questions: [
          { q: 'How do you stay updated with new technologies?', structure: 'Name specific habits → a recent example.', example: "I follow a couple of technical newsletters and try to build small hands-on projects with anything new — recently I've been studying cloud networking this way." },
          { q: 'Describe a technical problem you solved.', structure: 'Situation → your diagnostic steps → result.', example: "We had intermittent connectivity affecting only some users. I isolated the pattern through logs and found a specific switch port flapping — replacing the cable fixed it permanently." },
          { q: 'How would you explain a technical concept to a non-technical person?', structure: 'Simple definition → an everyday analogy.', example: "DNS is like a phonebook for the internet — it translates easy-to-remember names into the numeric address computers use to connect." }
        ]
      },
      {
        id: 'infrastructure-cloud', name: 'Infrastructure & Cloud',
        questions: [
          { q: 'How would you troubleshoot a server that suddenly became unreachable?', structure: 'Check the basics first → narrow down layer by layer → verify the fix.', example: "I'd start by checking if it responds to a ping, then check the network path, then check if key services are running — reviewing logs at each step." },
          { q: 'What factors matter when choosing a cloud region?', structure: 'List factors → briefly justify each.', example: "I'd consider proximity to users for latency, any data residency requirements, and cost differences between regions." },
          { q: 'Explain the shared responsibility model.', structure: 'Simple definition → analogy → why it matters.', example: "It's like renting an apartment: the building owner secures the structure, but you're responsible for locking your own door." }
        ]
      },
      {
        id: 'support', name: 'Support',
        questions: [
          { q: 'A user says their computer is very slow. How do you begin?', structure: 'Clarify symptoms → check resources → isolate the cause.', example: "I'd ask when it started and if anything changed recently, then check CPU, memory and disk usage before making any changes." },
          { q: 'How do you handle a frustrated user?', structure: 'Acknowledge the emotion → reassure → act.', example: "I always acknowledge the frustration first, let them know I'm on it, and then focus on resolving the issue quickly." },
          { q: 'Describe your approach to documenting your work.', structure: 'When/why you document → what you include → the benefit.', example: "I document as I go, especially the 'why' behind a decision — it saves time for whoever touches it next, including future me." }
        ]
      }
    ]
  }
};
