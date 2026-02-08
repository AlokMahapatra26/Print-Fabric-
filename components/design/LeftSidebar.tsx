"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, Type } from "lucide-react"
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

interface LeftSidebarProps {
    color: string
    setColor: (color: string) => void
    onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => void
    onAddIcon: (svgString: string) => void
    onAddText: (font: string) => void
    onAddMeme: (url: string) => void
}

const PRESET_COLORS = [
    "#ffffff", "#000000", "#1c1c1c", "#ff0000", "#00ff00", "#00ff00",
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

export const LeftSidebar = ({ color, setColor, onUploadLogo, onAddIcon, onAddText, onAddMeme }: LeftSidebarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFont, setSelectedFont] = useState("Roboto")

    const handleFontChange = (font: string) => {
        setSelectedFont(font)
    }

    return (
        <div className="w-80 bg-card border-r h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Add Elements</h2>
            </div>
            <Accordion type="single" collapsible defaultValue="text" className="w-full px-6 flex-1 overflow-y-auto">
                <AccordionItem value="color">
                    <AccordionTrigger>T-Shirt Color</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-5 gap-2">
                                {PRESET_COLORS.map((c, i) => (
                                    <button
                                        key={`${c}-${i}`}
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
            </Accordion>
        </div>
    )
}
