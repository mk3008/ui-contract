import { useState } from 'react'
import type { ReactNode } from 'react'
import { Check, ChevronRight, X } from 'lucide-react'

export type SelectEmptyDisplay = 'placeholder-text' | 'blank-field'
export type SelectMultiSelectedItemDisplay =
  | 'chips'
  | 'inline-text'
  | 'chips-overflow-count'
  | 'count-summary'
export type SelectMultiRemoveAffordance = 'chip-remove-button' | 'list-toggle-only'
export type SelectSearchFieldTreatment = 'embedded-search-field' | 'separate-search-field'

export type SelectPolicy = {
  emptyDisplay: SelectEmptyDisplay
  multiSelectedItemDisplay: SelectMultiSelectedItemDisplay
  multiRemoveAffordance: SelectMultiRemoveAffordance
  searchFieldTreatment: SelectSearchFieldTreatment
}

type Option<T extends string> = {
  value: T
  label: string
  note: string
}

export const selectEmptyDisplayOptions: Array<Option<SelectEmptyDisplay>> = [
  {
    value: 'placeholder-text',
    label: 'Empty prompt',
    note: 'Show non-value prompt text when no option is selected.',
  },
  {
    value: 'blank-field',
    label: 'Blank empty field',
    note: 'Leave the empty select visually blank when no option is selected.',
  },
]

export const selectMultiSelectedItemDisplayOptions: Array<Option<SelectMultiSelectedItemDisplay>> = [
  {
    value: 'inline-text',
    label: 'Selected inline text',
    note: 'Show selected labels as field text for short, read-heavy selections.',
  },
  {
    value: 'count-summary',
    label: 'Selected count text',
    note: 'Show selected count as the field text when labels would be too long.',
  },
  {
    value: 'chips',
    label: 'All selected chips',
    note: 'Show every selected value as a chip when the count stays small.',
  },
  {
    value: 'chips-overflow-count',
    label: 'Visible chips + overflow count',
    note: 'Show a few chips and summarize overflow for longer selections.',
  },
]

const selectMultiRemoveAffordanceOptions: Array<Option<SelectMultiRemoveAffordance>> = [
  {
    value: 'chip-remove-button',
    label: 'Remove button on chip',
    note: 'Allow removal directly from selected chips.',
  },
  {
    value: 'list-toggle-only',
    label: 'Remove in reopened list',
    note: 'Remove by reopening the list and toggling options.',
  },
]

const selectSearchFieldTreatmentOptions: Array<Option<SelectSearchFieldTreatment>> = [
  {
    value: 'embedded-search-field',
    label: 'Search in select field',
    note: 'Type a search term in the select field, then select a known item.',
  },
  {
    value: 'separate-search-field',
    label: 'Search in popup list',
    note: 'Keep the select field stable and search inside the popup list.',
  },
]

export function SelectSectionedContractPanel({
  selectPolicy,
  onUpdate,
}: {
  selectPolicy: SelectPolicy
  onUpdate: <Key extends keyof SelectPolicy>(key: Key, value: SelectPolicy[Key]) => void
}) {
  return (
    <div className="select-sectioned-panel">
      <SelectPolicySection
        title="Select display rules"
        controls={
          <OptionGroup
            title="Empty display"
            value={selectPolicy.emptyDisplay}
            options={selectEmptyDisplayOptions}
            onChange={(value) => onUpdate('emptyDisplay', value)}
          />
        }
        preview={<SelectCommonPreview selectPolicy={selectPolicy} />}
      />

      <SelectPolicySection
        title="Single select"
        controls={<p className="policy-note">No individual settings.</p>}
        preview={<SelectSinglePreview selectPolicy={selectPolicy} />}
      />

      <SelectPolicySection
        title="Multi select"
        controls={
          <>
            <OptionGroup
              title="Selected items"
              value={selectPolicy.multiSelectedItemDisplay}
              options={selectMultiSelectedItemDisplayOptions}
              onChange={(value) => onUpdate('multiSelectedItemDisplay', value)}
            />
            {selectUsesRemovableChips(selectPolicy) ? (
              <OptionGroup
                title="Remove affordance"
                value={selectPolicy.multiRemoveAffordance}
                options={selectMultiRemoveAffordanceOptions}
                onChange={(value) => onUpdate('multiRemoveAffordance', value)}
              />
            ) : null}
          </>
        }
        preview={<SelectMultiPreview selectPolicy={selectPolicy} />}
      />

      <SelectPolicySection
        description="Searchable select for finding known items without opening a full search dialog. The data source is screen-owned."
        title="Lookup select"
        controls={
          <OptionGroup
            title="Search placement"
            value={selectPolicy.searchFieldTreatment}
            options={selectSearchFieldTreatmentOptions}
            onChange={(value) => onUpdate('searchFieldTreatment', value)}
          />
        }
        preview={<SelectSearchPreview selectPolicy={selectPolicy} />}
      />
    </div>
  )
}

function SelectPolicySection({
  controls,
  description,
  preview,
  title,
}: {
  controls: ReactNode
  description?: string
  preview: ReactNode
  title: string
}) {
  return (
    <section className="select-policy-section">
      <div className="select-policy-heading">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="select-policy-section-grid">
        <div className="select-policy-controls">
          <span className="select-column-label">Settings</span>
          {controls}
        </div>
        <div className="select-policy-preview">
          <span className="select-column-label">Preview</span>
          {preview}
        </div>
      </div>
    </section>
  )
}

function OptionGroup<T extends string>({
  onChange,
  options,
  title,
  value,
}: {
  onChange: (value: T) => void
  options: Array<Option<T>>
  title: string
  value: T
}) {
  return (
    <section className="option-group">
      <h4>{title}</h4>
      <div className="option-grid">
        {options.map((option) => (
          <button
            className={`option-card ${value === option.value ? 'is-selected' : ''}`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <span className="option-title">{option.label}</span>
            <span className="option-note">{option.note}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export function SelectPreviewStage({
  selectPolicy,
}: {
  selectPolicy: SelectPolicy
}) {
  const [previewMode, setPreviewMode] = useState<'states' | 'try-it'>('states')

  return (
    <div className="select-preview-shell">
      <div className="preview-tabs" role="tablist" aria-label="Select preview mode">
        <button
          aria-selected={previewMode === 'states'}
          className={previewMode === 'states' ? 'is-active' : ''}
          onClick={() => setPreviewMode('states')}
          role="tab"
          type="button"
        >
          States
        </button>
        <button
          aria-selected={previewMode === 'try-it'}
          className={previewMode === 'try-it' ? 'is-active' : ''}
          onClick={() => setPreviewMode('try-it')}
          role="tab"
          type="button"
        >
          Try it
        </button>
      </div>

      {previewMode === 'states' ? (
        <SelectStatesPreview selectPolicy={selectPolicy} />
      ) : (
        <SelectInteractivePreview selectPolicy={selectPolicy} />
      )}
    </div>
  )
}

function SelectStatesPreview({
  selectPolicy,
}: {
  selectPolicy: SelectPolicy
}) {
  const teamOptions = ['Finance', 'Operations', 'Support']
  const selectedTeams = ['Finance', 'Operations']

  return (
    <div className="select-stage select-state-sections">
      <SelectStateSection title="Single select">
        <SelectStateCard title="Optional empty" caption="Empty value example">
          <SelectStaticControl text={selectEmptyDisplayText(selectPolicy)} />
        </SelectStateCard>

        <SelectStateCard title="Selected" caption="Resting, value selected">
          <SelectStaticControl text="North America" />
        </SelectStateCard>

        <SelectStateCard title="Expanded" caption="After click, list is open">
          <SelectStaticControl expanded text="North America" />
          <SelectOptionList policy={selectPolicy} selected={['North America']} />
        </SelectStateCard>
      </SelectStateSection>

      <SelectStateSection title="Multi select">
        <SelectStateCard title="Empty" caption="Resting, no value">
          <SelectStaticControl text={selectEmptyDisplayText(selectPolicy, 'Choose teams')} />
        </SelectStateCard>

        <SelectStateCard title="Selected" caption="Selected values stay visible">
          <SelectStaticControl text={multiSelectControlText(selectPolicy, selectedTeams)} />
          {multiSelectShowsExternalItems(selectPolicy) ? (
            <MultiSelectedItems policy={selectPolicy} selectedTeams={selectedTeams} />
          ) : null}
        </SelectStateCard>

        <SelectStateCard title="Expanded" caption="List shows selected options">
          <SelectStaticControl expanded text={multiSelectControlText(selectPolicy, selectedTeams)} />
          <SelectOptionList options={teamOptions} policy={selectPolicy} selected={selectedTeams} />
        </SelectStateCard>

        {selectUsesRemovableChips(selectPolicy) ? (
          <SelectStateCard title="Remove" caption="Same selected state with removal affordance">
            <SelectStaticControl text={multiSelectControlText(selectPolicy, selectedTeams)} />
            <MultiSelectedItems policy={selectPolicy} removable selectedTeams={selectedTeams} />
          </SelectStateCard>
        ) : null}
      </SelectStateSection>

      <SelectStateSection title="Lookup select">
        <SelectStateCard title="Lookup results" caption="Search term finds selectable records">
          <SearchStaticPreview policy={selectPolicy} query="sku-10" selected={['Northwind Keyboard']} />
        </SelectStateCard>

        <SelectStateCard title="No results" caption="No match needs explicit text">
          <SearchStaticPreview noResults policy={selectPolicy} query="zzzz" selected={[]} />
        </SelectStateCard>
      </SelectStateSection>
    </div>
  )
}

function SelectCommonPreview({
  selectPolicy,
}: {
  selectPolicy: SelectPolicy
}) {
  return (
    <div className="select-stage select-section-preview">
      <SelectStateCard title="Empty value" caption="Optional field example">
        <SelectStaticControl text={selectEmptyDisplayText(selectPolicy)} />
      </SelectStateCard>
      <SelectStateCard title="Selected row" caption="Opened list, selected option">
        <SelectStaticControl expanded text="North America" />
        <SelectOptionList policy={selectPolicy} selected={['North America']} />
      </SelectStateCard>
    </div>
  )
}

function SelectSinglePreview({
  selectPolicy,
}: {
  selectPolicy: SelectPolicy
}) {
  return (
    <div className="select-stage select-section-preview">
      <SelectStateCard title="Optional empty" caption="Display only; clear rules are screen-owned">
        <SelectStaticControl text={selectEmptyDisplayText(selectPolicy)} />
      </SelectStateCard>
      <SelectStateCard title="Selected" caption="Resting, value selected">
        <SelectStaticControl text="North America" />
      </SelectStateCard>
      <SelectStateCard title="Required/defaulted" caption="No empty state required">
        <SelectStaticControl text="North America" />
      </SelectStateCard>
      <SelectStateCard title="Expanded" caption="After click, list is open">
        <SelectStaticControl expanded text="North America" />
        <SelectOptionList policy={selectPolicy} selected={['North America']} />
      </SelectStateCard>
    </div>
  )
}

function SelectMultiPreview({
  selectPolicy,
}: {
  selectPolicy: SelectPolicy
}) {
  const teamOptions = ['Finance', 'Operations', 'Support']
  const selectedTeams = ['Finance', 'Operations']

  return (
    <div className="select-stage select-section-preview">
      <SelectStateCard title="Empty" caption="Resting, no value">
        <SelectStaticControl text={selectEmptyDisplayText(selectPolicy, 'Choose teams')} />
      </SelectStateCard>
      <SelectStateCard title="Selected" caption="Selected values stay visible">
        <SelectStaticControl text={multiSelectControlText(selectPolicy, selectedTeams)} />
        {multiSelectShowsExternalItems(selectPolicy) ? (
          <MultiSelectedItems policy={selectPolicy} selectedTeams={selectedTeams} />
        ) : null}
      </SelectStateCard>
      <SelectStateCard title="Expanded" caption="List shows selected options">
        <SelectStaticControl expanded text={multiSelectControlText(selectPolicy, selectedTeams)} />
        <SelectOptionList options={teamOptions} policy={selectPolicy} selected={selectedTeams} />
      </SelectStateCard>
      {selectUsesRemovableChips(selectPolicy) ? (
        <SelectStateCard title="Remove" caption="Same selected state with removal affordance">
          <SelectStaticControl text={multiSelectControlText(selectPolicy, selectedTeams)} />
          <MultiSelectedItems policy={selectPolicy} removable selectedTeams={selectedTeams} />
        </SelectStateCard>
      ) : null}
    </div>
  )
}

function SelectSearchPreview({
  selectPolicy,
}: {
  selectPolicy: SelectPolicy
}) {
  return (
    <div className="select-stage select-section-preview">
      <SelectStateCard title="Lookup results" caption="Search term finds selectable records">
        <SearchStaticPreview policy={selectPolicy} query="sku-10" selected={['Northwind Keyboard']} />
      </SelectStateCard>
      <SelectStateCard title="No results" caption="No match needs explicit text">
        <SearchStaticPreview noResults policy={selectPolicy} query="zzzz" selected={[]} />
      </SelectStateCard>
    </div>
  )
}

function SelectInteractivePreview({
  selectPolicy,
}: {
  selectPolicy: SelectPolicy
}) {
  const regionOptions = ['North America', 'Europe', 'Asia Pacific']
  const teamOptions = ['Finance', 'Operations', 'Support']
  const [singleOpen, setSingleOpen] = useState(false)
  const [singleValue, setSingleValue] = useState('')
  const [multiOpen, setMultiOpen] = useState(false)
  const [selectedTeams, setSelectedTeams] = useState(['Finance', 'Operations'])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('north')

  const filteredRegions = regionOptions.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase()),
  )

  const toggleTeam = (team: string) => {
    setSelectedTeams((current) =>
      current.includes(team) ? current.filter((value) => value !== team) : [...current, team],
    )
  }

  return (
    <div className="select-stage select-try-grid">
      <div className="select-interactive-card">
        <button className="select-sample-control" onClick={() => setSingleOpen((value) => !value)} type="button">
          <span>{singleValue || selectEmptyDisplayText(selectPolicy)}</span>
          <ChevronRight size={16} />
        </button>
        {singleOpen ? (
          <div className="select-menu-preview">
            {regionOptions.map((option) => (
              <button
                className={`select-option action-option ${singleValue === option ? 'is-selected' : ''}`}
                key={option}
                onClick={() => {
                  setSingleValue(option)
                  setSingleOpen(false)
                }}
                type="button"
              >
                <SelectOptionContent isSelected={singleValue === option}>{option}</SelectOptionContent>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="select-interactive-card">
        <button className="select-sample-control" onClick={() => setMultiOpen((value) => !value)} type="button">
          <span>{multiSelectControlText(selectPolicy, selectedTeams)}</span>
          <ChevronRight size={16} />
        </button>
        {multiSelectShowsExternalItems(selectPolicy) ? (
          <MultiSelectedItems
            onRemove={toggleTeam}
            policy={selectPolicy}
            removable
            selectedTeams={selectedTeams}
          />
        ) : null}
        {multiOpen ? (
          <div className="select-menu-preview">
            {teamOptions.map((option) => (
              <button
                className={`select-option action-option ${selectedTeams.includes(option) ? 'is-selected' : ''}`}
                key={option}
                onClick={() => toggleTeam(option)}
                type="button"
              >
                <SelectOptionContent isSelected={selectedTeams.includes(option)}>
                  {option}
                </SelectOptionContent>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="select-interactive-card">
        {selectPolicy.searchFieldTreatment === 'embedded-search-field' ? (
          <label className="select-search-control">
            <span className="visually-hidden">Search regions</span>
            <input
              onChange={(event) => {
                setSearchText(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              value={searchText}
            />
          </label>
        ) : (
          <button className="select-sample-control" onClick={() => setSearchOpen((value) => !value)} type="button">
            <span>{selectEmptyDisplayText(selectPolicy)}</span>
            <ChevronRight size={16} />
          </button>
        )}
        {searchOpen ? (
          <div className="select-menu-preview">
            {selectPolicy.searchFieldTreatment === 'separate-search-field' ? (
              <label className="select-search-row select-search-row-input">
                <span className="visually-hidden">Filter regions</span>
                <input
                  onChange={(event) => setSearchText(event.target.value)}
                  value={searchText}
                />
              </label>
            ) : null}
            {filteredRegions.length ? (
              filteredRegions.map((option) => (
                <button
                  className={`select-option action-option ${searchText === option ? 'is-selected' : ''}`}
                  key={option}
                  onClick={() => {
                    setSearchText(option)
                    setSearchOpen(false)
                  }}
                  type="button"
                >
                  <SelectOptionContent isSelected={searchText === option}>{option}</SelectOptionContent>
                </button>
              ))
            ) : (
              <NoResultsPreview />
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function SelectStateCard({
  children,
}: {
  caption: string
  children: ReactNode
  title: string
}) {
  return <div className="select-state-card">{children}</div>
}

function SelectStateSection({
  children,
}: {
  children: ReactNode
  title: string
}) {
  return <div className="select-state-list">{children}</div>
}

function selectEmptyDisplayText(selectPolicy: SelectPolicy, placeholder = 'Choose a region') {
  return selectPolicy.emptyDisplay === 'placeholder-text' ? placeholder : ''
}

function SelectStaticControl({
  combobox = false,
  expanded = false,
  text,
}: {
  combobox?: boolean
  expanded?: boolean
  text: string
}) {
  return (
    <div className={`select-sample-control ${combobox ? 'is-combobox' : ''} ${expanded ? 'is-expanded' : ''}`}>
      <span>{text}</span>
      <ChevronRight size={16} />
    </div>
  )
}

function SelectOptionList({
  options,
  selected,
}: {
  options?: string[]
  policy: SelectPolicy
  selected: string[]
}) {
  const valueOptions = options ?? ['North America', 'Europe']

  return (
    <div className="select-menu-preview">
      {valueOptions.map((option) => (
        <div className={`select-option ${selected.includes(option) ? 'is-selected' : ''}`} key={option}>
          <SelectOptionContent isSelected={selected.includes(option)}>{option}</SelectOptionContent>
        </div>
      ))}
    </div>
  )
}

function SelectOptionContent({
  children,
  isSelected,
}: {
  children: ReactNode
  isSelected: boolean
}) {
  return (
    <span className="select-option-content">
      <span className="select-option-check" aria-hidden="true">
        {isSelected ? <Check size={13} strokeWidth={2.6} /> : null}
      </span>
      <span>{children}</span>
    </span>
  )
}

function SearchStaticPreview({
  noResults = false,
  policy,
  query,
  selected,
}: {
  noResults?: boolean
  policy: SelectPolicy
  query: string
  selected: string[]
}) {
  const options = ['Northwind Keyboard', 'Northwind Mouse']

  return (
    <>
      {policy.searchFieldTreatment === 'embedded-search-field' ? (
        <SelectStaticControl combobox expanded text={query} />
      ) : (
        <SelectStaticControl expanded text={selectEmptyDisplayText(policy)} />
      )}
      <div className="select-menu-preview">
        {policy.searchFieldTreatment === 'separate-search-field' ? (
          <div className="select-search-row">{query}</div>
        ) : null}
        {noResults ? (
          <NoResultsPreview />
        ) : (
          options.map((option) => (
            <div className={`select-option ${selected.includes(option) ? 'is-selected' : ''}`} key={option}>
              <SelectOptionContent isSelected={selected.includes(option)}>{option}</SelectOptionContent>
            </div>
          ))
        )}
      </div>
    </>
  )
}

function MultiSelectedItems({
  onRemove,
  policy,
  removable = false,
  selectedTeams,
}: {
  onRemove?: (team: string) => void
  policy: SelectPolicy
  removable?: boolean
  selectedTeams: string[]
}) {
  if (policy.multiSelectedItemDisplay === 'inline-text') {
    return (
      <div className="select-selection-text">
        {selectedTeams.length ? selectedTeams.join(', ') : 'No teams selected'}
      </div>
    )
  }

  if (policy.multiSelectedItemDisplay === 'chips-overflow-count') {
    const visibleTeams = selectedTeams.slice(0, 1)
    const overflowCount = selectedTeams.length - visibleTeams.length

    return (
      <div className="select-chip-row">
        {visibleTeams.map((team) => (
          <SelectChip
            key={team}
            label={team}
            onRemove={onRemove ? () => onRemove(team) : undefined}
            removable={removable && policy.multiRemoveAffordance === 'chip-remove-button'}
          />
        ))}
        {overflowCount > 0 ? <span className="select-chip select-chip-summary">+{overflowCount}</span> : null}
      </div>
    )
  }

  return (
    <div className="select-chip-row">
      {selectedTeams.map((team) => (
        <SelectChip
          key={team}
          label={team}
          onRemove={onRemove ? () => onRemove(team) : undefined}
          removable={removable && policy.multiRemoveAffordance === 'chip-remove-button'}
        />
      ))}
    </div>
  )
}

function multiSelectControlText(selectPolicy: SelectPolicy, selectedTeams: string[]) {
  if (!selectedTeams.length) return selectEmptyDisplayText(selectPolicy, 'Choose teams')
  if (selectPolicy.multiSelectedItemDisplay === 'inline-text') return selectedTeams.join(', ')
  if (selectPolicy.multiSelectedItemDisplay === 'count-summary') {
    return `${selectedTeams.length} ${selectedTeams.length === 1 ? 'team selected' : 'teams selected'}`
  }
  if (selectUsesRemovableChips(selectPolicy)) {
    return `${selectedTeams.length} ${selectedTeams.length === 1 ? 'team selected' : 'teams selected'}`
  }
  return selectEmptyDisplayText(selectPolicy, 'Choose teams')
}

function multiSelectShowsExternalItems(selectPolicy: SelectPolicy) {
  return (
    selectPolicy.multiSelectedItemDisplay === 'chips' ||
    selectPolicy.multiSelectedItemDisplay === 'chips-overflow-count'
  )
}

function selectUsesRemovableChips(selectPolicy: SelectPolicy) {
  return (
    selectPolicy.multiSelectedItemDisplay === 'chips' ||
    selectPolicy.multiSelectedItemDisplay === 'chips-overflow-count'
  )
}

function NoResultsPreview() {
  return (
    <div className="select-option is-empty">
      <span>No matching regions</span>
    </div>
  )
}

function SelectChip({
  label,
  onRemove,
  removable = false,
}: {
  label: string
  onRemove?: () => void
  removable?: boolean
}) {
  return (
    <span className={`select-chip ${removable ? 'is-removable' : ''}`}>
      {label}
      {removable ? (
        <button aria-label={`Remove ${label}`} onClick={onRemove} type="button">
          <X size={12} />
        </button>
      ) : null}
    </span>
  )
}
