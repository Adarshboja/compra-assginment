import { motion } from "framer-motion";
import { BrainCircuit, Download, RotateCcw, Sparkles, Undo2, Redo2 } from "lucide-react";
import { useLayoutStore } from "../store/useLayoutStore";
import { downloadJson } from "../utils/layoutUtils";

const Navbar = () => {
  const layout = useLayoutStore((state) => state.layout);
  const undo = useLayoutStore((state) => state.undo);
  const redo = useLayoutStore((state) => state.redo);
  const resetLayout = useLayoutStore((state) => state.resetLayout);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/55 px-5 py-4 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400 text-white shadow-xl shadow-blue-500/25"
          >
            <BrainCircuit size={24} />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Compra AI Layout Agent</h1>
              <Sparkles size={16} className="text-cyan-300" />
            </div>
            <p className="text-xs text-slate-400">Canva-like AI editor for semantic layout transformation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={undo} className="toolbar-button" title="Undo">
            <Undo2 size={17} />
          </button>
          <button onClick={redo} className="toolbar-button" title="Redo">
            <Redo2 size={17} />
          </button>
          <button onClick={resetLayout} className="toolbar-button" title="Reset layout">
            <RotateCcw size={17} />
          </button>
          <button onClick={() => downloadJson(layout)} className="glow-button">
            <Download size={17} />
            Export JSON
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
