/* FLUENTR — Placement test bank (~20 questions across 4 categories that
   map directly to the product's pillars, plus an overall CEFR estimate). */

window.WL_DATA = window.WL_DATA || {};
window.WL_DATA.placement = [
  // Professional English
  { id: 'pl-01', category: 'Professional', level: 'A2', question: 'Which is correct for a company name?', options: ['I work in Microsoft.', 'I work at Microsoft.'], answer: 1 },
  { id: 'pl-02', category: 'Professional', level: 'B1', question: 'Manager: "Could you give us a quick update?" Best reply?', options: ['Things happened.', "Sure — here's where things stand."], answer: 1 },
  { id: 'pl-03', category: 'Professional', level: 'B1', question: 'What does "on track" mean?', options: ['Delayed', 'Progressing as planned'], answer: 1 },
  { id: 'pl-04', category: 'Professional', level: 'B2', question: 'Most professional way to ask for more time?', options: ['I need more time.', 'Would it be possible to extend the deadline?'], answer: 1 },
  { id: 'pl-05', category: 'Professional', level: 'B2', question: 'Best way to disagree politely?', options: ["That's wrong.", 'I see your point, but I have a different take.'], answer: 1 },

  // Natural English (Brazilian traps / idioms)
  { id: 'pl-06', category: 'Natural', level: 'A2', question: 'Which is correct?', options: ['I have a doubt.', 'I have a question.'], answer: 1 },
  { id: 'pl-07', category: 'Natural', level: 'B1', question: 'Which is correct?', options: ['I will return to you.', "I'll get back to you."], answer: 1 },
  { id: 'pl-08', category: 'Natural', level: 'B1', question: 'Which is correct?', options: ['I am agree with this.', 'I agree with this.'], answer: 1 },
  { id: 'pl-09', category: 'Natural', level: 'B2', question: 'Which is correct?', options: ['I am very exciting about this.', 'I am very excited about this.'], answer: 1 },
  { id: 'pl-10', category: 'Natural', level: 'A2', question: 'Which is correct for age?', options: ['I have 30 years.', "I'm 30 years old."], answer: 1 },

  // Writing
  { id: 'pl-11', category: 'Writing', level: 'B1', question: 'Best email opener to someone you don\'t know well?', options: ['Hey!', 'Hi [Name], I hope this email finds you well.'], answer: 1 },
  { id: 'pl-12', category: 'Writing', level: 'B1', question: 'How do you share an attachment?', options: ['File is here take it.', 'Please find attached the report.'], answer: 1 },
  { id: 'pl-13', category: 'Writing', level: 'B2', question: 'Which fixes: "I don\'t finished the task"?', options: ["I didn't finish the task", "I not finished the task"], answer: 0 },
  { id: 'pl-14', category: 'Writing', level: 'B2', question: 'Which is a more natural closing line?', options: ['Answer soon ok.', 'Looking forward to hearing from you.'], answer: 1 },

  // Technical
  { id: 'pl-15', category: 'Technical', level: 'A2', question: '"My VPN isn\'t working." Best first response?', options: ['Restart.', 'Could you tell me what error message you\'re seeing?'], answer: 1 },
  { id: 'pl-16', category: 'Technical', level: 'B1', question: 'How do you announce a service outage?', options: ['System broke.', "We're currently experiencing a service outage."], answer: 1 },
  { id: 'pl-17', category: 'Technical', level: 'B1', question: 'What does "downtime" mean?', options: ['Free time', 'Time a system is unavailable'], answer: 1 },
  { id: 'pl-18', category: 'Technical', level: 'B2', question: 'What does "escalate a ticket" mean?', options: ['Delete it', 'Pass it to a higher support level'], answer: 1 },

  // Mixed / reading
  { id: 'pl-19', category: 'Professional', level: 'B1', question: 'What does "circle back" mean?', options: ['Give up on a topic', 'Return to a topic later'], answer: 1 },
  { id: 'pl-20', category: 'Natural', level: 'B2', question: 'Which is correct?', options: ["I'm used to work under pressure.", "I'm used to working under pressure."], answer: 1 }
];
