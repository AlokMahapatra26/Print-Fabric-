import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface IconPickerProps {
    onSelectIcon: (svgString: string) => void
}

export const IconPicker = ({ onSelectIcon }: IconPickerProps) => {
    const [query, setQuery] = useState('')
    const [icons, setIcons] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const searchIcons = async () => {
        if (!query.trim()) return
        setLoading(true)
        try {
            const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=20`)
            const data = await response.json()
            if (data.icons) {
                setIcons(data.icons)
            }
        } catch (error) {
            console.error("Failed to fetch icons", error)
        } finally {
            setLoading(false)
        }
    }

    const handleIconClick = async (iconName: string) => {
        try {
            const response = await fetch(`https://api.iconify.design/${iconName}.svg`)
            const svgText = await response.text()
            onSelectIcon(svgText)
        } catch (error) {
            console.error("Failed to fetch icon svg", error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Search icons..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchIcons()}
                />
                <Button size="icon" onClick={searchIcons} disabled={loading}>
                    <Search className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-1 border rounded-md">
                {icons.map((icon) => (
                    <button
                        key={icon}
                        className="p-2 border rounded hover:bg-accent flex items-center justify-center h-12"
                        onClick={() => handleIconClick(icon)}
                    >
                        {/* We use a simple img tag for preview to avoid dangerouslySetInnerHTML for list */}
                        <img
                            src={`https://api.iconify.design/${icon}.svg`}
                            alt={icon}
                            className="w-full h-full object-contain pointer-events-none"
                        />
                    </button>
                ))}
                {icons.length === 0 && !loading && (
                    <p className="col-span-4 text-center text-sm text-muted-foreground py-4">
                        Search for icons...
                    </p>
                )}
                {loading && (
                    <p className="col-span-4 text-center text-sm text-muted-foreground py-4">
                        Loading...
                    </p>
                )}
            </div>
        </div>
    )
}
