import { AlignCenter, Box, Braces, Palette, Type } from "lucide-react";
import { useLayoutStore } from "../store/useLayoutStore";
import { detectRole, getLayoutStats, getNodeColor, getRenderableNodes } from "../utils/layoutUtils";
import JsonViewer from "./JsonViewer";

const fieldClass = "w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400/60";

const InspectorPanel = () => {
  const layout = useLayoutStore((state) => state.layout);
  const selectedNodeId = useLayoutStore((state) => state.selectedNodeId);
  const selectNode = useLayoutStore((state) => state.selectNode);
  const updateSelectedNode = useLayoutStore((state) => state.updateSelectedNode);
  const setToast = useLayoutStore((state) => state.setToast);
  const applyRatio = useLayoutStore((state) => state.applyRatio);
  const selected = selectedNodeId ? layout.nodes?.[selectedNodeId] : null;
  const nodes = getRenderableNodes(layout);
  const stats = getLayoutStats(layout);

  const updateNumber = (key, value) => {
    updateSelectedNode({ [key]: Number(value) || 0 });
  };

  const updateFontSize = (value) => {
    if (!selected) return;
    updateSelectedNode({
      style: {
        ...selected.style,
        visual: {
          ...selected.style?.visual,
          fontSize: Number(value) || 12,
        },
      },
    });
  };

  const updateColor = (value) => {
    if (!selected) return;
    updateSelectedNode({
      style: {
        ...selected.style,
        visual: {
          ...selected.style?.visual,
          color: selected.type === "text" ? { type: "solid", value } : selected.style?.visual?.color,
          fill: selected.type === "shape" ? { type: "solid", value } : selected.style?.visual?.fill,
        },
      },
    });
  };

  return (
    <aside className="space-y-4">
      <section className="panel-card">
        <div className="mb-4 flex items-center gap-2">
          <Braces size={17} className="text-violet-300" />
          <h2 className="text-sm font-semibold text-white">Inspector</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => applyRatio("1:1")} className="mini-card">1:1</button>
          <button onClick={() => applyRatio("9:16")} className="mini-card">9:16</button>
          <button onClick={() => applyRatio("16:9")} className="mini-card">16:9</button>
          <button onClick={() => applyRatio("4:5")} className="mini-card">4:5</button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="stat-card"><span>Nodes</span><strong>{stats.nodes}</strong></div>
          <div className="stat-card"><span>Canvas</span><strong>{stats.size}</strong></div>
          <div className="stat-card"><span>Text</span><strong>{stats.text}</strong></div>
          <div className="stat-card"><span>Media</span><strong>{stats.images + stats.shapes}</strong></div>
        </div>
      </section>

      <section className="panel-card">
        <div className="mb-4 flex items-center gap-2">
          <Box size={17} className="text-cyan-300" />
          <h2 className="text-sm font-semibold text-white">Element Hierarchy</h2>
        </div>
        <div className="max-h-[210px] space-y-2 overflow-auto">
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => selectNode(node.id)}
              className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                selectedNodeId === node.id
                  ? "border-cyan-400/70 bg-cyan-400/10 text-cyan-100"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium">{node.name || node.id}</span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-slate-400">{detectRole(node)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="mb-4 flex items-center gap-2">
          <Palette size={17} className="text-teal-300" />
          <h2 className="text-sm font-semibold text-white">Node Properties</h2>
        </div>

        {selected ? (
          <div className="space-y-4">
            <div>
              <label className="label">Selected</label>
              <p className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">{selected.name || selected.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">X</label><input className={fieldClass} value={Math.round(selected.x)} onChange={(e) => updateNumber("x", e.target.value)} /></div>
              <div><label className="label">Y</label><input className={fieldClass} value={Math.round(selected.y)} onChange={(e) => updateNumber("y", e.target.value)} /></div>
              <div><label className="label">W</label><input className={fieldClass} value={Math.round(selected.width)} onChange={(e) => updateNumber("width", e.target.value)} /></div>
              <div><label className="label">H</label><input className={fieldClass} value={Math.round(selected.height)} onChange={(e) => updateNumber("height", e.target.value)} /></div>
            </div>
            {selected.type === "text" ? (
              <div>
                <label className="label flex items-center gap-2"><Type size={13} /> Font size</label>
                <input className={fieldClass} value={selected.style?.visual?.fontSize || 24} onChange={(e) => updateFontSize(e.target.value)} />
              </div>
            ) : null}
            {(selected.type === "text" || selected.type === "shape") ? (
              <div>
                <label className="label">Color</label>
                <input type="color" value={getNodeColor(selected, "#ffffff")} onChange={(e) => updateColor(e.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] p-1" />
              </div>
            ) : null}
            <button
              onClick={() => {
                updateSelectedNode({ x: 540 - selected.width / 2 });
                setToast("Node centered horizontally");
              }}
              className="glow-button w-full justify-center"
            >
              <AlignCenter size={15} />
              Center horizontally
            </button>
          </div>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
            Select an element on the canvas to edit size, position, typography, and color.
          </p>
        )}
      </section>

      <JsonViewer data={layout} onToast={setToast} />
    </aside>
  );
};

export default InspectorPanel;
