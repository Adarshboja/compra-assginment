export function detectRole(node) {
  const text = node?.data?.content?.toLowerCase?.() || "";
  const name = node?.name?.toLowerCase?.() || "";

  if (node.type === "image" && name.includes("background")) return "background";
  if (node.type === "image") return "product";
  if (node.type === "shape" && name.includes("offer")) return "offerBadge";
  if (text.includes("off") || name.includes("discount")) return "offerText";
  if (name.includes("headline") || text.includes("luxury")) return "headline";
  if (name.includes("subheadline")) return "subheadline";
  if (name.includes("cta") || text.includes("limited")) return "cta";
  return node.type;
}

export function getNodesByRole(layout) {
  const roles = {};

  Object.values(layout?.nodes || {}).forEach((node) => {
    const role = detectRole(node);
    roles[role] = roles[role] || [];
    roles[role].push(node);
  });

  return roles;
}

export function getArtboard(layout) {
  const id = layout?.rootNodes?.[0];
  return layout?.nodes?.[id] || { width: 1080, height: 1080 };
}
