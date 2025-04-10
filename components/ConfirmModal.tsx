import React from "react"
import { Modal } from "react-native"

import AppText from "./AppText"
import CompactModalLayout from "./CompactModalLayout"
import ModalButtonRow from "./ModalButtonRow"

type ConfirmModalProps = {
  visible: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <CompactModalLayout
        title={title}
        footer={
          <ModalButtonRow
            onApply={onConfirm}
            applyLabel={confirmText}
            onDiscard={onCancel}
            discardLabel={cancelText}
          />
        }
      >
        {message && <AppText style={{ fontSize: 16 }}>{message}</AppText>}
      </CompactModalLayout>
    </Modal>
  )
}

export default ConfirmModal
