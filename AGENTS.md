# AGENTS.md

This project follows Ponytail principles to write minimal, maintainable code.

## Core Rules

Before writing code, check:

1. **Does this need to exist?** → Skip it (YAGNI)
2. **Already in codebase?** → Reuse it
3. **Stdlib does it?** → Use it
4. **Native platform feature?** → Use it
5. **Installed dependency?** → Use it
6. **One line possible?** → One line
7. **Only then:** Write the minimum that works

## Never Cut

- Validation at trust boundaries
- Error handling for user-facing issues
- Security (auth, data handling)
- Accessibility (WCAG compliance)

## Examples

✅ `<input type="date">` not date-picker library
✅ `localStorage` not state management lib
✅ Tailwind utilities not custom CSS
✅ React hooks not Redux for simple state

❌ Don't add libraries for features the platform has
❌ Don't abstract until you need it twice
❌ Don't optimize before measuring

Read the code before writing. Lazy about solutions, never about reading.
