# Flu mascot artwork

`js/core/mascot.js` looks for one PNG per state, named exactly:

```
assets/mascot/flu-idle.png
assets/mascot/flu-happy.png
assets/mascot/flu-celebrating.png
assets/mascot/flu-proud.png
assets/mascot/flu-sad.png
assets/mascot/flu-streak-danger.png
assets/mascot/flu-welcome-back.png
assets/mascot/flu-encouraging.png
assets/mascot/flu-thinking.png
assets/mascot/flu-listening.png
assets/mascot/flu-speaking.png
assets/mascot/flu-writing.png
assets/mascot/flu-sos.png
assets/mascot/flu-tech.png
assets/mascot/flu-love.png
assets/mascot/flu-competitive.png
```

Square, transparent background, ~512×512 recommended (same character sheet
style as the official reference: chameleon, headphones, hoodie, chat-bubble
badge on the chest).

Drop the files in with those exact names — no code changes needed anywhere
else. Until a given file exists, that state renders as a glowing emoji badge
instead (see `onerror` fallback in `mascot.js`), so the app never shows a
broken image.
