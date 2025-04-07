import { useLocalSearchParams } from "expo-router"

import CollectionFormScreen from "@/components/CollectionFormScreen"
import { isCollectionId } from "@/helpers/id"

export default function EditCollectionScreen() {
  const { cId } = useLocalSearchParams()

  if (typeof cId !== "string" || !isCollectionId(cId)) return null

  return <CollectionFormScreen mode="edit" collectionId={cId} />
}
