import { motion } from "framer-motion";

function formatTime(value) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-3 shadow-2xl ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-blue-500/20"
            : "border border-white/10 bg-white/10 text-slate-100 backdrop-blur-xl"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
        <span className={`mt-2 block text-[10px] ${isUser ? "text-blue-100" : "text-slate-400"}`}>
          {formatTime(message.createdAt)}
        </span>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
