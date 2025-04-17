import {
  FieldId,
  FieldType,
  FieldValue,
  RawField,
  RawFieldAndValue,
} from "@/app/types"

import DateFieldInput from "./DateFieldInput"
import ImageFieldInput from "./ImageFieldInput"
import NumberFieldInput from "./NumberFieldInput"
import TextFieldInput from "./TextFieldInput"

export type FieldInputProps = {
  fieldId: FieldId
  field: RawField
  value: FieldValue | undefined
  update: (fieldId: FieldId, value: FieldValue) => void
}

export default function FieldInput({
  fieldId,
  field,
  value,
  update,
}: FieldInputProps) {
  const fieldWithValue = { ...field, value } as RawFieldAndValue

  switch (fieldWithValue.type) {
    case FieldType.Text:
      return (
        <TextFieldInput
          fieldId={fieldId}
          field={fieldWithValue}
          value={fieldWithValue.value}
          update={update}
        />
      )

    case FieldType.Number:
      return (
        <NumberFieldInput
          fieldId={fieldId}
          field={fieldWithValue}
          value={fieldWithValue.value}
          update={update}
        />
      )

    case FieldType.Date:
      return (
        <DateFieldInput
          fieldId={fieldId}
          field={fieldWithValue}
          value={fieldWithValue.value}
          update={update}
        />
      )

    case FieldType.Image:
      return (
        <ImageFieldInput
          fieldId={fieldId}
          field={fieldWithValue}
          value={fieldWithValue.value}
          update={update}
        />
      )

    default:
      return null
  }
}
