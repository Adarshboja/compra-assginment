import { getArtboard, getNodesByRole } from "./semanticRoles.js";

const RATIOS = {
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
};

const COLORS = {
  black: "#000000",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#facc15",
  purple: "#8b5cf6",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  pink: "#ec4899",
  orange: "#f97316",
  gray: "#64748b",
  grey: "#64748b",
};

export function cloneLayout(layout) {
  return JSON.parse(JSON.stringify(layout));
}

export function updateNormalizedCoordinates(layout) {
  const artboard = getArtboard(layout);

  Object.values(layout.nodes || {}).forEach((node) => {
    if (node.type === "artboard") return;
    node.nx = node.x / artboard.width;
    node.ny = node.y / artboard.height;
    node.nw = node.width / artboard.width;
    node.nh = node.height / artboard.height;
  });

  return layout;
}

export function moveNode(node, x, y) {
  node.x = x;
  node.y = y;
  return node;
}

export function resizeNode(node, width, height) {
  node.width = width;
  node.height = height;
  return node;
}

export function alignNode(node, artboard, align = "center") {
  if (align === "center") {
    node.x = (artboard.width - node.width) / 2;
  }

  if (align === "middle") {
    node.y = (artboard.height - node.height) / 2;
  }

  return node;
}

function extractColor(message) {
  const lower = message.toLowerCase();
  const hex = lower.match(/#[0-9a-f]{3,8}\b/i);

  if (hex) {
    return hex[0];
  }

  return Object.entries(COLORS).find(([name]) => lower.includes(name))?.[1] || null;
}

function ensureVisual(node) {
  node.style = node.style || {};
  node.style.visual = node.style.visual || {};
  return node.style.visual;
}

function setNodeColor(node, color) {
  const visual = ensureVisual(node);

  if (node.type === "shape") {
    visual.fill = { type: "solid", value: color };
    visual.stroke = { type: "solid", value: color };
    return;
  }

  if (node.type === "text") {
    visual.color = { type: "solid", value: color };
  }
}

function moveByKeywords(node, lower, artboard) {
  const step = Math.max(60, Math.round(artboard.height * 0.08));

  if (lower.includes("top")) node.y = artboard.height * 0.08;
  if (lower.includes("bottom")) node.y = artboard.height - node.height - artboard.height * 0.08;
  if (lower.includes("higher") || lower.includes(" up") || lower.includes("move up")) node.y = Math.max(20, node.y - step);
  if (lower.includes("lower") || lower.includes(" down") || lower.includes("move down")) node.y = Math.min(artboard.height - node.height - 20, node.y + step);
  if (lower.includes("left")) node.x = Math.max(20, node.x - step);
  if (lower.includes("right")) node.x = Math.min(artboard.width - node.width - 20, node.x + step);
  if (lower.includes("center") || lower.includes("centre")) alignNode(node, artboard, "center");
  if (lower.includes("middle")) alignNode(node, artboard, "middle");
}

function resizeByKeywords(node, lower, artboard) {
  const scale = lower.includes("smaller") || lower.includes("small") ? 0.88 : 1.12;

  if (
    lower.includes("smaller") ||
    lower.includes("small") ||
    lower.includes("larger") ||
    lower.includes("bigger") ||
    lower.includes("large")
  ) {
    if (node.type === "text") {
      const visual = ensureVisual(node);
      visual.fontSize = Math.max(14, Math.round((visual.fontSize || 32) * scale));
      return;
    }

    const ratio = node.height / node.width || 1;
    node.width = Math.min(artboard.width * 0.92, Math.max(40, node.width * scale));
    node.height = node.width * ratio;
  }
}

function includesAny(lower, words) {
  return words.some((word) => lower.includes(word));
}

export function resizeArtboard(layout, ratioKey) {
  const target = RATIOS[ratioKey] || RATIOS["1:1"];
  const artboard = getArtboard(layout);
  const oldWidth = artboard.width;
  const oldHeight = artboard.height;

  artboard.width = target.width;
  artboard.height = target.height;

  Object.values(layout.nodes || {}).forEach((node) => {
    if (node.type === "artboard") return;
    node.x = (node.nx ?? node.x / oldWidth) * target.width;
    node.y = (node.ny ?? node.y / oldHeight) * target.height;
    node.width = (node.nw ?? node.width / oldWidth) * target.width;
    node.height = (node.nh ?? node.height / oldHeight) * target.height;
  });

  artboard.data = {
    ...artboard.data,
    preset: ratioKey,
  };

  return rebalanceLayout(layout);
}

export function rebalanceLayout(layout) {
  const artboard = getArtboard(layout);
  const roles = getNodesByRole(layout);
  const headline = roles.headline?.[0];
  const subheadline = roles.subheadline?.[0];
  const product = roles.product?.[0];
  const offerBadge = roles.offerBadge?.[0];
  const offerText = roles.offerText?.[0];
  const cta = roles.cta?.[0];

  if (headline) {
    headline.x = artboard.width * 0.11;
    headline.y = artboard.height > artboard.width ? artboard.height * 0.08 : artboard.height * 0.15;
    headline.width = artboard.width * 0.78;
    headline.style.visual.fontSize = Math.min(headline.style.visual.fontSize || 72, artboard.height > artboard.width ? 78 : 72);
  }

  if (subheadline) {
    subheadline.x = artboard.width * 0.18;
    subheadline.y = headline ? headline.y + headline.height * 0.42 : artboard.height * 0.28;
    subheadline.width = artboard.width * 0.7;
  }

  if (product) {
    product.width = artboard.width * 0.76;
    product.height = product.width * 0.41;
    product.x = (artboard.width - product.width) / 2;
    product.y = artboard.height > artboard.width ? artboard.height * 0.55 : artboard.height * 0.53;
  }

  if (offerBadge) {
    offerBadge.x = artboard.width * 0.1;
    offerBadge.y = artboard.height > artboard.width ? artboard.height * 0.36 : artboard.height * 0.4;
  }

  if (offerText && offerBadge) {
    offerText.x = offerBadge.x + offerBadge.width * 0.17;
    offerText.y = offerBadge.y + offerBadge.height * 0.08;
  }

  if (cta) {
    cta.x = artboard.width * 0.32;
    cta.y = artboard.height * 0.89;
  }

  return updateNormalizedCoordinates(layout);
}

export function applyDeterministicInstruction(message, layout) {
  const next = cloneLayout(layout);
  const lower = message.toLowerCase();
  const artboard = getArtboard(next);
  const roles = getNodesByRole(next);
  const headline = roles.headline?.[0];
  const subheadline = roles.subheadline?.[0];
  const product = roles.product?.[0];
  const background = roles.background?.[0];
  const offerBadge = roles.offerBadge?.[0];
  const offerText = roles.offerText?.[0];
  const cta = roles.cta?.[0];
  const color = extractColor(message);

  if (lower.includes("9:16")) resizeArtboard(next, "9:16");
  if (lower.includes("16:9")) resizeArtboard(next, "16:9");
  if (lower.includes("4:5")) resizeArtboard(next, "4:5");
  if (lower.includes("1:1")) resizeArtboard(next, "1:1");

  if (color && includesAny(lower, ["background", "bg", "backround", "bacground"])) {
    artboard.data = {
      ...artboard.data,
      backgroundColor: color,
    };

    if (background) {
      ensureVisual(background).opacity = lower.includes("solid") || lower.includes("plain") ? 0 : 0.24;
    }
  }

  if (headline && includesAny(lower, ["headline", "heading", "title"])) {
    moveByKeywords(headline, lower, artboard);
    resizeByKeywords(headline, lower, artboard);
    if (color) setNodeColor(headline, color);
  }

  if (subheadline && includesAny(lower, ["subheadline", "subtitle", "tagline"])) {
    moveByKeywords(subheadline, lower, artboard);
    resizeByKeywords(subheadline, lower, artboard);
    if (color) setNodeColor(subheadline, color);
  }

  if (product && includesAny(lower, ["product", "sofa", "image", "main image"])) {
    moveByKeywords(product, lower, artboard);
    resizeByKeywords(product, lower, artboard);

    if (lower.includes("center") || lower.includes("centre")) {
      alignNode(product, artboard, "center");
      if (lower.includes("middle")) alignNode(product, artboard, "middle");
    }
  }

  if ((offerBadge || offerText) && includesAny(lower, ["offer", "badge", "discount", "off"])) {
    if (offerBadge) {
      moveByKeywords(offerBadge, lower, artboard);
      resizeByKeywords(offerBadge, lower, artboard);
      if (color) setNodeColor(offerBadge, color);
    }

    if (offerText) {
      moveByKeywords(offerText, lower, artboard);
      resizeByKeywords(offerText, lower, artboard);
      if (color && lower.includes("text")) setNodeColor(offerText, color);
    }
  }

  if (cta && includesAny(lower, ["cta", "limited", "button", "offer text"])) {
    moveByKeywords(cta, lower, artboard);
    resizeByKeywords(cta, lower, artboard);
    if (color) setNodeColor(cta, color);
  }

  return updateNormalizedCoordinates(next);
}
