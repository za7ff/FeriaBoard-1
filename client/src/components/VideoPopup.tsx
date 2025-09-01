import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Play } from "lucide-react"
import videoFile from "@assets/F83479B6-9F45-4FF7-9499-FA683AA9A46B_1756696203406.mp4"

export function VideoPopup() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-3 hover:bg-white/20 transition-all duration-300 group"
          data-testid="button-video-popup"
        >
          <Play className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black border-gray-800">
        <div className="relative w-full aspect-video">
          <video
            controls
            autoPlay
            className="w-full h-full"
            data-testid="video-player"
          >
            <source src={videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  )
}