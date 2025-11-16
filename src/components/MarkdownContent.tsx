'use client';

import React from 'react';
import Link from 'next/link';

interface MarkdownContentProps {
  content: string;
}

/**
 * Simple markdown renderer for FAQ content
 * Handles basic markdown syntax: paragraphs, links, lists, bold, italic, code
 */
export function MarkdownContent({ content }: MarkdownContentProps) {
  // Split content into blocks (paragraphs, lists, etc.)
  const blocks = content.split(/\n\n+/);

  return (
    <div className="markdown-content">
      {blocks.map((block, index) => {
        // List (unordered)
        if (block.trim().startsWith('- ')) {
          const items = block.split('\n').filter(line => line.trim().startsWith('- '));
          return (
            <ul key={index} className="list-none space-y-[var(--spacing-sm)] ml-[var(--spacing-md)] mb-[var(--spacing-md)]">
              {items.map((item, i) => {
                const itemContent = item.replace(/^- /, '');
                return (
                  <li key={i} className="before:content-['•'] before:mr-[var(--spacing-sm)] before:text-[var(--color-text-muted)]">
                    {renderInlineMarkdown(itemContent)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Paragraph
        return (
          <p key={index} className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-light mb-[var(--spacing-sm)]">
            {renderInlineMarkdown(block.trim())}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Render inline markdown elements (bold, italic, links, code)
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Split by markdown syntax patterns while preserving the delimiters
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let key = 0;

  // Regex patterns for inline markdown
  const patterns = [
    { type: 'link', regex: /\[([^\]]+)\]\(([^)]+)\)/ },
    { type: 'bold', regex: /\*\*([^*]+)\*\*/ },
    { type: 'italic', regex: /\*([^*]+)\*/ },
    { type: 'code', regex: /`([^`]+)`/ },
  ];

  while (currentText.length > 0) {
    let earliestMatch: { type: string; match: RegExpMatchArray; index: number } | null = null;

    // Find the earliest match among all patterns
    for (const pattern of patterns) {
      const match = currentText.match(pattern.regex);
      if (match && match.index !== undefined) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = { type: pattern.type, match, index: match.index };
        }
      }
    }

    if (!earliestMatch) {
      // No more patterns found, add remaining text
      if (currentText) {
        parts.push(<span key={key++}>{currentText}</span>);
      }
      break;
    }

    // Add text before the match
    if (earliestMatch.index > 0) {
      parts.push(<span key={key++}>{currentText.slice(0, earliestMatch.index)}</span>);
    }

    // Add the formatted element
    const match = earliestMatch.match;
    switch (earliestMatch.type) {
      case 'link':
        parts.push(
          <Link
            key={key++}
            href={match[2]}
            className="text-[var(--color-text)] underline hover:no-underline"
          >
            {match[1]}
          </Link>
        );
        break;
      case 'bold':
        parts.push(<strong key={key++} className="font-semibold">{match[1]}</strong>);
        break;
      case 'italic':
        parts.push(<em key={key++} className="italic">{match[1]}</em>);
        break;
      case 'code':
        parts.push(
          <code key={key++} className="text-sm bg-[var(--color-hover)] px-2 py-1 rounded">
            {match[1]}
          </code>
        );
        break;
    }

    // Move past the match
    currentText = currentText.slice(earliestMatch.index + match[0].length);
  }

  return <>{parts}</>;
}
