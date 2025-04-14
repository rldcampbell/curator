import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"

import { formatDistanceToNow } from "date-fns"

import { Timestamp } from "@/app/types"

import AppText from "./AppText"

type Props = {
  itemCount: number
  updatedAt: Timestamp
}

export default function MetaBar({ itemCount, updatedAt }: Props) {
  const [updatedAtString, setUpdatedAtString] = useState("")

  useEffect(() => {
    const updateString = () => {
      if (updatedAt) {
        const str = formatDistanceToNow(new Date(updatedAt), {
          addSuffix: true,
        })
        setUpdatedAtString(str)
      }
    }

    updateString() // initial run

    const interval = setInterval(updateString, 30000)

    return () => clearInterval(interval)
  }, [updatedAt])

  return (
    <View style={styles.metaBar}>
      <AppText style={styles.metaText}>
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </AppText>
      <AppText style={styles.metaText}>
        Last updated {updatedAtString || "unknown"}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  metaBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  metaText: {
    fontSize: 13,
    color: "#666",
  },
})
