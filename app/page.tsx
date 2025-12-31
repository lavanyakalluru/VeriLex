"use client"

import type React from "react"
import { useState, useRef, Suspense } from "react"
import { Plus, Mic, LayoutDashboard, FileText, SendHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function SummarizerContent() {
  const [input, setInput] = useState("")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSummarize = async () => {
    if (!file && !input) return

    setIsSummarizing(true)
    setSummary(null)

    try {
      const formData = new FormData()
      if (file) {
        formData.append("file", file)
      }
      if (input) {
        formData.append("text", input)
      }

      // Note: Assuming API is running on localhost:8000 and the endpoint is /summarize
      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process document")
      }

      const data = await response.json()
      // Expecting { summary: "text" } or just the text if it returns a plain string
      // Adjust this based on actual API response structure
      setSummary(data.summary || data.text || JSON.stringify(data))
    } catch (error) {
      console.error("Error summarizing:", error)
      setSummary("An error occurred while processing your request. Please ensure the API is running.")
    } finally {
      setIsSummarizing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setSummary(null)
    setInput("")
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-[#171717]">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-medium text-muted-foreground">VeriLex v1.0</div>
          </div>
          <div className="flex items-center gap-4">


          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
          {!summary && !isSummarizing ? (
            <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight">How can I help with your document?</h1>

              <div className="grid grid-cols-1 gap-4 text-left max-w-md mx-auto">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group"
                >
                  <h3 className="font-medium mb-1">Upload Document</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a concise summary and legal verification of any document.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl w-full py-12 space-y-8">
              {isSummarizing ? (
                <div className="flex flex-col items-center space-y-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-muted-foreground">Connecting to model and generating summary...</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 leading-relaxed text-lg">
                        {summary}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={reset}
                          className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                        >
                          Clear and restart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 flex justify-center w-full bg-gradient-to-t from-[#171717] via-[#171717] to-transparent">
          <div className="max-w-3xl w-full relative">
            {file && (
              <div className="absolute -top-12 left-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs animate-in slide-in-from-bottom-2">
                <FileText className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => setFile(null)} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="relative flex items-center bg-[#2f2f2f] rounded-[26px] border border-white/10 px-2 py-2 focus-within:border-white/20 transition-all shadow-2xl">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10 shrink-0 h-10 w-10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-6 h-6" />
              </Button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything or upload a document..."
                className="bg-transparent border-0 focus-visible:ring-0 text-lg h-12 py-2"
                onKeyDown={(e) => e.key === "Enter" && handleSummarize()}
              />

              <div className="flex items-center gap-1 pr-1 shrink-0">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 h-10 w-10">
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSummarize}
                  disabled={!file && !input}
                  className={cn(
                    "rounded-full h-10 w-10 p-0 flex items-center justify-center transition-all",
                    file || input
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/10 text-white/30 cursor-not-allowed",
                  )}
                >
                  <SendHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <p className="text-[10px] md:text-xs text-center text-muted-foreground mt-3">
              VeriLex can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DocumentSummarizer() {
  return (
    <Suspense fallback={null}>
      <SummarizerContent />
    </Suspense>
  )
}
