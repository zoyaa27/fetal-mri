import React, { useState } from "react";

export default function AICopilot() {
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hello! I am your Fetal MRI Copilot. Ask me anything about the project plans, clinical protocols, or data templates." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Calls the backend RAG route we set up in Phase 2
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(false);

    try {
      setLoading(true);
      const response = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });
      
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.response || "No response received." }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "ai", text: "Error connecting to the RAG server engine." }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick action button to trigger report drafting automatically
  const triggerAutoDraft = () => {
    setInput("Using the approval template, draft a report for a 24-week scan where the lateral ventricle is 11.5mm.");
  };

  return (
    <div style={{ width: "350px", borderLeft: "1px solid #ccc", display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f9f9f9" }}>
      {/* Header */}
      <div style={{ padding: "16px", borderBottom: "1px solid #ccc", backgroundColor: "#fff" }}>
        <h3 style={{ margin: 0 }}>AI Clinical Copilot</h3>
        <button onClick={triggerAutoDraft} style={{ marginTop: "8px", padding: "4px 8px", cursor: "pointer", fontSize: "12px" }}>
          ⚡ Quick Draft Report
        </button>
      </div>

      {/* Chat History Window */}
      <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            backgroundColor: msg.sender === "user" ? "#0070f3" : "#e5e5ea",
            color: msg.sender === "user" ? "#fff" : "#000",
            padding: "10px",
            borderRadius: "8px",
            maxWidth: "80%",
            fontSize: "14px",
            whiteSpace: "pre-wrap"
          }}>
            {msg.text}
          </div>
        ))}
        {loading && <div style={{ alignSelf: "flex-start", color: "#666", fontSize: "12px" }}>Copilot is analyzing reference data...</div>}
      </div>

      {/* Input Box Area */}
      <div style={{ padding: "16px", borderTop: "1px solid #ccc", backgroundColor: "#fff", display: "flex", gap: "8px" }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask about protocols, charts..." 
          style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button onClick={handleSendMessage} style={{ padding: "8px 12px", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  );
}