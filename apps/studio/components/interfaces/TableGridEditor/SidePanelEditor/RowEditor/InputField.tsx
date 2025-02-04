import { includes, noop } from 'lodash'
import { Button, IconEdit2, IconLink, Input, Listbox, Select } from 'ui'

import { DATETIME_TYPES, JSON_TYPES, TEXT_TYPES } from '../SidePanelEditor.constants'
import { DateTimeInput } from './DateTimeInput'
import { RowField } from './RowEditor.types'

export interface InputFieldProps {
  field: RowField
  errors: any
  isEditable?: boolean
  onUpdateField?: (changes: object) => void
  onEditJson?: (data: any) => void
  onSelectForeignKey?: () => void
}

const InputField = ({
  field,
  errors,
  isEditable = true,
  onUpdateField = noop,
  onEditJson = noop,
  onSelectForeignKey = noop,
}: InputFieldProps) => {
  if (field.enums.length > 0) {
    const isArray = field.format[0] === '_'
    if (isArray) {
      return (
        <div className="text-area-text-sm">
          <Input.TextArea
            layout="horizontal"
            label={field.name}
            className="text-sm"
            descriptionText={field.comment}
            labelOptional={field.format}
            disabled={!isEditable}
            error={errors[field.name]}
            rows={5}
            value={field.value ?? ''}
            placeholder={
              field.defaultValue === null
                ? ''
                : typeof field.defaultValue === 'string' && field.defaultValue.length === 0
                  ? 'EMPTY'
                  : `Default: ${field.defaultValue}`
            }
            onChange={(event: any) => onUpdateField({ [field.name]: event.target.value })}
          />
        </div>
      )
    } else {
      return (
        <Select
          size="medium"
          layout="horizontal"
          value={field.value ?? ''}
          label={field.name}
          labelOptional={field.format}
          descriptionText={field.comment}
          disabled={!isEditable}
          error={errors[field.name]}
          onChange={(event: any) => onUpdateField({ [field.name]: event.target.value })}
        >
          <Select.Option value="">---</Select.Option>
          {field.enums.map((value: string) => (
            <Select.Option key={value} value={value}>
              {value}
            </Select.Option>
          ))}
        </Select>
      )
    }
  }

  if (field.foreignKey !== undefined) {
    return (
      <Input
        layout="horizontal"
        label={field.name}
        value={field.value ?? ''}
        descriptionText={
          <>
            {field.comment && (
              <span className="text-sm text-foreground-lighter">{field.comment} </span>
            )}
            <span className="text-sm text-foreground-lighter">
              {field.comment && '('}Has a foreign key relation to
            </span>
            <span className="text-code font-mono text-xs text-foreground-lighter">
              {field.foreignKey.target_table_schema}.{field.foreignKey.target_table_name}.
              {field.foreignKey.target_column_name}
            </span>
            {field.comment && <span className="text-sm text-foreground-lighter">{`)`}</span>}
          </>
        }
        labelOptional={field.format}
        disabled={!isEditable}
        error={errors[field.name]}
        onChange={(event: any) => onUpdateField({ [field.name]: event.target.value })}
        actions={
          <Button
            type="default"
            className="mr-1"
            htmlType="button"
            onClick={onSelectForeignKey}
            icon={<IconLink />}
          >
            Select record
          </Button>
        }
      />
    )
  }

  if (includes(TEXT_TYPES, field.format)) {
    return (
      <div className="text-area-text-sm">
        <Input.TextArea
          layout="horizontal"
          label={field.name}
          className="text-sm"
          descriptionText={field.comment}
          labelOptional={field.format}
          disabled={!isEditable}
          error={errors[field.name]}
          rows={5}
          value={field.value ?? ''}
          placeholder={
            field.value === null && field.defaultValue === null
              ? 'NULL'
              : field.value === ''
                ? 'EMPTY'
                : typeof field.defaultValue === 'string' && field.defaultValue.length === 0
                  ? 'EMPTY'
                  : `NULL (Default: ${field.defaultValue})`
          }
          actions={
            <div className="mr-1 mt-0.5">
              {(field.isNullable || (!field.isNullable && field.defaultValue)) && (
                <Button
                  type="default"
                  size="tiny"
                  onClick={() => onUpdateField({ [field.name]: null })}
                >
                  Set to NULL
                </Button>
              )}
            </div>
          }
          onChange={(event: any) => onUpdateField({ [field.name]: event.target.value })}
        />
      </div>
    )
  }

  if (includes(JSON_TYPES, field.format)) {
    return (
      <Input
        layout="horizontal"
        value={field.value ?? ''}
        label={field.name}
        descriptionText={field.comment}
        labelOptional={field.format}
        disabled={!isEditable}
        placeholder={field?.defaultValue ?? 'NULL'}
        error={errors[field.name]}
        onChange={(event: any) => onUpdateField({ [field.name]: event.target.value })}
        actions={
          <Button
            type="default"
            htmlType="button"
            onClick={() => onEditJson({ column: field.name, jsonString: field.value })}
            icon={<IconEdit2 />}
          >
            Edit JSON
          </Button>
        }
      />
    )
  }

  if (includes(DATETIME_TYPES, field.format)) {
    return (
      <DateTimeInput
        name={field.name}
        format={field.format}
        value={field.value ?? ''}
        description={
          <>
            {field.defaultValue && <p>Default: {field.defaultValue}</p>}
            {field.comment && <p>{field.comment}</p>}
          </>
        }
        onChange={(value: any) => onUpdateField({ [field.name]: value })}
      />
    )
  }

  if (field.format === 'bool') {
    const options = [
      { value: 'true', label: 'TRUE' },
      { value: 'false', label: 'FALSE' },
      ...(field.isNullable ? [{ value: 'null', label: 'NULL' }] : []),
    ]

    // Ivan: The value coming in from backend is processed (NULL converted to 'null' string) so that
    // it's properly selected in the listbox. The issue is with the internal implementation of the
    // Listbox where the default column value is only considered when field.value is null
    // (the JS kind). Since we're converting that null into 'null', defaultValue isn't used as it
    // should. To fix this, we're only setting the defaultValue of the listbox and not setting the
    // value in the next renders. This makes the ListBox an uncontrolled component but it works.
    // PS: This is the third time we're fixing this in a month. If you have to fix this again, just
    // use Input for booleans.
    const defaultValue = field.value === 'null' ? field.defaultValue : field.value

    return (
      <Listbox
        size="small"
        layout="horizontal"
        name={field.name}
        label={field.name}
        labelOptional={field.format}
        descriptionText={field.comment}
        value={defaultValue === null ? 'null' : defaultValue}
        onChange={(value: string) => {
          if (value === 'null') onUpdateField({ [field.name]: null })
          else onUpdateField({ [field.name]: value })
        }}
      >
        {options.map((option) => (
          <Listbox.Option
            id={option.value}
            key={option.value}
            label={option.label}
            value={option.value}
          >
            {option.label}
          </Listbox.Option>
        ))}
      </Listbox>
    )
  }

  return (
    <Input
      layout="horizontal"
      label={field.name}
      descriptionText={field.comment}
      labelOptional={field.format}
      error={errors[field.name]}
      value={field.value ?? ''}
      placeholder={
        field.isIdentity
          ? 'Automatically generated as identity'
          : field.defaultValue !== null
            ? `Default: ${field.defaultValue}`
            : 'NULL'
      }
      disabled={!isEditable}
      onChange={(event: any) => onUpdateField({ [field.name]: event.target.value })}
    />
  )
}

export default InputField
