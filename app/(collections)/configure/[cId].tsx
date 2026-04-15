import CollectionFormScreen from "@/components/CollectionFormScreen"
import ScreenMessage from "@/components/ScreenMessage"
import { useCollectionRoute } from "@/hooks/useRouteEntities"

export default function EditCollectionScreen() {
  const route = useCollectionRoute()

  if (!route) return <ScreenMessage message="Collection not found" />

  return <CollectionFormScreen mode="edit" collectionId={route.collectionId} />
}
