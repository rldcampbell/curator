import { useLocalSearchParams } from "expo-router"

import { useCollections } from "@/context/CollectionsContext"
import {
  CollectionRoute,
  ItemRoute,
  resolveCollectionRoute,
  resolveItemRoute,
} from "@/helpers/routeEntities"

export function useCollectionRoute(): CollectionRoute | null {
  const params = useLocalSearchParams()
  const { collections } = useCollections()

  return resolveCollectionRoute(params, collections)
}

export function useItemRoute(): ItemRoute | null {
  const params = useLocalSearchParams()
  const { collections } = useCollections()

  return resolveItemRoute(params, collections)
}
