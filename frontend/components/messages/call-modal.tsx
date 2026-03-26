"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PhoneOff, Mic, MicOff, Video as VidIcon, VideoOff, Minimize2, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CallModalProps {
    isOpen: boolean
    onClose: () => void
    onMinimize: () => void
    remoteUser: any
    isVideo: boolean
    localStream: MediaStream | null
    remoteStream: MediaStream | null
    localVideoRef: React.RefObject<HTMLVideoElement | null>
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>
    duration?: number
}

export const CallModal = ({
    isOpen,
    onClose,
    onMinimize,
    remoteUser,
    isVideo,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    duration = 0
}: CallModalProps) => {
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(!isVideo)

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled)
            setIsMuted(!isMuted)
        }
    }

    const toggleVideo = () => {
        if (localStream && isVideo) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled)
            setIsVideoOff(!isVideoOff)
        }
    }

    return (
        <Dialog open={isOpen}>
            <DialogContent showCloseButton={false} className="sm:max-w-[600px] p-0 overflow-hidden bg-zinc-950 border-zinc-800 text-white shadow-2xl rounded-3xl">
                <div className="relative h-[450px] flex flex-col items-center justify-center">
                    {/* Header Controls */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                        <div className="flex items-center gap-2">
                           <Avatar className="h-8 w-8 ring-1 ring-white/20">
                                <AvatarImage src={remoteUser?.avatarUrl} />
                                <AvatarFallback>{remoteUser?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col">
                                <span className="text-sm font-medium drop-shadow-md">{remoteUser?.name}</span>
                                {remoteStream && isVideo && <span className="text-[10px] text-zinc-400">{formatDuration(duration)}</span>}
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full hover:bg-white/10 text-white"
                            onClick={onMinimize}
                        >
                            <Minimize2 className="h-5 w-5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full hover:bg-red-500/20 text-white"
                            onClick={onClose}
                        >
                            <PhoneOff className="h-5 w-5" />
                        </Button>
                        </div>
                    </div>

                    {/* Video Area */}
                    {isVideo ? (
                        <div className="absolute inset-0 bg-black flex items-center justify-center">
                            {remoteStream ? (
                                <video 
                                    ref={remoteVideoRef} 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <Avatar className="h-24 w-24 animate-pulse ring-4 ring-primary/30">
                                        <AvatarImage src={remoteUser?.avatarUrl} />
                                        <AvatarFallback className="text-3xl">{remoteUser?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-zinc-400 text-sm">Connecting...</p>
                                </div>
                            )}

                            {/* Self View */}
                            <div className="absolute bottom-20 right-4 w-32 h-44 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-zinc-900 group">
                                {!isVideoOff ? (
                                    <video 
                                        ref={localVideoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className="w-full h-full object-cover mirror" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                        <VideoOff className="h-6 w-6 text-zinc-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Audio Only UI */
                        <div className="flex flex-col items-center gap-6 z-10">
                            {/* Hidden video element to play audio stream when visible video is not present */}
                            <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
                            <div className="relative">
                                <Avatar className="h-32 w-32 ring-8 ring-white/5">
                                    <AvatarImage src={remoteUser?.avatarUrl} />
                                    <AvatarFallback className="text-4xl">{remoteUser?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold">{remoteUser?.name}</h3>
                                <p className="text-zinc-500 text-sm mt-1">{remoteStream ? formatDuration(duration) : "Connecting..."}</p>
                            </div>
                        </div>
                    )}

                    {/* Bottom Controls */}
                    <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 z-20">
                        <Button 
                            variant="secondary" 
                            size="icon" 
                            className={cn("rounded-full h-12 w-12", isMuted && "bg-red-500 text-white hover:bg-red-600")}
                            onClick={toggleMute}
                        >
                            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                        
                        {isVideo && (
                            <Button 
                                variant="secondary" 
                                size="icon" 
                                className={cn("rounded-full h-12 w-12", isVideoOff && "bg-red-500 text-white hover:bg-red-600")}
                                onClick={toggleVideo}
                            >
                                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VidIcon className="h-5 w-5" />}
                            </Button>
                        )}

                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="rounded-full h-12 w-12 shadow-red-500/20 shadow-lg"
                            onClick={onClose}
                        >
                            <PhoneOff className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
