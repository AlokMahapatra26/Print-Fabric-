"use client"
import React, { useState, useEffect } from "react"
import { fabric } from "fabric"
import FontFaceObserver from "fontfaceobserver"
import { Canvas } from "./Canvas"
import { Toolbar } from "./Toolbar"
import { Undo, Download } from "lucide-react"
import { downloadDesign } from "./DownloadHelper"

interface DesignerProps {
    // No props passed from page currently
}

export const Designer = ({ }: DesignerProps) => {
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
    const [tshirtColor, setTshirtColor] = useState("#ffffff")
    const [currentView, setCurrentView] = useState<'front' | 'back' | 'left' | 'right'>('front')
    const [canvasStates, setCanvasStates] = useState<Record<string, any[]>>({})

    // History for Undo/Redo
    const [history, setHistory] = useState<string[]>([])
    const [historyStep, setHistoryStep] = useState<number>(-1)
    const [isHistoryProcessing, setIsHistoryProcessing] = useState(false)

    // Helper to save current state to history
    const saveHistory = () => {
        if (!canvas || isHistoryProcessing) return

        const userObjects = canvas.getObjects().filter(o =>
            o.name !== 'tshirt-background' && o.name !== 'printable-area'
        )
        const json = JSON.stringify(userObjects.map(o => o.toObject(['name', 'id'])))

        // If we represent the *current* state, we should check if it's different from the *last* saved state
        // to avoid duplicate entries (though difficult with object refs).
        // Standard approach: slice history up to current step, push new state.

        // Also we need to handle the case where we might be in the middle of history
        const newHistory = history.slice(0, historyStep + 1)
        newHistory.push(json)

        setHistory(newHistory)
        setHistoryStep(newHistory.length - 1)
    }

    const undo = () => {
        if (historyStep <= 0) return // cannot undo if step is 0 (initial state) or -1
        setIsHistoryProcessing(true)
        const prevStep = historyStep - 1
        const prevStateJSON = JSON.parse(history[prevStep])

        // Clear current user objects
        const userObjects = canvas!.getObjects().filter(o =>
            o.name !== 'tshirt-background' && o.name !== 'printable-area'
        )
        canvas!.remove(...userObjects)
        canvas!.discardActiveObject()

        // Load prev state
        if (prevStateJSON.length > 0) {
            fabric.util.enlivenObjects(prevStateJSON, (objects: fabric.Object[]) => {
                objects.forEach(o => {
                    addDeleteControl(o)
                    canvas!.add(o)
                })
                canvas!.requestRenderAll()
                setIsHistoryProcessing(false)
            }, 'fabric')
        } else {
            canvas!.requestRenderAll()
            setIsHistoryProcessing(false)
        }
        setHistoryStep(prevStep)
    }



    // Initialize history on load and attach listeners
    useEffect(() => {
        if (!canvas) return

        // Save initial empty state if history is empty
        if (history.length === 0) {
            const json = JSON.stringify([])
            setHistory([json])
            setHistoryStep(0)
        }

        const handleSave = () => {
            saveHistory()
        }

        canvas.on('object:added', handleSave)
        canvas.on('object:modified', handleSave)
        canvas.on('object:removed', handleSave)

        return () => {
            canvas.off('object:added', handleSave)
            canvas.off('object:modified', handleSave)
            canvas.off('object:removed', handleSave)
        }
    }, [canvas, historyStep, isHistoryProcessing]) // Dependencies might need tuning to avoid stale closures or infinite loops
    // Ideally saveHistory shouldn't depend on stale history, but setState functional update handles it. 
    // However, event listener closure might capture old state?
    // Steps to avoid stale closures in event listeners:
    // 1. Use ref for history/step?
    // 2. Or just accept that we re-bind listeners on change (might be expensive/flickery).
    // Let's refine the listener attachment.

    // Better approach: Use a ref to track if we should save, and maybe `saveHistory` uses functional state updates 
    // but `history.slice` needs current history.
    // Actually, `saveHistory` needs access to the *latest* history.
    // Let's make `saveHistory` wrapped in useCallback with dependency, or just let useEffect re-bind.
    // Re-binding on every step change is okay for this scale.



    // Delete Icon SVG
    const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    const renderIcon = (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) => {
        const size = 24;
        const img = new Image();
        img.src = deleteIcon;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
    }

    const deleteObject = (eventData: MouseEvent, transform: fabric.Transform) => {
        const target = transform.target;
        const canvas = target.canvas;
        if (canvas) {
            canvas.remove(target);
            canvas.requestRenderAll();
        }
        return true;
    }

    // Helper to add delete control to object
    const addDeleteControl = (obj: fabric.Object) => {
        // @ts-ignore
        obj.controls.deleteControl = new fabric.Control({
            x: 0.5,
            y: -0.5,
            offsetY: -16,
            offsetX: 16,
            cursorStyle: 'pointer',
            // @ts-ignore
            mouseUpHandler: deleteObject,
            render: renderIcon,
            sizeX: 24,
            sizeY: 24,
            touchSizeX: 24,
            touchSizeY: 24
        });
    }

    const switchView = (newView: 'front' | 'back' | 'left' | 'right') => {
        if (!canvas) return
        if (newView === currentView) return

        // 1. Save current logic
        const userObjects = canvas.getObjects().filter(o =>
            o.name !== 'tshirt-background' && o.name !== 'printable-area'
        )
        const json = userObjects.map(o => o.toObject(['name', 'id'])) // Preserve name/id if any custom props

        setCanvasStates(prev => ({
            ...prev,
            [currentView]: json
        }))

        // 2. Clear user objects
        canvas.remove(...userObjects)
        canvas.discardActiveObject()

        // 3. Load new view logic
        const savedObjects = canvasStates[newView] || []
        if (savedObjects.length > 0) {
            fabric.util.enlivenObjects(savedObjects, (objects: fabric.Object[]) => {
                objects.forEach(o => {
                    addDeleteControl(o) // Re-add control logic
                    canvas.add(o)
                })
                canvas.requestRenderAll()
            }, 'fabric')
        }

        setCurrentView(newView)
        canvas.requestRenderAll()
    }

    // Handle Upload Logo
    const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canvas || !e.target.files?.[0]) return
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = (f) => {
            const data = f.target?.result as string
            fabric.Image.fromURL(data, (img) => {
                img.scaleToWidth(200)
                img.set({
                    left: 350,
                    top: 450,
                    originX: 'center',
                    originY: 'center',
                    borderColor: 'gray',
                    cornerColor: 'black',
                    cornerSize: 10,
                    transparentCorners: false
                })

                addDeleteControl(img)

                canvas.add(img)
                canvas.setActiveObject(img)
                canvas.renderAll()
            })
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        // Printable area config (from Canvas.tsx - NEW 700x850 layout)
        // Area Width: 280, Height: 420
        // Center X: 350, Center Y: 450

        const objectWidth = activeObject.getScaledWidth()
        const objectHeight = activeObject.getScaledHeight()

        const isCenterOriginX = activeObject.originX === 'center'
        const isCenterOriginY = activeObject.originY === 'center'

        if (alignment === 'left') {
            const offset = isCenterOriginX ? objectWidth / 2 : 0
            activeObject.set('left', 210 + offset)
        } else if (alignment === 'center') {
            if (isCenterOriginX) {
                activeObject.set('left', 350)
            } else {
                activeObject.set('left', 350 - objectWidth / 2)
            }
        } else if (alignment === 'right') {
            const offset = isCenterOriginX ? objectWidth / 2 : objectWidth
            activeObject.set('left', 490 - offset)
        } else if (alignment === 'top') {
            const offset = isCenterOriginY ? objectHeight / 2 : 0
            activeObject.set('top', 240 + offset)
        } else if (alignment === 'middle') {
            if (isCenterOriginY) {
                activeObject.set('top', 450)
            } else {
                activeObject.set('top', 450 - objectHeight / 2)
            }
        } else if (alignment === 'bottom') {
            const offset = isCenterOriginY ? objectHeight / 2 : objectHeight
            activeObject.set('top', 660 - offset)
        }

        activeObject.setCoords()
        canvas.renderAll()
    }

    const handleAddIcon = (svgString: string) => {
        if (!canvas) return

        fabric.loadSVGFromString(svgString, (objects, options) => {
            const icon = fabric.util.groupSVGElements(objects, options)

            icon.scaleToWidth(100)
            icon.set({
                left: 350,
                top: 450,
                originX: 'center',
                originY: 'center',
                fill: '#000000', // Default fill
                borderColor: 'gray',
                cornerColor: 'black',
                cornerSize: 10,
                transparentCorners: false
            })

            addDeleteControl(icon)

            canvas.add(icon)
            canvas.setActiveObject(icon)
            canvas.renderAll()
        })
    }

    const handleAddText = async (font: string) => {
        if (!canvas) return

        const myFont = new FontFaceObserver(font)

        try {
            await myFont.load(null, 5000) // Wait for font to load, 5s timeout
        } catch (e) {
            console.warn(`Font ${font} failed to load or timed out.`, e)
        }

        const textObj = new fabric.Textbox("Double click to edit", {
            left: 350,
            top: 450,
            originX: 'center',
            originY: 'center',
            fontFamily: font,
            fontSize: 40,
            width: 200,
            splitByGrapheme: true,
            textAlign: 'center',
            fill: '#000000',
            borderColor: 'gray',
            cornerColor: 'black',
            cornerSize: 10,
            transparentCorners: false
        })

        addDeleteControl(textObj)

        canvas.add(textObj)
        canvas.setActiveObject(textObj)
        canvas.renderAll()

        // Force another render after a short delay to ensure font applies if it loaded late
        setTimeout(() => {
            canvas.renderAll()
        }, 100)
    }

    const handleObjectColorChange = (color: string) => {
        if (!canvas) return
        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        activeObject.set('fill', color)

        // If it's a path or group (like icons sometimes), we might need to set fill on paths
        if (activeObject instanceof fabric.Group) {
            activeObject.getObjects().forEach(obj => {
                obj.set('fill', color)
            })
        }
        else if (activeObject.type === 'path') {
            activeObject.set('fill', color)
        }

        canvas.renderAll()
    }

    const handleFontChange = async (font: string) => {
        if (!canvas) return
        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        // Only update if it's a Textbox or IText
        if (activeObject instanceof fabric.Textbox || activeObject instanceof fabric.IText) {
            // Use native document.fonts API to ensure font is loaded
            const fontSpec = `40px "${font}"`
            try {
                await document.fonts.load(fontSpec)
            } catch (e) {
                console.warn(`Failed to update font: ${font}`, e)
            }

            activeObject.set('fontFamily', font)
            canvas.requestRenderAll()
        }
    }

    const handleAddMeme = (url: string) => {
        if (!canvas) return

        // Use fabric.Image.fromURL with crossOrigin 'anonymous' to avoid tainting canvas if possible
        // though imgflip might not support CORS, in which case export might fail, but display will work
        fabric.Image.fromURL(url, (img) => {
            img.scaleToWidth(200)
            img.set({
                left: 350,
                top: 450,
                originX: 'center',
                originY: 'center',
                borderColor: 'gray',
                cornerColor: 'black',
                cornerSize: 10,
                transparentCorners: false
            })

            addDeleteControl(img)

            canvas.add(img)
            canvas.setActiveObject(img)
            canvas.renderAll()
        }, { crossOrigin: 'anonymous' })
    }

    const handleBorderChange = (color: string, width: number) => {
        if (!canvas) return
        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        activeObject.set({
            stroke: color,
            strokeWidth: width,
            strokeUniform: true
        })

        if (activeObject instanceof fabric.Group) {
            activeObject.getObjects().forEach(obj => {
                obj.set({
                    stroke: color,
                    strokeWidth: width,
                    strokeUniform: true
                })
            })
        }

        canvas.requestRenderAll()
        canvas.fire('object:modified', { target: activeObject })
    }

    const handleRadiusChange = (radius: number) => {
        if (!canvas) return
        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        if (radius === 0) {
            activeObject.set({ clipPath: undefined })
        } else {
            const width = activeObject.width || 0
            const height = activeObject.height || 0

            const clipRect = new fabric.Rect({
                left: -width / 2,
                top: -height / 2,
                width: width,
                height: height,
                rx: radius,
                ry: radius,
                originX: 'left',
                originY: 'top'
            })

            activeObject.set({ clipPath: clipRect })
        }

        canvas.requestRenderAll()
        canvas.fire('object:modified', { target: activeObject })
    }

    const handleShadowChange = (color: string, blur: number) => {
        if (!canvas) return
        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        if (blur === 0) {
            activeObject.set({ shadow: undefined })
        } else {
            const shadow = new fabric.Shadow({
                color: color,
                blur: blur,
                offsetX: 0,
                offsetY: 0
            })
            activeObject.set({ shadow: shadow })
        }

        canvas.requestRenderAll()
        canvas.fire('object:modified', { target: activeObject })
    }

    const handleDownload = async () => {
        if (!canvas) return
        await downloadDesign(canvas, canvasStates, currentView, tshirtColor)
    }

    return (
        <div className="flex h-screen w-full bg-background">
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <div className="flex space-x-2 bg-secondary p-1 rounded-lg">
                    {(['front', 'back', 'left', 'right'] as const).map((view) => (
                        <button
                            key={view}
                            onClick={() => switchView(view)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === view
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:bg-background/50"
                                }`}
                        >
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                        </button>
                    ))}
                    <div className="w-px h-8 bg-border mx-2" />
                    <button
                        onClick={undo}
                        disabled={historyStep <= 0}
                        className="px-3 py-2 rounded-md text-muted-foreground hover:bg-background/50 disabled:opacity-50"
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-3 py-2 rounded-md text-muted-foreground hover:bg-background/50"
                        title="Download Design"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
                <Canvas color={tshirtColor} view={currentView} onCanvasReady={setCanvas} />
            </div>
            <Toolbar
                color={tshirtColor}
                setColor={setTshirtColor}
                onUploadLogo={handleUploadLogo}
                onAlign={handleAlign}
                onAddIcon={handleAddIcon}
                onAddText={handleAddText}
                onObjectColorChange={handleObjectColorChange}
                onFontChange={handleFontChange}
                onAddMeme={handleAddMeme}
                onBorderChange={handleBorderChange}
                onRadiusChange={handleRadiusChange}
                onShadowChange={handleShadowChange}
            />
        </div>
    )
}
