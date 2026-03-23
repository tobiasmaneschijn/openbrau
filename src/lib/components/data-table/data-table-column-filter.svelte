<script lang="ts" generics="TData, TValue">
  import type { Column } from '@tanstack/table-core';
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { FilterIcon } from '@lucide/svelte';
  import type { ColumnFilterDef, ColumnFilterState, ColumnFilterOperator } from './filter';
  import * as m from '$lib/paraglide/messages';

  let {
    column,
    filterDef,
    filterValue: rawFilterValue
  }: {
    column: Column<TData, TValue>;
    filterDef: ColumnFilterDef;
    filterValue: any;
  } = $props();

  let open = $state(false);

  let filterValue = $derived((rawFilterValue as ColumnFilterState | undefined) ?? {
    operator: getDefaultOperator(filterDef.type),
    value: undefined
  });

  const isFilterActive = $derived.by(() => {
    if (!rawFilterValue) return false; // Not set in parent state
    const operator = filterValue.operator;
    const value = filterValue.value;
    const value2 = filterValue.value2;
    
    // Operators that don't need a value input
    if (['is_empty', 'is_true', 'is_false'].includes(operator)) {
      return true;
    }

    if (operator === 'between') {
      return (value !== undefined && value !== '') || (value2 !== undefined && value2 !== '');
    }

    if (['is_one_of', 'is_none_of'].includes(operator)) {
      return Array.isArray(value) && value.length > 0;
    }

    return value !== undefined && value !== '';
  });

  function getDefaultOperator(type: string): ColumnFilterOperator {
    switch (type) {
      case 'string': return 'contains';
      case 'number': return 'eq';
      case 'date': return 'is_same_as';
      case 'boolean': return 'is_true';
      case 'enum': return 'is_one_of';
      default: return 'equals';
    }
  }

  function getOperatorOptions(type: string) {
    const msg = m as any;
    switch (type) {
      case 'string':
        return [
          { value: 'contains', label: msg.contains ? msg.contains() : 'Contains' },
          { value: 'equals', label: msg.equals ? msg.equals() : 'Equals' },
          { value: 'starts_with', label: msg.starts_with ? msg.starts_with() : 'Starts with' },
          { value: 'is_empty', label: msg.is_empty ? msg.is_empty() : 'Is empty' }
        ];
      case 'number':
        return [
          { value: 'eq', label: msg.equals ? msg.equals() : 'Equals' },
          { value: 'gt', label: msg.greater_than ? msg.greater_than() : 'Greater than' },
          { value: 'lt', label: msg.less_than ? msg.less_than() : 'Less than' },
          { value: 'between', label: msg.between ? msg.between() : 'Between' }
        ];
      case 'date':
        return [
          { value: 'is_same_as', label: msg.is_same_as ? msg.is_same_as() : 'Is same as' },
          { value: 'is_before', label: msg.is_before ? msg.is_before() : 'Is before' },
          { value: 'is_after', label: msg.is_after ? msg.is_after() : 'Is after' }
        ];
      case 'boolean':
        return [
          { value: 'is_true', label: msg.is_true ? msg.is_true() : 'Is true' },
          { value: 'is_false', label: msg.is_false ? msg.is_false() : 'Is false' }
        ];
      case 'enum':
        return [
          { value: 'is_one_of', label: msg.is_one_of ? msg.is_one_of() : 'Is one of' },
          { value: 'is_none_of', label: msg.is_none_of ? msg.is_none_of() : 'Is none of' }
        ];
      default:
        return [];
    }
  }

  function handleOperatorChange(e: Event) {
    const target = e.currentTarget as HTMLSelectElement;
    column.setFilterValue({
      ...filterValue,
      operator: target.value as ColumnFilterOperator
    });
  }

  function handleValueChange(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    column.setFilterValue({
      ...filterValue,
      value: target.value || undefined
    });
  }

  function handleValue2Change(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    column.setFilterValue({
      ...filterValue,
      value2: target.value || undefined
    });
  }

  function toggleEnumOption(optionValue: string) {
    let currentArray = Array.isArray(filterValue.value) ? [...filterValue.value] : [];
    if (currentArray.includes(optionValue)) {
      currentArray = currentArray.filter((v) => v !== optionValue);
    } else {
      currentArray.push(optionValue);
    }
    column.setFilterValue({
      ...filterValue,
      value: currentArray.length > 0 ? currentArray : undefined
    });
  }

  function clearFilter() {
    column.setFilterValue(undefined);
    open = false;
  }
</script>

<Popover bind:open>
  <PopoverTrigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon-sm"
        class="h-6 w-6 ml-1 p-0 {isFilterActive ? 'text-primary' : 'text-muted-foreground'}"
      >
        <FilterIcon class="size-3.5" fill={isFilterActive ? 'currentColor' : 'none'} />
      </Button>
    {/snippet}
  </PopoverTrigger>
  <PopoverContent class="w-72" align="start">
    <div class="space-y-4">
      <div class="space-y-2">
        <Label>{(m as any).operator ? (m as any).operator() : 'Operator'}</Label>
        <select
          class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={filterValue.operator}
          onchange={handleOperatorChange}
        >
          {#each getOperatorOptions(filterDef.type) as operator}
            <option value={operator.value}>{operator.label}</option>
          {/each}
        </select>
      </div>

      {#if filterDef.type === 'string' && filterValue.operator !== 'is_empty'}
        <div class="space-y-2">
          <Label>{(m as any).value ? (m as any).value() : 'Value'}</Label>
          <Input value={filterValue.value ?? ''} oninput={handleValueChange} />
        </div>
      {/if}

      {#if filterDef.type === 'number'}
        <div class="flex gap-2">
          <div class="space-y-2 flex-1">
            <Label>{filterValue.operator === 'between' ? ((m as any).min ? (m as any).min() : 'Min') : ((m as any).value ? (m as any).value() : 'Value')}</Label>
            <Input type="number" value={filterValue.value ?? ''} oninput={handleValueChange} />
          </div>
          {#if filterValue.operator === 'between'}
            <div class="space-y-2 flex-1">
              <Label>{(m as any).max ? (m as any).max() : 'Max'}</Label>
              <Input type="number" value={filterValue.value2 ?? ''} oninput={handleValue2Change} />
            </div>
          {/if}
        </div>
      {/if}

      {#if filterDef.type === 'date'}
        <div class="space-y-2">
          <Label>{(m as any).date ? (m as any).date() : 'Date'}</Label>
          <Input type="date" value={filterValue.value ?? ''} oninput={handleValueChange} />
        </div>
      {/if}

      {#if filterDef.type === 'enum' && filterDef.options}
        <div class="space-y-2">
          <Label>{(m as any).options ? (m as any).options() : 'Options'}</Label>
          <div class="max-h-[150px] overflow-y-auto space-y-2 rounded-md border p-2">
            {#each filterDef.options as option}
              {@const checked = Array.isArray(filterValue.value) && filterValue.value.includes(option.value)}
              <div class="flex items-center space-x-2">
                <Checkbox
                  id={`filter-${column.id}-${option.value}`}
                  {checked}
                  onCheckedChange={() => toggleEnumOption(option.value)}
                />
                <Label for={`filter-${column.id}-${option.value}`} class="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option.label}
                </Label>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="flex justify-between items-center pt-2">
        <Button variant="ghost" size="sm" onclick={clearFilter}>
          {(m as any).clear ? (m as any).clear() : 'Clear'}
        </Button>
      </div>
    </div>
  </PopoverContent>
</Popover>
