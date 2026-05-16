import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, Group, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import { Download, Grid2X2, Maximize2, Minus, MousePointer2, Plus } from "lucide-react";
import { useLayoutStore } from "../store/useLayoutStore";
import { detectRole, getArtboard, getNodeColor, getRenderableNodes } from "../utils/layoutUtils";

function useCanvasImage(url) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!url) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => setImage(img);
  }, [url]);

  return image;
}

const ImageNode = ({ node, commonProps }) => {
  const image = useCanvasImage(node.data?.sourceUrl);
  return image ? (
    <KonvaImage image={image} {...commonProps} />
  ) : (
    <Rect {...commonProps} fill="#111827" stroke="#334155" dash={[8, 8]} />
  );
};

const CanvasNode = ({ node, isSelected, onSelect, onChange }) => {
  const commonProps = {
    id: node.id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    opacity: node.style?.visual?.opacity ?? 1,
    draggable: true,
    shadowColor: isSelected ? "#38bdf8" : "transparent",
    shadowBlur: isSelected ? 18 : 0,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (event) => {
      onChange({
        x: event.target.x(),
        y: event.target.y(),
      });
    },
    onTransformEnd: (event) => {
      const shape = event.target;
      const scaleX = shape.scaleX();
      const scaleY = shape.scaleY();
      shape.scaleX(1);
      shape.scaleY(1);
      onChange({
        x: shape.x(),
        y: shape.y(),
        width: Math.max(20, shape.width() * scaleX),
        height: Math.max(20, shape.height() * scaleY),
      });
    },
  };

  if (node.type === "text") {
    const visual = node.style?.visual || {};
    const weight = Number(visual.fontWeight) >= 700 ? "bold" : "normal";
    const style = [weight, visual.fontStyle].filter(Boolean).join(" ");

    return (
      <Text
        {...commonProps}
        text={node.data?.content || ""}
        fontSize={visual.fontSize || 32}
        fontFamily={visual.fontFamily || "Arial"}
        fontStyle={style}
        fill={getNodeColor(node, "#ffffff")}
        lineHeight={1.08}
      />
    );
  }

  if (node.type === "image") {
    return <ImageNode node={node} commonProps={commonProps} />;
  }

  if (node.type === "shape") {
    return (
      <Circle
        {...commonProps}
        radius={Math.min(node.width, node.height) / 2}
        x={node.x + node.width / 2}
        y={node.y + node.height / 2}
        fill={node.style?.visual?.fill?.value || "#facc15"}
        stroke={isSelected ? "#38bdf8" : node.style?.visual?.stroke?.value}
        strokeWidth={isSelected ? 4 : node.style?.visual?.strokeWidth || 0}
        onDragEnd={(event) => {
          onChange({
            x: event.target.x() - node.width / 2,
            y: event.target.y() - node.height / 2,
          });
        }}
      />
    );
  }

  return null;
};

const LayoutPreview = () => {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const layout = useLayoutStore((state) => state.layout);
  const selectedNodeId = useLayoutStore((state) => state.selectedNodeId);
  const selectNode = useLayoutStore((state) => state.selectNode);
  const updateNodeById = useLayoutStore((state) => state.updateNodeById);
  const zoom = useLayoutStore((state) => state.zoom);
  const setZoom = useLayoutStore((state) => state.setZoom);
  const setToast = useLayoutStore((state) => state.setToast);

  const artboard = getArtboard(layout);
  const nodes = useMemo(() => getRenderableNodes(layout), [layout]);
  const selectedNode = selectedNodeId ? layout.nodes?.[selectedNodeId] : null;

  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    const selected = stage.findOne(`#${selectedNodeId}`);
    transformerRef.current.nodes(selected ? [selected] : []);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedNodeId, layout]);

  const exportPng = () => {
    try {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "layout-preview.png";
      link.href = uri;
      link.click();
      setToast("PNG downloaded");
    } catch (error) {
      setToast("PNG export blocked by remote image CORS");
    }
  };

  return (
    <section className="panel-card min-h-[850px] overflow-hidden">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MousePointer2 size={17} className="text-cyan-300" />
            <h2 className="text-base font-semibold text-white">Interactive Preview</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Drag, select, resize, or ask the AI to transform the layout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="icon-button" onClick={() => setZoom(zoom - 0.08)} title="Zoom out">
            <Minus size={15} />
          </button>
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button className="icon-button" onClick={() => setZoom(zoom + 0.08)} title="Zoom in">
            <Plus size={15} />
          </button>
          <button className="icon-button" onClick={() => setZoom(0.58)} title="Fit">
            <Maximize2 size={15} />
          </button>
          <button className="glow-button" onClick={exportPng}>
            <Download size={15} />
            PNG
          </button>
        </div>
      </div>

      <div className="relative grid min-h-[740px] place-items-center overflow-auto rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_32%),linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:100%_100%,32px_32px,32px_32px] p-8 shadow-inner shadow-black/40">
        <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-slate-400 backdrop-blur-xl">
          <Grid2X2 size={14} />
          {Math.round(artboard.width)} x {Math.round(artboard.height)}
        </div>

        <div className="rounded-[28px] bg-white/5 p-3 shadow-2xl shadow-cyan-950/40 ring-1 ring-white/10">
          <Stage
            ref={stageRef}
            width={artboard.width * zoom}
            height={artboard.height * zoom}
            scaleX={zoom}
            scaleY={zoom}
            onMouseDown={(event) => {
              if (event.target === event.target.getStage()) {
                selectNode(null);
              }
            }}
            className="overflow-hidden rounded-[22px] bg-white"
          >
            <Layer>
              <Rect width={artboard.width} height={artboard.height} fill={artboard.data?.backgroundColor || "#ffffff"} />
              {nodes.map((node) => (
                <Group key={node.id} name={detectRole(node)}>
                  <CanvasNode
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    onSelect={() => selectNode(node.id)}
                    onChange={(patch) => updateNodeById(node.id, patch)}
                  />
                </Group>
              ))}
              <Transformer
                ref={transformerRef}
                rotateEnabled={false}
                anchorFill="#38bdf8"
                anchorStroke="#ffffff"
                borderStroke="#38bdf8"
                borderDash={[6, 4]}
                enabledAnchors={selectedNode?.type === "shape" ? ["top-left", "top-right", "bottom-left", "bottom-right"] : undefined}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </section>
  );
};

export default LayoutPreview;
