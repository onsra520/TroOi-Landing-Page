# Ponytail Rules for Trọ Ơi Landing Page

This project follows Ponytail coding principles to keep code minimal and maintainable.

## Core Principles

1. **YAGNI** - You Aren't Gonna Need It
   - Don't build features before they're needed
   - Keep components simple and focused

2. **Reuse First**
   - Check existing codebase before writing new code
   - Use platform features (HTML5, CSS3, browser APIs)
   - Leverage installed dependencies

3. **Stdlib Over Dependencies**
   - Prefer built-in browser APIs
   - Use React hooks instead of state management libraries
   - Avoid unnecessary abstractions

4. **One Line When Possible**
   - Simplify logic where reasonable
   - Don't golf code at the expense of clarity

5. **Minimum That Works**
   - Write the least code that solves the problem
   - Don't optimize prematurely
   - Keep it readable

## Never Compromise On

- **Validation**: Trust boundary checks stay
- **Error Handling**: User-facing errors must be handled
- **Security**: No shortcuts with auth or data
- **Accessibility**: WCAG compliance is required

## Examples

### ✅ Good
```tsx
// Use native HTML date input
<input type="date" />

// Use CSS for animations
className="transition-colors hover:bg-lime"

// Browser API for theme
localStorage.getItem('theme')
```

### ❌ Avoid
```tsx
// Don't install date-picker library
<DatePicker />

// Don't add animation library for simple effects
<motion.div animate={{...}} />

// Don't add state management for simple state
import { configureStore } from '@reduxjs/toolkit'
```

## This Project

Following Ponytail principles, we:
- Use Tailwind utilities instead of custom CSS
- Leverage React hooks (useState, useContext) instead of Redux
- Use browser APIs (localStorage, IntersectionObserver)
- Keep components small and focused
- Avoid unnecessary abstractions

## Review

Run `/ponytail-review` to check for over-engineering in your changes.
