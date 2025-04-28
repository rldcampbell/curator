import React from "react"

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
    <CompactModalLayout
      visible={visible}
      onRequestClose={onCancel}
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
  )
}

export default ConfirmModal
