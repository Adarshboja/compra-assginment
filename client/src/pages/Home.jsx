import { AnimatePresence, motion } from "framer-motion";
import ChatSidebar from "../components/ChatSidebar";
import InspectorPanel from "../components/InspectorPanel";
import LayoutPreview from "../components/LayoutPreview";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLayoutStore } from "../store/useLayoutStore";

const Home = () => {
  const toast = useLayoutStore((state) => state.toast);

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="aurora-bg" />
      <div className="particle-field" />

      <Navbar />

      <main className="relative z-10 grid gap-5 p-5 xl:grid-cols-[360px_minmax(0,1fr)_390px]">
        <ChatSidebar />
        <LayoutPreview />
        <InspectorPanel />
      </main>

      <Footer />

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-cyan-400/30 bg-slate-950/90 px-5 py-3 text-sm text-cyan-100 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Home;
