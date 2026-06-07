# @formatkaka/postcard

Interactive 3D flippable postcard SolidJS component with multiple themes.

## Install

```sh
pnpm add @formatkaka/postcard solid-js
```

## Usage

```tsx
import { Postcard } from '@formatkaka/postcard';

export default function App() {
  return <Postcard />;
}
```

Or use sub-components directly for custom layouts:

```tsx
import { PostcardFront, PostcardBack } from '@formatkaka/postcard';

<PostcardFront title="Hello from Paris!" variant="travel" />
<PostcardBack message="Wish you were here." recipient="Jane" address="NYC" variant="travel" />
```

## Themes

| Variant   | Description                        |
|-----------|------------------------------------|
| `modern`  | Minimal dark editorial             |
| `antique` | Aged parchment, serif typography   |
| `starry`  | Deep navy celestial night sky      |
| `plain`   | Clean white, no frills             |
| `travel`  | Vintage airmail with stripe border |

## Tailwind Setup

This package uses Tailwind CSS classes. Add this to your `tailwind.config.js`
so the classes are included in your build:

```js
content: [
  './node_modules/@formatkaka/postcard/dist/**/*.js',
]
```

## Peer Dependencies

- `solid-js >= 1.8.0`

## Usage in Astro

In your Astro project, use `client:load` or any other client directive:

```astro
---
import { Postcard } from '@formatkaka/postcard';
---

<Postcard client:load />
```
