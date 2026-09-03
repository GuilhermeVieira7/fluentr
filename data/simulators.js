/* FLUENTR — Structured simulators (Meeting / Interview).
   No AI yet — a fixed, well-designed sequence of prompts with multiple-choice
   "best response" steps, closing with a recap of key phrases learned. */

window.WL_DATA = window.WL_DATA || {};
window.WL_DATA.simulators = {
  'sim-weekly-meeting': {
    id: 'sim-weekly-meeting', title: 'Weekly Meeting', role: 'Manager',
    intro: "You're giving your weekly project update.",
    steps: [
      { speaker: 'Manager', line: "Good morning! Could you give us a quick update on your progress?", options: ["Yesterday, I worked on resolving the infrastructure issue and followed up on two tickets. Overall, we're on track.", "I did stuff.", "Nothing to report, sorry."], answer: 0, phrase: "We're on track" },
      { speaker: 'Manager', line: "Great. Did you face any issues?", options: ["I ran into an unexpected issue with the server, but it's resolved now.", "No, everything perfect always no problem.", "I don't want to talk about it."], answer: 0, phrase: 'ran into an issue' },
      { speaker: 'Manager', line: "Good to hear. What are your priorities for next week?", options: ["My main priority is finishing the migration script, then reviewing the team's pull requests.", "I will do things next week probably.", "Not sure yet, we'll see."], answer: 0, phrase: 'my main priority is' },
      { speaker: 'Manager', line: "Sounds good. Any blockers we should know about?", options: ["Actually, yes — I'm waiting on approval from the design team.", "No blockers, nothing, all fine 100%.", "Blocker yes problem team wait."], answer: 0, phrase: 'waiting on approval' },
      { speaker: 'Manager', line: "Thanks, I'll follow up on that. Anything else before we close?", options: ["That covers it from my side — thanks everyone!", "I finish talking now bye.", "..."], answer: 0, phrase: 'from my side' }
    ]
  },
  'sim-interview-general': {
    id: 'sim-interview-general', title: 'Job Interview — General', role: 'Recruiter',
    intro: 'A general interview for a role you\'re excited about.',
    steps: [
      { speaker: 'Recruiter', line: "Thanks for joining today. Let's start — tell me about yourself.", options: ["I'm currently working in IT support with a growing focus on infrastructure. I'm known for staying calm under pressure, and I'm looking to grow into a more technical role.", "I was born and then I grew up and now I am here.", "I don't really know what to say about that."], answer: 0, phrase: 'I\'m currently working in' },
      { speaker: 'Recruiter', line: "What would you say is your biggest strength?", options: ["I'd say it's problem-solving under pressure — I stay methodical when things go wrong.", "I am good at everything honestly.", "I don't like to talk about my strengths."], answer: 0, phrase: 'problem-solving under pressure' },
      { speaker: 'Recruiter', line: "And what about an area you're working to improve?", options: ["I've been working on my public speaking — I've started volunteering for small presentations to build confidence.", "I have no weaknesses at all.", "I am bad at many things."], answer: 0, phrase: 'working on' },
      { speaker: 'Recruiter', line: "Where do you see yourself in three years?", options: ["I see myself growing into a more senior technical role, ideally mentoring newer team members.", "I don't think about the future.", "Maybe somewhere else, who knows."], answer: 0, phrase: 'I see myself' },
      { speaker: 'Recruiter', line: "Great, thanks. Do you have any questions for us?", options: ["Yes — what does success look like in this role after the first six months?", "No, no questions, nothing.", "How much money do I get exactly right now?"], answer: 0, phrase: 'what does success look like' }
    ]
  }
};
