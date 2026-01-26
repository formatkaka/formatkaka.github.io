import { PRESET_PERSONAS } from './types';
import type { LLMConfig } from './types';

export function getPersonaDisplay(llmConfig: LLMConfig | undefined): string {
  if (!llmConfig) return 'Custom';
  
  const presetPersona = PRESET_PERSONAS.find((p) => p.description === llmConfig.persona);
  if (presetPersona) return presetPersona.label;
  
  // Truncate custom persona if too long (max 60 chars)
  return llmConfig.persona.length > 60 
    ? llmConfig.persona.slice(0, 60) + '...'
    : llmConfig.persona;
}

export function getStatusBadgeConfig(status: string) {
  const configs = {
    in_progress: { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]', label: '● In Progress' },
    completed: { bg: 'bg-[#e3f2fd]', text: 'text-[#1565c0]', label: '✓ Completed' },
    error: { bg: 'bg-[#ffebee]', text: 'text-[#c62828]', label: '✕ Error' },
    pending: { bg: 'bg-[#f5f5f5]', text: 'text-[#666]', label: '○ Pending' },
  } as const;
  
  return configs[status as keyof typeof configs] || configs.pending;
}

export function formatRelativeTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
