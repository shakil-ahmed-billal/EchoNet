import { useEffect, useRef, useState } from "react"
import { useSocket } from "@/components/socket-provider"
import { useAuth } from "@/hooks/use-auth"

export const useWebRTC = (onRemoteEnd?: () => void) => {
  const { socket } = useSocket()
  const { user } = useAuth()
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const incomingData = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const pendingCandidates = useRef<RTCIceCandidate[]>([])

  const config: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  }

  const processPendingCandidates = async () => {
    if (peerConnection.current?.remoteDescription) {
      console.log(`WebRTC: Processing ${pendingCandidates.current.length} queued ICE candidates`);
      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();
        if (candidate) {
          try {
            await peerConnection.current.addIceCandidate(candidate);
          } catch (e) {
            console.warn("WebRTC: Error adding queued candidate", e);
          }
        }
      }
    }
  }

  const startCall = async (to: string, video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true })
      setLocalStream(stream)
      setError(null)
      pendingCandidates.current = [];

      peerConnection.current = new RTCPeerConnection(config)
      
      // Monitor connection state
      peerConnection.current.onconnectionstatechange = () => {
        console.log(`WebRTC: Connection State: ${peerConnection.current?.connectionState}`);
      }

      stream.getTracks().forEach((track) => peerConnection.current?.addTrack(track, stream))

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("ice-candidate", { to, candidate: event.candidate })
        }
      }

      peerConnection.current.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          console.log("WebRTC: Remote stream received");
          setRemoteStream(event.streams[0])
        }
      }

      const offer = await peerConnection.current.createOffer()
      await peerConnection.current.setLocalDescription(offer)
      socket?.emit("call-user", { to, offer, from: user?.id || socket?.id, fromName: user?.name || "Someone", fromImage: user?.image || (user as any)?.avatarUrl, isVideo: video })
    } catch (err: any) {
      console.error("WebRTC: Failed to start call:", err)
      setError(err.name === "NotFoundError" ? "Camera or microphone not found." : "Failed to access media devices.")
    }
  }

  const prepareIncomingCall = (data: any) => {
    incomingData.current = data;
  }

  const acceptIncomingCall = async () => {
    if (!incomingData.current) return;
    const data = incomingData.current;
    
    try {
      const video = data.isVideo !== false;
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true })
      setLocalStream(stream)
      setError(null)
      pendingCandidates.current = [];

      peerConnection.current = new RTCPeerConnection(config)
      
      peerConnection.current.onconnectionstatechange = () => {
        console.log(`WebRTC: Connection State: ${peerConnection.current?.connectionState}`);
      }

      stream.getTracks().forEach((track) => peerConnection.current?.addTrack(track, stream))

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("ice-candidate", { to: data.from, candidate: event.candidate })
        }
      }

      peerConnection.current.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          console.log("WebRTC: Remote stream received (incoming)");
          setRemoteStream(event.streams[0])
        }
      }

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer))
      await processPendingCandidates();

      const answer = await peerConnection.current.createAnswer()
      await peerConnection.current.setLocalDescription(answer)
      socket?.emit("answer-call", { to: data.from, answer })
    } catch (err: any) {
      console.error("WebRTC: Failed to accept incoming call:", err)
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
    incomingData.current = null;
    pendingCandidates.current = [];
  }

  useEffect(() => {
    if (!socket) return

    socket.on("call-answered", async (data: { answer: any }) => {
      if (peerConnection.current) {
        console.log("WebRTC: Call answered, setting remote description");
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        await processPendingCandidates();
      }
    })

    socket.on("ice-candidate", async (data: { candidate: any }) => {
      const candidate = new RTCIceCandidate(data.candidate);
      if (peerConnection.current?.remoteDescription) {
        try {
          await peerConnection.current.addIceCandidate(candidate);
        } catch (e) {
          console.warn("WebRTC: Error adding live ice candidate", e);
        }
      } else {
        console.log("WebRTC: Queuing ICE candidate (remote description not set yet)");
        pendingCandidates.current.push(candidate);
      }
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
    prepareIncomingCall,
    acceptIncomingCall,
    endCall,
    clearError: () => setError(null)
  }
}
