export const ASPECT_RATIOS = {
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
};

export function cloneLayout(layout) {
  return JSON.parse(JSON.stringify(layout));
}

export function getArtboard(layout) {
  const id = layout?.rootNodes?.[0];
  return layout?.nodes?.[id] || { width: 1080, height: 1080 };
}

export function getRenderableNodes(layout) {
  const artboardId = layout?.rootNodes?.[0];
  return Object.values(layout?.nodes || {}).filter((node) => node.id !== artboardId);
}

export function getNodeColor(node, fallback = "#ffffff") {
  return node?.style?.visual?.color?.value || node?.style?.visual?.fill?.value || fallback;
}

export function detectRole(node) {
  const text = node?.data?.content?.toLowerCase?.() || "";
  const name = node?.name?.toLowerCase?.() || "";

  if (node.type === "image" && name.includes("background")) return "background";
  if (node.type === "image") return "product image";
  if (node.type === "shape" && name.includes("offer")) return "offer badge";
  if (text.includes("off") || name.includes("discount")) return "offer text";
  if (name.includes("headline") || text.includes("luxury")) return "headline";
  if (name.includes("subheadline")) return "subheadline";
  if (name.includes("cta") || text.includes("limited")) return "cta";
  return node.type;
}

export function updateNormalizedCoordinates(layout) {
  const next = cloneLayout(layout);
  const artboard = getArtboard(next);

  Object.values(next.nodes || {}).forEach((node) => {
    if (!node || node.type === "artboard") return;

    node.nx = node.x / artboard.width;
    node.ny = node.y / artboard.height;
    node.nw = node.width / artboard.width;
    node.nh = node.height / artboard.height;
  });

  return next;
}

export function updateNode(layout, nodeId, patch) {
  const next = cloneLayout(layout);

  if (!next.nodes?.[nodeId]) {
    return layout;
  }

  next.nodes[nodeId] = {
    ...next.nodes[nodeId],
    ...patch,
  };

  return updateNormalizedCoordinates(next);
}

export function resizeArtboard(layout, ratioKey) {
  const target = ASPECT_RATIOS[ratioKey] || ASPECT_RATIOS["1:1"];
  const next = cloneLayout(layout);
  const artboard = getArtboard(next);
  const oldWidth = artboard.width;
  const oldHeight = artboard.height;

  artboard.width = target.width;
  artboard.height = target.height;

  Object.values(next.nodes || {}).forEach((node) => {
    if (node.type === "artboard") return;

    node.x = (node.nx ?? node.x / oldWidth) * target.width;
    node.y = (node.ny ?? node.y / oldHeight) * target.height;
    node.width = (node.nw ?? node.width / oldWidth) * target.width;
    node.height = (node.nh ?? node.height / oldHeight) * target.height;
  });

  return updateNormalizedCoordinates(next);
}

export function getLayoutStats(layout) {
  const nodes = getRenderableNodes(layout);
  const artboard = getArtboard(layout);

  return {
    nodes: nodes.length,
    text: nodes.filter((node) => node.type === "text").length,
    images: nodes.filter((node) => node.type === "image").length,
    shapes: nodes.filter((node) => node.type === "shape").length,
    size: `${Math.round(artboard.width)} x ${Math.round(artboard.height)}`,
  };
}

export function downloadJson(data, filename = "layout.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function copyJson(data) {
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
}
