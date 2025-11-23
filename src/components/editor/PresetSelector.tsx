'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Linkedin, MessageCircle, Mail } from 'lucide-react';
import type { PresetType } from '@/core/converter';

interface PresetSelectorProps {
  value: PresetType | null;
  onChange: (preset: PresetType | null) => void;
}

const presets = [
  { value: null, label: 'None', icon: null },
  { value: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
  { value: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle },
  { value: 'email' as const, label: 'Email', icon: Mail },
];

export function PresetSelector({ value, onChange }: PresetSelectorProps) {
  const currentPreset = presets.find((p) => p.value === value);
  const Icon = currentPreset?.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {currentPreset?.label || 'Select Preset'}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {presets.map((preset) => {
          const PresetIcon = preset.icon;
          return (
            <DropdownMenuItem
              key={preset.label}
              onClick={() => onChange(preset.value)}
              className="gap-2"
            >
              {PresetIcon && <PresetIcon className="h-4 w-4" />}
              {preset.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
