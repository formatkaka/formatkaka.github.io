# Coding Guidelines for Claude

## Typescript

- Use type always instead of interface. In a file, if you see interface rewrite it to type.
- Always write types at end of file

## General Principles

- Use pnpm always
- Always use TypeScript strict mode
- Prefer composition over inheritance
- Use meaningful variable and function names
- Keep functions small and focused (max 20 lines)
- If the hardcoded or dummy data is more than 10 lines, keep it in separate file.

## React Best Practices

- Use functional components with hooks
- Extract custom hooks for complex state logic
- Prefer named exports over default exports
- Always use destructuring in first line of component. Dont do inline destructuring. If you find this rule broken in a file, fix it.
- Use shadcn component always if available
- if refs need to be initialized, always do it with null instead of undefined

## File Organization

- Group related functionality in folders
- Use barrel exports (index.ts files)
- Try to Keep components under 200 lines.

## Code Style

- Use 2 spaces for indentation
- Max line length: 100 characters
- Use trailing commas
- Prefer const over let
- Use template literals over string concatenation

## Error Handling

- Always handle async operations with try/catch
- Provide meaningful error messages
- Use TypeScript strict null checks

## Testing

- Write tests for all business logic
- Use descriptive test names
- Test edge cases and error conditions

## Add animation

For future reference: When you ask to "add animation", I'll follow this pattern:

1. Create a new numbered folder in src/tech/animations/N-animation-name/
2. Add index.tsx with the React component
3. Add styles.css with animation styles
4. Update learning-animations.astro with a new card following the existing design pattern (gradient header, decorative background, footer with metadata)
