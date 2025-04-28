import React, { useCallback, useRef, useState } from "react"
import { FlatList, StyleSheet, View } from "react-native"

import * as Haptics from "expo-haptics"

import AppText, { AppTextProps } from "@/components/AppText"

const ITEM_HEIGHT = 30
const VISIBLE_ITEMS = 4

export type WheelPickerProps = {
  value: number | undefined
  min: number
  max: number
  onChange: (newValue: number | undefined) => void
  label: string
  showUndefined?: boolean
}

const generateWideSample = (max: number) => {
  const digits = max.toString().length
  return "6".repeat(digits)
}

const MeasureTextWidth = ({
  text,
  onMeasure,
  textProps,
}: {
  text: string
  onMeasure: (width: number) => void
  textProps: Pick<AppTextProps, "weight" | "style">
}) => {
  return (
    <View style={{ position: "absolute", opacity: 0 }}>
      <AppText
        onLayout={e => onMeasure(e.nativeEvent.layout.width)}
        {...textProps}
      >
        {text}
      </AppText>
    </View>
  )
}

export const WheelPicker = ({
  value,
  min,
  max,
  onChange,
  label,
  showUndefined = false,
}: WheelPickerProps) => {
  const flatListRef = useRef<FlatList<number | undefined>>(null)
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(
    undefined,
  )
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const data = [
    ...(showUndefined ? [undefined] : []),
    ...Array.from({ length: max - min + 1 }, (_, i) => i + min),
  ]

  const initialIndex = data.findIndex(item => item === value)

  const onScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y
      const index = Math.round(offsetY / ITEM_HEIGHT)
      if (index !== currentIndex) {
        setCurrentIndex(index)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    },
    [currentIndex],
  )

  const onMomentumScrollEnd = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y
      const index = Math.round(offsetY / ITEM_HEIGHT)
      const selectedValue = data[index]
      onChange(selectedValue)
    },
    [data, onChange],
  )

  const renderItem = ({ item }: { item: number | undefined }) => {
    const isSelected = value === item

    return (
      <View
        style={[styles.itemContainer, { width: "100%" }]} // Make active region full width
      >
        <AppText
          weight={isSelected ? "semiBold" : "medium"}
          style={[styles.itemText, isSelected && styles.selectedItemText]}
        >
          {item !== undefined ? item.toString() : "-"}
        </AppText>
      </View>
    )
  }

  return (
    <View
      style={[styles.container, { width: (measuredWidth ?? 40) + 16 }]} // small padding
    >
      <MeasureTextWidth
        text={generateWideSample(max)}
        onMeasure={setMeasuredWidth}
        textProps={{
          weight: "semiBold",
          style: [styles.itemText, styles.selectedItemText],
        }}
      />
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item, index) =>
          (item !== undefined ? item.toString() : "undefined") + index
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="center"
        decelerationRate={0.998}
        bounces={false}
        directionalLockEnabled={true}
        scrollEnabled={true}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onLayout={() => {
          if (flatListRef.current && initialIndex >= 0) {
            flatListRef.current.scrollToIndex({
              index: initialIndex,
              animated: false,
            })
            setCurrentIndex(initialIndex)
          }
        }}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{
          paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
        }}
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, overflow: "hidden" }}
      />
      <AppText style={styles.label} weight="medium">
        {label}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 18,
    color: "#999",
  },
  selectedItemText: {
    fontSize: 22,
    color: "#000",
  },
  label: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
})

export default WheelPicker
