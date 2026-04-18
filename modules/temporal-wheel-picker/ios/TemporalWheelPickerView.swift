internal import React
import ExpoModulesCore
import UIKit

internal final class TemporalWheelPickerView: ExpoView, UIPickerViewDataSource, UIPickerViewDelegate {
  private let pickerView = UIPickerView()
  private let onSelectionChange = EventDispatcher()

  private var columns: [TemporalWheelPickerColumnRecord] = []
  private var selectedIndexes: [Int] = []
  private var isApplyingProps = false
  private var previousBoundsSize: CGSize = .zero

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupPickerView()
  }

  override func layoutSubviews() {
    super.layoutSubviews()

    guard bounds.size != previousBoundsSize else {
      return
    }

    previousBoundsSize = bounds.size
    pickerView.reloadAllComponents()
    applySelectedIndexes(animated: false)
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

  func pickerView(_ pickerView: UIPickerView, widthForComponent component: Int) -> CGFloat {
    return componentWidth(for: component)
  }

  func pickerView(_ pickerView: UIPickerView, rowHeightForComponent component: Int) -> CGFloat {
    return 40
  }

  func pickerView(
    _ pickerView: UIPickerView,
    viewForRow row: Int,
    forComponent component: Int,
    reusing view: UIView?
  ) -> UIView {
    let label = (view as? UILabel) ?? UILabel()
    let selectedRow = normalizedSelectedIndexes()[component]
    let isSelected = selectedRow == row

    label.backgroundColor = .clear
    label.font = isSelected
      ? UIFont.systemFont(ofSize: 28, weight: .semibold)
      : UIFont.systemFont(ofSize: 23, weight: .medium)
    label.textColor = isSelected
      ? UIColor.label
      : UIColor.secondaryLabel.withAlphaComponent(0.72)
    label.textAlignment = .center
    label.adjustsFontSizeToFitWidth = true
    label.minimumScaleFactor = 0.65
    label.alpha = isSelected ? 1.0 : 0.92
    label.frame = CGRect(
      x: 0,
      y: 0,
      width: componentWidth(for: component) - 8,
      height: 40
    )
    label.text = titleForRow(row, component: component)

    return label
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

    UIView.performWithoutAnimation {
      pickerView.reloadComponent(component)
      pickerView.selectRow(row, inComponent: component, animated: false)
      pickerView.layoutIfNeeded()
    }

    onSelectionChange([
      "selectedIndexes": selectedIndexes,
      "changedColumn": component
    ])
  }

  private func setupPickerView() {
    pickerView.dataSource = self
    pickerView.delegate = self
    pickerView.backgroundColor = .clear
    pickerView.clipsToBounds = true
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

  private func componentWidth(for component: Int) -> CGFloat {
    guard columns.indices.contains(component) else {
      return max(bounds.width, 96)
    }

    let componentCount = max(columns.count, 1)
    let availableWidth = max(bounds.width, 96 * CGFloat(componentCount))
    return availableWidth / CGFloat(componentCount)
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
