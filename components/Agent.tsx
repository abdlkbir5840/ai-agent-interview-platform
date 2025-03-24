"use client"

import { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CameraOff, Phone, PhoneOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { vapi } from "@/lib/vapi.sdk"
import { Switch } from "@/components/ui/switch"
import { interviewer } from "@/constants"
import { createFeedback } from "@/lib/actions/generale.action"

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant"
  content: string
}

export default function Agent({ userName, userId, type, interviewId, questions }: AgentProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false)
  const router = useRouter()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
  const [messages, setMessages] = useState<SavedMessage[]>([])

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE)
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED)
    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript }
        setMessages((prevMessages) => [...prevMessages, newMessage])
      }
    }
    const onSpeechStart = () => setIsSpeaking(true)
    const onSpeechEnd = () => setIsSpeaking(false)
    const onError = (error: Error) => console.log("Error", error)

    vapi.on("call-start", onCallStart)
    vapi.on("call-end", onCallEnd)
    vapi.on("message", onMessage)
    vapi.on("speech-start", onSpeechStart)
    vapi.on("speech-end", onSpeechEnd)
    vapi.on("error", onError)

    return () => {
      vapi.off("call-start", onCallStart)
      vapi.off("call-end", onCallEnd)
      vapi.off("message", onMessage)
      vapi.off("speech-start", onSpeechStart)
      vapi.off("speech-end", onSpeechEnd)
      vapi.off("error", onError)
    }
  }, [])
const handleGenerateFeedback = async (messages: SavedMessage[]) => {
console.log("Generating feedback here..."); 
const {success, feedbackId: id} = await createFeedback({
  interviewId: interviewId!,
  userId: userId!,
  transcript: messages
})
if(success && id){
  router.push(`/interview/${interviewId}/feedback`)
} else {
  console.log("Failed to generate feedback.");
  router.push('/')
}
}
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED){
      if(type === 'generate'){
        router.push("/")
      }else{
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId, router])

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING)
    if(type === 'generate'){
      console.log("Workflow ID:", process.env.NEXT_PUBLIC_VAPI_WORFLOW_ID);
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      })
    }else{
      let formatedQuestions = ''
      if(questions){
        formatedQuestions = questions.map(q => `-${q}`).join('\n')
      }
      await vapi.start(interviewer,
        {
          variableValues: {
            questions: formatedQuestions,
          },
        }
      )
    }
  }

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED)
    vapi.stop()
  }

  const latestMessage = messages[messages.length - 1]?.content
  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED

  return (
    <div className="mx-auto max-w-5xl w-full p-4">
      {/* Updated grid layout to ensure equal width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Interviewer Card */}
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md bg-black text-white">
          <div className="aspect-video flex flex-col items-center justify-center">
            <div className="relative mb-4 items-center justify-cente">
              {/* Speaking animation effect */}
              {isSpeaking && (
                <span className="absolute inline-flex size-6/6 animate-ping rounded-full bg-primary-200 opacity-75"></span>
              )}
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center relative">
                <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
              </div>
            </div>
            <h3 className="text-xl font-medium">AI Interviewer</h3>
          </div>
        </div>

        {/* User Camera Card - Enhanced Header */}
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md bg-white">
          {/* Enhanced header styling */}
          <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
            <h3 className="font-medium text-gray-700 text-lg">{userName}</h3>
            <div className="flex items-center gap-3 bg-dark-100 px-3 py-1.5 rounded-full">
              <Switch
                checked={isCameraOn}
                onCheckedChange={setIsCameraOn}
                id="camera-toggle"
                className="data-[state=checked]:bg-blue-500"
              />
              <label
                htmlFor="camera-toggle"
                className={cn(
                  "text-xs font-bold cursor-pointer transition-colors",
                  isCameraOn ? "text-blue-600" : "text-yellow-500",
                )}
              >
                {isCameraOn ? "On" : "Off"}
              </label>
            </div>
          </div>
          <div className="w-full aspect-video bg-black">
            {isCameraOn ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                className="w-full h-full object-cover transform scale-x-[-1]"
                mirrored={false} // Disable mirroring
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                  <CameraOff className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">Camera is turned off</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transcript Area */}
      {messages.length > 0 && (
        <div className="border rounded-lg shadow-md overflow-hidden mt-4">
          <div className="p-4 max-h-32 overflow-y-auto">
            <p key={latestMessage} className="transition-opacity duration-300 animate-[fadeIn_0.5s_ease-in-out]">
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="flex flex-col items-center gap-2 mt-6">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            className={cn(
              "flex items-center justify-center gap-2 py-3 px-8 rounded-full text-white font-medium transition-all",
              callStatus === CallStatus.CONNECTING
                ? "bg-amber-400 cursor-not-allowed"
                : "bg-amber-400 hover:bg-amber-500",
            )}
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            <Phone className="w-4 h-4" />
            <span>{isCallInactiveOrFinished ? "Call" : "Connecting..."}</span>
          </button>
        ) : (
          <button
            className="flex items-center justify-center gap-2 py-3 px-8 rounded-full text-white font-medium transition-all bg-red-500 hover:bg-red-600"
            onClick={handleDisconnect}
          >
            <PhoneOff className="w-4 h-4" />
            <span>End</span>
          </button>
        )}

        {/* Status indicator */}
        {callStatus === CallStatus.CONNECTING && (
          <div className="text-sm text-gray-600 mt-1">
            Status: <span className="text-amber-500 font-medium">Connecting...</span>
          </div>
        )}
      </div>
    </div>
  )
}

