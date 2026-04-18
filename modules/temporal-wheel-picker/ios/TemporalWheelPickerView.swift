internal import React
import ExpoModulesCore
import UIKit

internal final class TemporalWheelPickerView: ExpoView, UIPickerViewDataSource, UIPickerViewDelegate {
  private let pickerView = UIPickerView()
  private let onSelectionChange = EventDispatcher()

  private var columns: [TemporalWheelPickerColumnRecord] = []
  private var selectedIndexes: [Int] = []
  private var isApplyingProps = false

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupPickerView()
  }

  func setColumns(_ columns: [TemporalWheelPickerColumnRecord]) {
    self.columns = columns
  }

  func setSelectedIndexes(_ selectedIndexes: [Int]) {
    self.selectedIndexes = selectedIndexes
  }

  func applyProps() {
    pickerView.reloadAllComponents()
    selectedIndexes = normalizedSelectedIndexes()
    applySelectedIndexes(animated: false)
    updateAccessibilityLabel()
  }

  func numberOfComponents(in pickerView: UIPickerView) -> Int {
    return columns.count
  }

  func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
    guard columns.indices.contains(component) else {
      return 0
    }
    return columns[component].options.count
  }

  func pickerView(
    _ pickerView: UIPickerView,
    attributedTitleForRow row: Int,
    forComponent component: Int
  ) -> NSAttributedString? {
    guard let title = titleForRow(row, component: component) else {
      return nil
    }

    return NSAttributedString(
      string: title,
      attributes: [
        .foregroundColor: UIColor.label,
        .font: UIFont.systemFont(ofSize: 22, weight: .medium)
      ]
    )
  }

  func pickerView(_ pickerView: UIPickerView, widthForComponent component: Int) -> CGFloat {
    let componentCount = max(columns.count, 1)
    return bounds.width / CGFloat(componentCount)
  }

  func pickerView(_ pickerView: UIPickerView, rowHeightForComponent component: Int) -> CGFloat {
    return 34
  }

  func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
    guard !isApplyingProps else {
      return
    }
    guard columns.indices.contains(component) else {
      return
    }
    guard columns[component].options.indices.contains(row) else {
      return
    }

    selectedIndexes = normalizedSelectedIndexes()
    selectedIndexes[component] = row

    onSelectionChange([
      "selectedIndexes": selectedIndexes,
      "changedColumn": component
    ])
  }

  private func setupPickerView() {
    pickerView.dataSource = self
    pickerView.delegate = self
    pickerView.translatesAutoresizingMaskIntoConstraints = false
    addSubview(pickerView)

    NSLayoutConstraint.activate([
      pickerView.leadingAnchor.constraint(equalTo: leadingAnchor),
      pickerView.trailingAnchor.constraint(equalTo: trailingAnchor),
      pickerView.topAnchor.constraint(equalTo: topAnchor),
      pickerView.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])
  }

  private func applySelectedIndexes(animated: Bool) {
    isApplyingProps = true
    defer {
      isApplyingProps = false
    }

    for component in columns.indices {
      let rowCount = pickerView.numberOfRows(inComponent: component)
      guard rowCount > 0 else {
        continue
      }
      let row = min(selectedIndexes[component], rowCount - 1)
      pickerView.selectRow(row, inComponent: component, animated: animated)
    }
  }

  private func normalizedSelectedIndexes() -> [Int] {
    return columns.enumerated().map { component, column in
      guard !column.options.isEmpty else {
        return 0
      }

      let rawIndex = selectedIndexes.indices.contains(component)
        ? selectedIndexes[component]
        : 0
      return min(max(rawIndex, 0), column.options.count - 1)
    }
  }

  private func titleForRow(_ row: Int, component: Int) -> String? {
    guard columns.indices.contains(component) else {
      return nil
    }

    let options = columns[component].options
    guard options.indices.contains(row) else {
      return nil
    }

    return options[row]
  }

  private func updateAccessibilityLabel() {
    let labels = columns.compactMap { column -> String? in
      if let accessibilityLabel = column.accessibilityLabel,
        !accessibilityLabel.isEmpty {
        return accessibilityLabel
      }
      if !column.label.isEmpty {
        return column.label
      }
      if !column.key.isEmpty {
        return column.key
      }
      return nil
    }

    pickerView.accessibilityLabel = labels.isEmpty
      ? "Temporal wheel picker"
      : labels.joined(separator: ", ")
  }
}
