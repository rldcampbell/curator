import ExpoModulesCore

public final class CuratorTemporalWheelPickerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CuratorTemporalWheelPicker")

    View(TemporalWheelPickerView.self) {
      Events("onSelectionChange")

      Prop("columns") { (view: TemporalWheelPickerView, columns: [TemporalWheelPickerColumnRecord]) in
        view.setColumns(columns)
      }

      Prop("selectedIndexes") { (view: TemporalWheelPickerView, selectedIndexes: [Int]) in
        view.setSelectedIndexes(selectedIndexes)
      }

      OnViewDidUpdateProps { view in
        view.applyProps()
      }
    }
  }
}
