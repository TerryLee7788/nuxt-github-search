// UserPromptSubmit hook: force-reads this project's SKILL.md files on every prompt,
// so their guidance is injected into context instead of relying only on
// description-based auto-triggering.
const fs = require('fs');
const path = require('path');

const skillDirs = ['nuxt-frontend', 'nuxt-backend'];

const sections = [];
for (const dir of skillDirs) {
  const file = path.join(__dirname, '..', 'skills', dir, 'SKILL.md');
  try {
    const content = fs.readFileSync(file, 'utf8');
    sections.push(`## Project skill: ${dir}\n\n${content}`);
  } catch (err) {
    // Skip missing/unreadable files rather than blocking prompt submission.
  }
}

if (sections.length === 0) {
  process.stdout.write('{}');
} else {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: sections.join('\n\n---\n\n'),
    },
  }));
}
