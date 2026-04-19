import ExpoModulesCore

internal struct TemporalWheelPickerColumnRecord: Record {
  @Field
  var key: String = ""

  @Field
  var label: String = ""

  @Field
  var options: [String] = []

  @Field
  var accessibilityLabel: String?
}
