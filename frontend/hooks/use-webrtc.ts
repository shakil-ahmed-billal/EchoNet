import { useEffect, useRef, useState } from "react"
import { useSocket } from "@/components/socket-provider"
import { useAuth } from "@/hooks/use-auth"

export const useWebRTC = (onRemoteEnd?: () => void) => {
  const { socket } = useSocket()
  const { user } = useAuth()
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const peerConnection = useRef<RTCPeerConnection | null>(null)

  const [error, setError] = useState<string | null>(null)
  
  const config: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  }

  const startCall = async (to: string, video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true })
      setLocalStream(stream)
      setError(null)

    peerConnection.current = new RTCPeerConnection(config)
    stream.getTracks().forEach((track) => peerConnection.current?.addTrack(track, stream))

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("ice-candidate", { to, candidate: event.candidate })
      }
    }

    peerConnection.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0])
      }
    }

      const offer = await peerConnection.current.createOffer()
      await peerConnection.current.setLocalDescription(offer)
      socket?.emit("call-user", { to, offer, from: user?.id || socket?.id, fromName: user?.name || "Someone", isVideo: video })
    } catch (err: any) {
      console.error("Failed to start call:", err)
      setError(err.name === "NotFoundError" ? "Camera or microphone not found." : "Failed to access media devices.")
    }
  }

  const handleIncomingCall = async (data: { from: string; offer: any; isVideo?: boolean }) => {
    try {
      const video = data.isVideo !== false;
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true })
      setLocalStream(stream)
      setError(null)

    peerConnection.current = new RTCPeerConnection(config)
    stream.getTracks().forEach((track) => peerConnection.current?.addTrack(track, stream))

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("ice-candidate", { to: data.from, candidate: event.candidate })
      }
    }

    peerConnection.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0])
      }
    }

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer))
      const answer = await peerConnection.current.createAnswer()
      await peerConnection.current.setLocalDescription(answer)
      socket?.emit("answer-call", { to: data.from, answer })
    } catch (err: any) {
      console.error("Failed to handle incoming call:", err)
      setError(err.name === "NotFoundError" ? "Camera or microphone not found." : "Failed to access media devices.")
    }
  }

  const endCall = (to?: string) => {
    if (to) socket?.emit("end-call", { to });
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setRemoteStream(null);
    setError(null);
  }

  useEffect(() => {
    if (!socket) return

    socket.on("call-answered", async (data: { answer: any }) => {
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer))
    })

    socket.on("ice-candidate", async (data: { candidate: any }) => {
      await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate))
    })

    socket.on("end-call", () => {
      endCall();
      if (onRemoteEnd) onRemoteEnd();
    })

    return () => {
      socket.off("call-answered")
      socket.off("ice-candidate")
      socket.off("end-call")
    }
  }, [socket])

  return {
    localStream,
    remoteStream,
    error,
    startCall,
    handleIncomingCall,
    endCall,
    clearError: () => setError(null)
  }
}
