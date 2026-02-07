"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Upload, AlignLeft, AlignCenter, AlignRight, ArrowUpToLine, AlignVerticalJustifyCenter, ArrowDownToLine, Type } from "lucide-react"
import { IconPicker } from "./IconPicker"
import { MemePicker } from "./MemePicker"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ToolbarProps {
    color: string
    setColor: (color: string) => void
    onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => void
    onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
    onAddIcon: (svgString: string) => void
    onAddText: (font: string) => void
    onObjectColorChange: (color: string) => void
    onFontChange: (font: string) => void
    onAddMeme: (url: string) => void
    onBorderChange: (color: string, width: number) => void
    onRadiusChange: (radius: number) => void
    onShadowChange: (color: string, blur: number) => void
}

const PRESET_COLORS = [
    "#ffffff", "#000000", "#1c1c1c", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#00ffff", "#ff00ff", "#808080", "#c0c0c0"
]

const FONT_FAMILIES = [
    "Roboto",
    "Open Sans",
    "Montserrat",
    "Playfair Display",
    "Lobster",
    "Pacifico",
    "Dancing Script",
    "Satisfy",
    "Bangers",
    "Permanent Marker",
    "Anton",
    "Oswald",
    "Cinzel",
]

export const Toolbar = ({ color, setColor, onUploadLogo, onAlign, onAddIcon, onAddText, onObjectColorChange, onFontChange, onAddMeme, onBorderChange, onRadiusChange, onShadowChange }: ToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFont, setSelectedFont] = useState("Roboto")
    const [objectColor, setObjectColor] = useState("#000000")

    // Border state
    const [borderColor, setBorderColor] = useState("#000000")
    const [borderWidth, setBorderWidth] = useState(0)

    // Effects state
    const [borderRadius, setBorderRadius] = useState(0)
    const [shadowColor, setShadowColor] = useState("#000000")
    const [shadowBlur, setShadowBlur] = useState(0)

    const handleObjectColorUpdate = (newColor: string) => {
        setObjectColor(newColor)
        onObjectColorChange(newColor)
    }

    const handleBorderUpdate = (newColor: string, newWidth: number) => {
        setBorderColor(newColor)
        setBorderWidth(newWidth)
        onBorderChange(newColor, newWidth)
    }

    const handleRadiusUpdate = (newRadius: number) => {
        setBorderRadius(newRadius)
        onRadiusChange(newRadius)
    }

    const handleShadowUpdate = (newColor: string, newBlur: number) => {
        setShadowColor(newColor)
        setShadowBlur(newBlur)
        onShadowChange(newColor, newBlur)
    }

    const handleFontChange = (font: string) => {
        setSelectedFont(font)
        onFontChange(font)
    }

    return (
        <div className="w-80 bg-card border-l h-full flex flex-col">
            <Accordion type="single" collapsible defaultValue="text" className="w-full px-6 flex-1 overflow-y-auto">
                <AccordionItem value="color">
                    <AccordionTrigger>T-Shirt Color</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-5 gap-2">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${color === c ? "ring-2 ring-primary ring-offset-2" : ""
                                            }`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                        title={c}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="custom-color">Custom:</Label>
                                <Input
                                    id="custom-color"
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-full h-10 p-1 cursor-pointer"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="object-color">
                    <AccordionTrigger>Object Color</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-1">
                            <p className="text-xs text-muted-foreground">Change color of selected text or icon.</p>
                            <div className="grid grid-cols-5 gap-2">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${objectColor === c ? "ring-2 ring-primary ring-offset-2" : ""
                                            }`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => handleObjectColorUpdate(c)}
                                        title={c}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="object-custom-color">Custom:</Label>
                                <Input
                                    id="object-custom-color"
                                    type="color"
                                    value={objectColor}
                                    onChange={(e) => handleObjectColorUpdate(e.target.value)}
                                    className="w-full h-10 p-1 cursor-pointer"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="text">
                    <AccordionTrigger>Add Text</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-1">
                            <div className="space-y-2">
                                <Label>Font Family</Label>
                                <Select value={selectedFont} onValueChange={handleFontChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a font" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FONT_FAMILIES.map(font => (
                                            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                                {font}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full" onClick={() => onAddText(selectedFont)}>
                                <Type className="mr-2 h-4 w-4" /> Click to Add Text
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                Double-click on the text to edit content.
                            </p>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="logo">
                    <AccordionTrigger>Add Logo/Image</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-1">
                            <p className="text-sm text-muted-foreground">
                                Upload a PNG or JPEG image to place on the T-shirt.
                            </p>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="cursor-pointer"
                                    ref={fileInputRef}
                                    onChange={onUploadLogo}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" /> Upload Image
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="border">
                    <AccordionTrigger>Border & Effects</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-1">
                            <p className="text-xs text-muted-foreground">Style your image with borders and effects.</p>

                            {/* Border Controls */}
                            <div className="space-y-2">
                                <Label>Border Color</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${borderColor === c ? "ring-2 ring-primary ring-offset-2" : ""
                                                }`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => handleBorderUpdate(c, borderWidth)}
                                            title={c}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="border-custom-color">Custom:</Label>
                                    <Input
                                        id="border-custom-color"
                                        type="color"
                                        value={borderColor}
                                        onChange={(e) => handleBorderUpdate(e.target.value, borderWidth)}
                                        className="w-full h-10 p-1 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Border Width</Label>
                                    <span className="text-sm text-muted-foreground">{borderWidth}px</span>
                                </div>
                                <Slider
                                    value={[borderWidth]}
                                    max={20}
                                    step={1}
                                    onValueChange={(vals) => handleBorderUpdate(borderColor, vals[0])}
                                />
                            </div>

                            <div className="w-full h-px bg-border my-2" />

                            {/* Radius Controls */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Corner Radius</Label>
                                    <span className="text-sm text-muted-foreground">{borderRadius}px</span>
                                </div>
                                <Slider
                                    value={[borderRadius]}
                                    max={100}
                                    step={1}
                                    onValueChange={(vals) => handleRadiusUpdate(vals[0])}
                                />
                            </div>

                            <div className="w-full h-px bg-border my-2" />

                            {/* Shadow/Glow Controls */}
                            <div className="space-y-2">
                                <Label>Drop Shadow Color</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${shadowColor === c ? "ring-2 ring-primary ring-offset-2" : ""
                                                }`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => handleShadowUpdate(c, shadowBlur)}
                                            title={c}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="shadow-custom-color">Custom:</Label>
                                    <Input
                                        id="shadow-custom-color"
                                        type="color"
                                        value={shadowColor}
                                        onChange={(e) => handleShadowUpdate(e.target.value, shadowBlur)}
                                        className="w-full h-10 p-1 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Softness (Blur)</Label>
                                    <span className="text-sm text-muted-foreground">{shadowBlur}px</span>
                                </div>
                                <Slider
                                    value={[shadowBlur]}
                                    max={50}
                                    step={1}
                                    onValueChange={(vals) => handleShadowUpdate(shadowColor, vals[0])}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="icons">
                    <AccordionTrigger>Icon Library</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-1">
                            <p className="text-sm text-muted-foreground">
                                Search and add vector icons.
                            </p>
                            <IconPicker onSelectIcon={onAddIcon} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="memes">
                    <AccordionTrigger>Popular Memes</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-1">
                            <p className="text-sm text-muted-foreground">
                                Click to add a meme to your design.
                            </p>
                            <MemePicker onSelectMeme={onAddMeme} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="alignment">
                    <AccordionTrigger>Alignment</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-1">
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" size="icon" onClick={() => onAlign('left')} title="Align Left">
                                        <AlignLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => onAlign('center')} title="Align Center (Horizontal)">
                                        <AlignCenter className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => onAlign('right')} title="Align Right">
                                        <AlignRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" size="icon" onClick={() => onAlign('top')} title="Align Top">
                                        <ArrowUpToLine className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => onAlign('middle')} title="Align Middle (Vertical)">
                                        <AlignVerticalJustifyCenter className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => onAlign('bottom')} title="Align Bottom">
                                        <ArrowDownToLine className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="p-6 mt-auto border-t">
                <p className="text-xs text-muted-foreground text-center">
                    Drag, resize and rotate your logo directly on the T-shirt.
                </p>
            </div>
        </div>
    )
}
