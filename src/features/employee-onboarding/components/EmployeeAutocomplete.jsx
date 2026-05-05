import { Autocomplete, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

/**
 * Searchable employee reference (reporting manager, HR manager, …).
 * @param {{ name: string; label: string; options: { id: string; label: string }[]; excludeId?: string }} props
 */
export function EmployeeAutocomplete({ name, label, options, excludeId }) {
  const { control } = useFormContext();
  const filtered = excludeId ? options.filter((o) => o.id !== excludeId) : options;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref } }) => {
        const selected = filtered.find((o) => o.id === value) || null;
        return (
          <Autocomplete
            value={selected}
            onChange={(_, v) => onChange(v?.id || '')}
            options={filtered}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} inputRef={ref} label={label} placeholder="Search…" />
            )}
            noOptionsText="No matches"
          />
        );
      }}
    />
  );
}
