import React from 'react';
import { useTranslations } from 'next-intl';

export interface ProductCommandsProps {
  install?: string | null;
  launch?: string | null;
  command?: string | null; // For MCP servers
}

interface CommandSection {
  value: string | null | undefined;
  labelKey: 'install' | 'launch' | 'command';
  label: string;
}

/**
 * Render a command section with title and code block
 */
function CommandSectionItem({ value, label }: Omit<CommandSection, 'labelKey'>) {
  if (!value) return null;

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-[800px] mx-auto px-[var(--spacing-md)]">
        <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em] mb-[var(--spacing-sm)]">
          <span className="text-[var(--color-text-muted)] font-light mr-[var(--spacing-xs)]">{'//'}</span>
          {label}
        </h2>

        <div className="border border-[var(--color-border)] overflow-hidden mt-[var(--spacing-md)]">
          <pre className="p-[var(--spacing-md)] text-sm leading-relaxed overflow-x-auto bg-[var(--color-bg)]">
            $ {value}
          </pre>
        </div>
      </div>
    </section>
  );
}

export function ProductCommands({ install, launch, command }: ProductCommandsProps) {
  const t = useTranslations('components.productCommands');
  
  const commands: CommandSection[] = [
    { value: install, labelKey: 'install', label: t('install') },
    { value: launch, labelKey: 'launch', label: t('launch') },
    { value: command, labelKey: 'command', label: t('command') },
  ];

  const hasAnyCommand = commands.some(cmd => cmd.value);

  if (!hasAnyCommand) {
    return null;
  }

  return (
    <>
      {commands.map((cmd, index) => (
        <CommandSectionItem
          key={index}
          value={cmd.value}
          label={cmd.label}
        />
      ))}
    </>
  );
}
