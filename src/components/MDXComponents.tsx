import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-[2rem] font-semibold tracking-[-0.03em] mb-[var(--spacing-md)] text-[var(--color-text)]">
        <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">{'//'}</span>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-[1.5rem] font-semibold text-[var(--color-text)] mb-[var(--spacing-sm)] mt-[var(--spacing-lg)]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[1.25rem] font-semibold text-[var(--color-text)] mb-[var(--spacing-sm)] mt-[var(--spacing-md)]">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-base leading-[1.8] text-[var(--color-text-secondary)] mb-[var(--spacing-md)]">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <Link
        href={href as string}
        className="text-[var(--color-text)] underline hover:no-underline"
      >
        {children}
      </Link>
    ),
    ul: ({ children }) => (
      <ul className="list-none space-y-[var(--spacing-sm)] ml-[var(--spacing-md)] mb-[var(--spacing-md)]">
        {children}
      </ul>
    ),
    li: ({ children }) => (
      <li className="before:content-['•'] before:mr-[var(--spacing-sm)] before:text-[var(--color-text-muted)]">
        {children}
      </li>
    ),
    code: ({ children, className }) => {
      const isInline = !className;

      if (isInline) {
        return (
          <code className="text-sm bg-[var(--color-hover)] px-2 py-1 rounded">
            {children}
          </code>
        );
      }

      return (
        <code className={className}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="bg-[var(--color-hover)] border border-[var(--color-border)] p-[var(--spacing-md)] text-sm overflow-x-auto mb-[var(--spacing-md)] rounded">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[var(--color-border)] pl-[var(--spacing-md)] italic text-[var(--color-text-muted)] mb-[var(--spacing-md)]">
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="border-t border-[var(--color-border)] my-[var(--spacing-lg)]" />
    ),
    ...components,
  };
}
