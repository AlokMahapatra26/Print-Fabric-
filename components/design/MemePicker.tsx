import React from 'react'

interface MemePickerProps {
    onSelectMeme: (url: string) => void
}

// Curated list of popular memes
const MEMES = [
    { name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" },
    { name: "Drake Hotline Bling", url: "https://i.imgflip.com/30b1gx.jpg" },
    { name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
    { name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg" },
    { name: "Left Exit 12 Off Ramp", url: "https://i.imgflip.com/22bdq6.jpg" },
    { name: "Monkey Puppet", url: "https://i.imgflip.com/2gnnjh.jpg" },
    { name: "Running Away Balloon", url: "https://i.imgflip.com/261o3j.jpg" },
    { name: "Epic Handshake", url: "https://i.imgflip.com/28j0te.jpg" },
    { name: "Disaster Girl", url: "https://i.imgflip.com/23ls.jpg" },
    { name: "Mocking Spongebob", url: "https://i.imgflip.com/1otk96.jpg" },
    { name: "Woman Yelling At Cat", url: "https://i.imgflip.com/265k.jpg" },
    { name: "One Does Not Simply", url: "https://i.imgflip.com/1bij.jpg" },
    { name: "Futurama Fry", url: "https://i.imgflip.com/26am.jpg" },
    { name: "Roll Safe Think About It", url: "https://i.imgflip.com/1h7in3.jpg" },
    { name: "Bernie I Am Once Again Asking", url: "https://i.imgflip.com/1o00in.jpg" },
    { name: "Batman Slapping Robin", url: "https://i.imgflip.com/9ehk.jpg" },
    { name: "X X Everywhere", url: "https://i.imgflip.com/1ihzfe.jpg" },
    { name: "Black kids", url: "https://i.imgflip.com/265j.jpg" },
    { name: "Expanding Brain", url: "https://i.imgflip.com/1jwhww.jpg" },
    { name: "Ghee Khatam", url: "https://27m4ul1slc.ufs.sh/f/VKk4lsXcZMtHESE8lbCGiJ4n0IP8kXs7uMbZKwmLyloRQ9p1" }
]

export const MemePicker = ({ onSelectMeme }: MemePickerProps) => {
    return (
        <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-1">
            {MEMES.map((meme) => (
                <button
                    key={meme.name}
                    className="aspect-square relative group overflow-hidden rounded-md border hover:ring-2 hover:ring-primary focus:outline-none"
                    onClick={() => onSelectMeme(meme.url)}
                    title={meme.name}
                >
                    <img
                        src={meme.url}
                        alt={meme.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        loading="lazy"
                    />
                </button>
            ))}
        </div>
    )
}
