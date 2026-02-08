import { fabric } from "fabric"
import { zip, strToU8 } from "fflate"
import { saveAs } from "file-saver"

export const downloadDesign = async (
    canvas: fabric.Canvas,
    canvasStates: Record<string, any>,
    currentView: string,
    tshirtColor: string
) => {
    // 1. Save current view state first to ensure we have the latest
    const currentViewObjects = canvas.getObjects().filter(o =>
        o.name !== 'tshirt-background' && o.name !== 'printable-area'
    )
    const currentViewJson = currentViewObjects.map(o => o.toObject(['name', 'id']))

    // Merge with other saved states
    const allStates = {
        ...canvasStates,
        [currentView]: currentViewJson
    }

    const views = ['front', 'back', 'left', 'right']
    const files: Record<string, Uint8Array> = {}

    // Helper to load image
    const loadImage = (url: string): Promise<fabric.Image> => {
        return new Promise((resolve) => {
            fabric.Image.fromURL(url, (img) => {
                resolve(img)
            }, { crossOrigin: 'anonymous' })
        })
    }

    // Helper to determine background image
    const getTshirtImageSrc = (view: string, color: string) => {
        if (view === 'front') {
            if (color === '#000000') {
                return '/black-tshirt.png'
            } else {
                return '/tshirt-realistic.png'
            }
        } else {
            if (color === '#000000') {
                return `/black-tshirt-${view}.png`
            } else {
                return `/tshirt-${view}.png`
            }
        }
    }

    // Helper to create a static canvas and render a view
    const renderView = async (viewName: string, objectsJson: any[]) => {
        // Create a static canvas
        const staticCanvas = new fabric.StaticCanvas(null, {
            width: 700,
            height: 850,
            backgroundColor: '#ffffff'
        })

        // 1. Load and setup T-shirt Background
        const bgSrc = getTshirtImageSrc(viewName, tshirtColor)
        const bgImg = await loadImage(bgSrc)

        const scaleWidth = viewName === 'front' ? 800 : 700
        bgImg.scaleToWidth(scaleWidth)
        bgImg.set({
            left: 350,
            top: 425,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            name: 'tshirt-background'
        })

        // Apply color filter if needed
        const shouldFilter = tshirtColor !== '#ffffff' && tshirtColor !== '#000000'

        // Special case: if it IS black, we use the black image and NO filter (as per Canvas.tsx) rather than filtering white to black
        // The getTshirtImageSrc handles the black image selection.
        // We only filter if it's the white base AND color is not white.
        // Wait, Canvas.tsx says: 
        // if (color === '#000000') shouldFilter = false
        // else shouldFilter = color !== '#ffffff'

        let applyFilter = false
        if (tshirtColor === '#000000') {
            applyFilter = false
        } else {
            applyFilter = tshirtColor !== '#ffffff'
        }

        if (applyFilter) {
            const filter = new fabric.Image.filters.BlendColor({
                color: tshirtColor,
                mode: 'multiply',
                alpha: 1
            })
            bgImg.filters = [filter]
            bgImg.applyFilters()
        }

        staticCanvas.add(bgImg)

        // 2. Add Design Objects
        if (objectsJson.length > 0) {
            return new Promise<void>((resolve) => {
                fabric.util.enlivenObjects(objectsJson, (objs: fabric.Object[]) => {
                    objs.forEach(o => {
                        staticCanvas.add(o)
                    })
                    staticCanvas.renderAll()

                    const dataUrl = staticCanvas.toDataURL({
                        format: 'png',
                        multiplier: 1
                    })

                    // Add to zip files object
                    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "")
                    const binaryString = atob(base64Data)
                    const len = binaryString.length
                    const bytes = new Uint8Array(len)
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i)
                    }
                    files[`views/${viewName}_mockup.png`] = bytes

                    resolve()
                }, 'fabric')
            })
        } else {
            // Even if no objects, render the empty tshirt
            staticCanvas.renderAll()
            const dataUrl = staticCanvas.toDataURL({ format: 'png', multiplier: 1 })
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "")
            const binaryString = atob(base64Data)
            const len = binaryString.length
            const bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }
            files[`views/${viewName}_mockup.png`] = bytes
        }
    }

    // Process all views
    await Promise.all(views.map(view => renderView(view, allStates[view] || [])))

    // Extract individual assets from the current canvas (as a sample of what we can do)
    const processedAssets = new Set<string>()

    const processAssets = async (objectsJson: any[]) => {
        for (const obj of objectsJson) {
            if (obj.type === 'image' && obj.src) {
                if (processedAssets.has(obj.src)) continue
                const assetId = processedAssets.size + 1
                processedAssets.add(obj.src)

                try {
                    const response = await fetch(obj.src)
                    const blob = await response.blob()
                    const arrayBuffer = await blob.arrayBuffer()
                    const bytes = new Uint8Array(arrayBuffer)

                    // Guess extension
                    const type = blob.type.split('/')[1] || 'png'
                    const name = `assets/asset_${assetId}.${type}`
                    files[name] = bytes
                } catch (e) {
                    console.warn("Failed to save asset", obj.src, e)
                }
            }
        }
    }

    await Promise.all(views.map(view => processAssets(allStates[view] || [])))

    // Generate Zip
    zip(files, (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        const blob = new Blob([data as any], { type: "application/zip" })
        saveAs(blob, "tshirt_design.zip")
    })
}
