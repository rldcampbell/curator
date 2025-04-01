import { useState } from "react"
import { DevSettings, Text, View } from "react-native"

import AddButton from "@/components/AddButton"
import ConfirmModal from "@/components/ConfirmModal"
import { resetDatabase } from "@/services/database"
import { sharedStyles } from "@/styles/sharedStyles"

export default function DevScreen() {
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Developer Tools</Text>

      <AddButton onPress={() => setModalVisible(true)} label="Reset Database" />

      {modalVisible && (
        <ConfirmModal
          visible={true}
          onCancel={() => setModalVisible(false)}
          onConfirm={async () => {
            await resetDatabase()
            DevSettings.reload()
          }}
          title="Reset database?"
          message="Are you sure you want to delete all data and reset the database?"
        />
      )}
    </View>
  )
}
