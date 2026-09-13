import type { ReactNode } from "react";

// Body text supports a lightweight image syntax: ![alt](url) on its own line.
// This keeps storage as plain text (no rich-text editor / HTML sanitization
// needed) while still letting admins place images anywhere in the copy.
const IMAGE_SYNTAX = /!\[([^\]]*)\]\(([^)]+)\)/;

export function renderBodyWithImages(body: string): ReactNode[] {
  // Textareas submitted via native form encoding normalize line breaks to
  // CRLF regardless of how they're stored in the DOM, so normalize back to
  // LF before splitting — otherwise "\r\n\r\n" won't match a bare "\n{2,}".
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}|\n(?=!\[)/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      const match = block.match(IMAGE_SYNTAX);
      if (match) {
        const [, alt, src] = match;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={alt}
            className="my-6 w-full rounded-sm border border-line object-cover"
          />
        );
      }
      return (
        <p key={i} className="whitespace-pre-line text-sm leading-relaxed text-charcoal-soft">
          {block}
        </p>
      );
    });
}
