"use client";

import { useEffect, useRef, useState } from "react";
import { useMessenger } from "./messenger-context";
import { useSocket } from "@/components/socket-provider";
import { useAuth } from "@/hooks/use-auth";
import { useWebRTC } from "@/hooks/use-webrtc";
import { CallModal } from "./call-modal";
import { FloatingCallIndicator } from "./floating-call-indicator";
import { toast } from "sonner";
import { apiClient } from "@/services/api-client";

export function CallManager() {
  const { socket } = useSocket();
  const { user: currentUser } = useAuth();
  const { 
    callStatus, callUser, isVideoCall, callIsMinimized,
    acceptCall, declineCall, terminateCall, setCallMinimized,
    receiveCall
  } = useMessenger();

  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { 
    localStream, 
    remoteStream, 
    error: callError, 
    startCall, 
    prepareIncomingCall,
    acceptIncomingCall, 
    endCall, 
    clearError 
  } = useWebRTC(() => {
    terminateCall();
  });

  // Handle Outgoing Call Trigger
  useEffect(() => {
    if (callStatus === "outgoing" && callUser) {
      console.log(`CallManager: Initiating outgoing call to ${callUser.id}`);
      startCall(callUser.id, isVideoCall);
    }
  }, [callStatus, callUser, isVideoCall]);

  // Global Socket Listener for Incoming Calls
  useEffect(() => {
    if (!socket || !currentUser) return;

    const onCallUser = async (data: any) => {
      console.log("CallManager: incoming-call event received", data);
      
      if (callStatus !== "idle") {
        console.log(`CallManager: User busy (current status: ${callStatus}), rejecting call from ${data.from}`);
        socket.emit("call-rejected", { to: data.from, reason: "busy" });
        return;
      }

      // 1. Show UI IMMEDIATELY with provided data to avoid lag
      const initialCaller = { 
        id: data.from, 
        name: data.fromName || "Someone Calling",
        image: data.fromImage
      };
      
      console.log("CallManager: Triggering receiveCall UI");
      receiveCall(initialCaller, data.isVideo !== false);
      prepareIncomingCall(data);

      // 2. Refresh caller details in background if possible
      try {
        const res = await apiClient.get(`/users/${data.from}`);
        const fullCaller = res.data?.data;
        if (fullCaller) {
          console.log("CallManager: Updated caller details from API");
          receiveCall(fullCaller, data.isVideo !== false);
        }
      } catch (err) {
        console.warn("CallManager: Could not fetch caller details, using signaling data", err);
      }
    };

    const onCallAnswered = (data: any) => {
      console.log("CallManager: call-answered received");
      if (callStatus === "outgoing") {
        acceptCall();
      }
    };

    const onCallRejected = (data: any) => {
      console.log("CallManager: call-rejected received", data.reason);
      toast.error(data.reason === "busy" ? "User is busy" : "Call declined");
      terminateCall();
      endCall();
    };

    socket.on("incoming-call", onCallUser);
    socket.on("call-answered", onCallAnswered);
    socket.on("call-rejected", onCallRejected);

    return () => {
      socket.off("incoming-call", onCallUser);
      socket.off("call-answered", onCallAnswered);
      socket.off("call-rejected", onCallRejected);
    };
  }, [socket, currentUser, callStatus, receiveCall, prepareIncomingCall, acceptCall, terminateCall, endCall]);

  // Video Refs sync
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      if (callStatus === "outgoing" || callStatus === "incoming") {
        acceptCall();
      }
    }
  }, [remoteStream, callStatus, acceptCall]);

  // Duration Tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "active" && remoteStream) {
      interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus, remoteStream]);

  // Errors
  useEffect(() => {
    if (callError) {
      toast.error(callError);
      clearError();
      terminateCall();
    }
  }, [callError, clearError, terminateCall]);

  const handleEndCall = () => {
    if (callUser) {
      socket?.emit("call-rejected", { to: callUser.id, reason: "declined" });
      endCall(callUser.id);
    } else {
      endCall();
    }
    terminateCall();
  };

  const handleAccept = async () => {
    console.log("CallManager: Manually accepting call");
    await acceptIncomingCall();
    acceptCall();
  };

  if (callStatus === "idle") return null;

  return (
    <>
      <CallModal
        isOpen={!callIsMinimized}
        status={callStatus === "incoming" ? "incoming" : callStatus === "outgoing" ? "outgoing" : "active"}
        onClose={handleEndCall}
        onAccept={handleAccept}
        onMinimize={() => setCallMinimized(true)}
        remoteUser={callUser}
        isVideo={isVideoCall}
        localStream={localStream}
        remoteStream={remoteStream}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        duration={callDuration}
      />
      <FloatingCallIndicator
        remoteUser={callUser}
        isVisible={callIsMinimized}
        onClick={() => setCallMinimized(false)}
      />
    </>
  );
}
