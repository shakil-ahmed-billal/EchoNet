"use client"

import React, { useRef, useEffect } from "react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff, Video, VideoOff } from "lucide-react"

export const VideoCall = ({ remoteUserId }: { remoteUserId?: string }) => {
  const { localStream, remoteStream, startCall } = useWebRTC()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
        
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-full h-full object-cover"
        />

        {/* Local Video (Corner) */}
        <div className="absolute top-4 right-4 w-48 aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-zinc-800/80 backdrop-blur-md rounded-full border border-zinc-700">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-zinc-600 hover:bg-zinc-700">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="destructive" size="icon" className="rounded-full h-14 w-14 shadow-lg active:scale-95">
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-zinc-600 hover:bg-zinc-700">
            <Phone className="h-5 w-5" />
          </Button>
        </div>
        
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="animate-pulse mb-4">
               <Video className="h-12 w-12 text-primary" />
            </div>
            <p className="text-lg font-medium">Waiting for participant...</p>
            {remoteUserId && (
               <Button onClick={() => startCall(remoteUserId)} className="mt-6">
                 Start Call
               </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
