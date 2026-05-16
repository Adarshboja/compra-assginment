import ReactJson from "react-json-view";
import { Copy, Download } from "lucide-react";
import { copyJson, downloadJson } from "../utils/layoutUtils";

const JsonViewer = ({ data, onToast }) => {
  const handleCopy = async () => {
    await copyJson(data);
    onToast("JSON copied");
  };

  return (
    <div className="panel-card h-[360px] overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Live JSON</h2>
          <p className="text-xs text-slate-500">Synced with canvas and AI edits</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="icon-button" title="Copy JSON">
            <Copy size={15} />
          </button>
          <button onClick={() => downloadJson(data)} className="icon-button" title="Download JSON">
            <Download size={15} />
          </button>
        </div>
      </div>
      <div className="h-[280px] overflow-auto rounded-2xl border border-white/10 bg-slate-950/70 p-2">
        <ReactJson
          src={data}
          theme="monokai"
          collapsed={2}
          enableClipboard={false}
          displayDataTypes={false}
          name={false}
        />
      </div>
    </div>
  );
};

export default JsonViewer;
