import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, MessageSquareText, WandSparkles } from "lucide-react";
import ChatBox from "./ChatBox";
import MessageBubble from "./MessageBubble";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useLayoutStore } from "../store/useLayoutStore";

const suggestions = [
  "Convert this design to 9:16",
  "Move headline to the top",
  "Make the headline smaller",
  "Move offer badge higher",
  "Center the product",
  "Change headline color to red",
];

const ChatSidebar = () => {
  const messages = useLayoutStore((state) => state.messages);
  const isLoading = useLayoutStore((state) => state.isLoading);
  const sendMessage = useLayoutStore((state) => state.sendMessage);
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  return (
    <section className="panel-card flex h-[850px] flex-col p-0">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20">
            <Bot size={21} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Chat</h2>
            <p className="text-xs text-slate-500">Context-aware layout commands</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-auto p-5">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-cyan-200">
            <Loader2 size={16} className="animate-spin" />
            AI is rebalancing the composition...
          </motion.div>
        ) : null}
      </div>

      <div className="px-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          <WandSparkles size={13} />
          Suggested prompts
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-left text-xs text-slate-300 transition hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-100"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <MessageSquareText size={13} />
          Follow-up memory enabled
        </div>
        <ChatBox onSend={sendMessage} disabled={isLoading} />
      </div>
    </section>
  );
};

export default ChatSidebar;
