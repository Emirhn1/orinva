import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Chip, ChipTone } from './Chip';
import { Input } from './Input';
import { Text } from './Typography';
import { useTheme } from '@/design/ThemeProvider';
import { ChipOption } from '@/content/chips';
import { orderChips } from '@/utils/chips';
import { useAppStore } from '@/store/useAppStore';

const CUSTOM_PREFIX = 'custom:';

export function isCustomChip(id: string) {
  return id.startsWith(CUSTOM_PREFIX);
}

export function customChipLabel(id: string) {
  return id.slice(CUSTOM_PREFIX.length);
}

export function makeCustomChip(text: string) {
  return `${CUSTOM_PREFIX}${text.trim()}`;
}

interface BaseProps {
  label?: string;
  hint?: string;
  options: ChipOption[];
  /** Namespace for usage counting/ordering ("trigger", "why", …). Omit to keep authored order. */
  namespace?: string;
  tone?: ChipTone;
  /** Shows a "+ Kendim yazayım" chip that reveals a text input. */
  allowCustom?: boolean;
  customPlaceholder?: string;
}

interface MultiProps extends BaseProps {
  mode: 'multi';
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
}

interface SingleProps extends BaseProps {
  mode: 'single';
  value: string | null;
  onChange: (next: string | null) => void;
}

type Props = MultiProps | SingleProps;

/**
 * The chip-first input (Plan §4). Free text is always the last, optional
 * escape hatch — the group is valid with nothing selected.
 */
export function ChipGroup(props: Props) {
  const { label, hint, options, namespace, tone = 'neutral', allowCustom = false, customPlaceholder = 'Kendi ifadenle…' } = props;
  const { tokens } = useTheme();
  const chipUsage = useAppStore((s) => s.chipUsage);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  const ordered = useMemo(() => (namespace ? orderChips(options, chipUsage, namespace) : options), [options, chipUsage, namespace]);

  const selectedIds: string[] = props.mode === 'multi' ? props.value : props.value ? [props.value] : [];
  const customSelected = selectedIds.filter(isCustomChip);
  const atMax = props.mode === 'multi' && props.max !== undefined && props.value.length >= props.max;

  const toggle = (id: string) => {
    if (props.mode === 'multi') {
      const has = props.value.includes(id);
      if (has) props.onChange(props.value.filter((x) => x !== id));
      else if (!atMax) props.onChange([...props.value, id]);
    } else {
      props.onChange(props.value === id ? null : id);
    }
  };

  const commitCustom = () => {
    const text = customText.trim();
    setCustomOpen(false);
    setCustomText('');
    if (!text) return;
    const id = makeCustomChip(text);
    if (props.mode === 'multi') {
      if (props.value.includes(id) || atMax) return;
      props.onChange([...props.value, id]);
    } else {
      props.onChange(id);
    }
  };

  const counter = props.mode === 'multi' && props.max ? ` · ${props.value.length}/${props.max}` : '';

  return (
    <View>
      {label ? (
        <Text variant="label" color="secondary" style={{ marginBottom: tokens.spacing['8'] }}>
          {label}
          {counter ? <Text variant="caption" color="tertiary">{counter}</Text> : null}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing['8'] }}>
        {ordered.map((opt) => {
          const selected = selectedIds.includes(opt.id);
          return (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={selected}
              tone={tone}
              disabled={!selected && atMax}
              onPress={() => toggle(opt.id)}
            />
          );
        })}
        {customSelected.map((id) => (
          <Chip key={id} label={customChipLabel(id)} selected tone={tone} onPress={() => toggle(id)} />
        ))}
        {allowCustom && !customOpen ? (
          <Chip label="+ Kendim yazayım" onPress={() => setCustomOpen(true)} disabled={atMax} />
        ) : null}
      </View>
      {allowCustom && customOpen ? (
        <View style={{ marginTop: tokens.spacing['12'] }}>
          <Input
            autoFocus
            placeholder={customPlaceholder}
            value={customText}
            onChangeText={setCustomText}
            onSubmitEditing={commitCustom}
            onBlur={commitCustom}
            returnKeyType="done"
            maxLength={60}
          />
        </View>
      ) : null}
      {hint ? (
        <Text variant="caption" color="tertiary" style={{ marginTop: tokens.spacing['8'] }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Resolves a stored chip id (authored or custom) to its display label. */
export function resolveChipLabel(options: ChipOption[], id: string | null | undefined): string | null {
  if (!id) return null;
  if (isCustomChip(id)) return customChipLabel(id);
  return options.find((o) => o.id === id)?.label ?? id;
}
