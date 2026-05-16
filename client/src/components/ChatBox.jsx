import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, SendHorizontal, Sparkles } from "lucide-react";

const ChatBox = ({ onSend, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event?.preventDefault();
    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 mt-4 border-t border-white/10 bg-slate-950/70 pt-4 backdrop-blur-xl">
      <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.07] p-2 shadow-2xl shadow-blue-950/30">
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
          title="Voice input"
        >
          <Mic size={18} />
        </button>

        <input
          type="text"
          placeholder="Ask: convert to 9:16, center product, make headline smaller..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-slate-500"
        />

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={disabled || !message.trim()}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 transition disabled:cursor-not-allowed disabled:opacity-50"
          title="Send"
        >
          {disabled ? <Sparkles size={18} className="animate-pulse" /> : <SendHorizontal size={18} />}
        </motion.button>
      </div>
    </form>
  );
};

export default ChatBox;
