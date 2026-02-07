"use client"

import React, { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'

interface CanvasProps {
    color: string
    view: 'front' | 'back' | 'left' | 'right'
    onCanvasReady?: (canvas: fabric.Canvas) => void
}

export const Canvas = ({ color, view, onCanvasReady }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null)
    const [tshirtObject, setTshirtObject] = useState<fabric.Object | null>(null)

    const [currentImageSrc, setCurrentImageSrc] = useState<string>('')

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 700,
            height: 850,
            backgroundColor: '#ffffff'
        })

        setFabricCanvas(canvas)
        if (onCanvasReady) onCanvasReady(canvas)

        // Add Printable Area Guide
        const printableArea = new fabric.Rect({
            width: 280,
            height: 420,
            left: 350,
            top: 450,
            originX: 'center',
            originY: 'center',
            fill: 'transparent',
            stroke: 'rgba(0,0,0,0.2)',
            strokeDashArray: [5, 5],
            strokeWidth: 1,
            selectable: false,
            evented: false,
            excludeFromExport: true,
            name: 'printable-area'
        })
        canvas.add(printableArea)
        // Ensure it stays above tshirt but below logos
        // We will manage z-index by sending tshirt to back, guide just above it
        canvas.renderAll()

        // Zoom Logic
        canvas.on('mouse:wheel', function (opt) {
            const delta = opt.e.deltaY
            let zoom = canvas.getZoom()
            zoom *= 0.999 ** delta
            if (zoom > 5) zoom = 5
            if (zoom < 0.5) zoom = 0.5
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
            opt.e.preventDefault()
            opt.e.stopPropagation()
        })

        // Pan Logic
        let isDragging = false
        let lastPosX = 0
        let lastPosY = 0

        canvas.on('mouse:down', function (opt) {
            const evt = opt.e
            if (opt.target) {
                // If clicked on an object (logo), don't pan
                return
            }
            isDragging = true
            canvas.selection = false // Disable group selection while panning
            lastPosX = evt.clientX
            lastPosY = evt.clientY
        })

        canvas.on('mouse:move', function (opt) {
            if (isDragging) {
                const e = opt.e
                const vpt = canvas.viewportTransform
                if (!vpt) return
                vpt[4] += e.clientX - lastPosX
                vpt[5] += e.clientY - lastPosY
                canvas.requestRenderAll()
                lastPosX = e.clientX
                lastPosY = e.clientY
            }
        })

        canvas.on('mouse:up', function (opt) {
            // on mouse up we want to recalculate new interaction
            // for all objects, so we call setViewportTransform
            if (isDragging) {
                canvas.setViewportTransform(canvas.viewportTransform!)
                isDragging = false
                canvas.selection = true
            }
        })

        return () => {
            canvas.dispose()
        }
    }, [])

    // Handle T-shirt image and color updates
    useEffect(() => {
        if (!fabricCanvas) return

        let targetSrc = ''
        let shouldFilter = true

        if (view === 'front') {
            if (color === '#000000') {
                targetSrc = '/black-tshirt.png'
                shouldFilter = false // Already black
            } else {
                targetSrc = '/tshirt-realistic.png'
                shouldFilter = color !== '#ffffff'
            }
        } else {
            if (color === '#000000') {
                targetSrc = `/black-tshirt-${view}.png`
                shouldFilter = false // Already black
            } else {
                // For back, left, right - we generated white base images
                targetSrc = `/tshirt-${view}.png`
                shouldFilter = color !== '#ffffff'
            }
        }

        // Function to apply filters to the object
        const applyColorFilter = (img: fabric.Image) => {
            console.log('Applying filter:', { color, shouldFilter, view })
            if (!shouldFilter) {
                img.filters = []
            } else {
                const filter = new fabric.Image.filters.BlendColor({
                    color: color,
                    mode: 'multiply',
                    alpha: 1
                })
                img.filters = [filter]
            }
            img.applyFilters()
        }

        if (currentImageSrc !== targetSrc) {
            // Need to switch image
            fabric.Image.fromURL(targetSrc, (img) => {
                // Front image seems smaller (has more padding), so we scale it up
                // to match the visual size of the back/side generated images
                const scaleWidth = view === 'front' ? 800 : 700
                img.scaleToWidth(scaleWidth)

                img.set({
                    left: 350,
                    top: 425,
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    evented: false,
                    name: 'tshirt-background'
                })

                // Remove old object if exists
                if (tshirtObject) {
                    fabricCanvas.remove(tshirtObject)
                }

                applyColorFilter(img)

                fabricCanvas.add(img)
                fabricCanvas.sendToBack(img)
                setTshirtObject(img)
                setCurrentImageSrc(targetSrc)
                fabricCanvas.renderAll()
            })
        } else if (tshirtObject && tshirtObject instanceof fabric.Image) {
            // Just update filter on existing image
            applyColorFilter(tshirtObject)
            fabricCanvas.renderAll()
        }
    }, [color, view, fabricCanvas, currentImageSrc, tshirtObject])

    return (
        <div className="flex items-center justify-center border rounded-lg overflow-hidden bg-background">
            <canvas ref={canvasRef} />
        </div>
    )
}
