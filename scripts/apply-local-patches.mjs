import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)

const patches = [
  {
    filePath:
      "node_modules/react-native-draggable-flatlist/src/components/DraggableFlatList.tsx",
    before: `    InteractionManager.runAfterInteractions(() => {
      reset();
    });`,
    after: `    ;(globalThis.requestIdleCallback?.(() => {
      reset();
    }) ??
      setTimeout(() => {
        reset();
      }, 0));`,
  },
  {
    filePath:
      "node_modules/react-native-draggable-flatlist/lib/module/components/DraggableFlatList.js",
    before: `    InteractionManager.runAfterInteractions(() => {
      reset();
    });`,
    after: `    globalThis.requestIdleCallback?.(() => {
      reset();
    }) ?? setTimeout(() => {
      reset();
    }, 0);`,
  },
  {
    filePath:
      "node_modules/react-native-draggable-flatlist/lib/commonjs/components/DraggableFlatList.js",
    before: `_reactNative.InteractionManager.runAfterInteractions(function(){reset();});`,
    after: `globalThis.requestIdleCallback?globalThis.requestIdleCallback(function(){reset();}):setTimeout(function(){reset();},0);`,
  },
]

for (const patch of patches) {
  const absolutePath = path.join(rootDir, patch.filePath)
  const contents = readFileSync(absolutePath, "utf8")

  if (contents.includes(patch.after)) {
    continue
  }

  if (!contents.includes(patch.before)) {
    throw new Error(`Patch target not found in ${patch.filePath}`)
  }

  writeFileSync(
    absolutePath,
    contents.replace(patch.before, patch.after),
    "utf8",
  )
}
