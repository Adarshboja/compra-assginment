import { create } from "zustand";
import initialLayout from "../data/layout.json";
import API from "../services/api";
import { cloneLayout, resizeArtboard, updateNode } from "../utils/layoutUtils";

const initialMessage = {
  id: crypto.randomUUID(),
  sender: "ai",
  text: "I am your AI layout agent. Ask me to convert aspect ratios, move elements, resize text, or refine the composition.",
  createdAt: new Date().toISOString(),
};

export const useLayoutStore = create((set, get) => ({
  layout: initialLayout,
  initialLayout,
  selectedNodeId: null,
  messages: [initialMessage],
  history: [],
  past: [],
  future: [],
  isLoading: false,
  toast: "",
  zoom: 0.58,

  setToast: (toast) => set({ toast }),
  setZoom: (zoom) => set({ zoom: Math.min(1.25, Math.max(0.25, zoom)) }),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),

  commitLayout: (layout, options = {}) => {
    const current = get().layout;
    set({
      layout,
      past: options.skipHistory ? get().past : [...get().past, cloneLayout(current)].slice(-30),
      future: [],
    });
  },

  updateSelectedNode: (patch) => {
    const { layout, selectedNodeId } = get();
    if (!selectedNodeId) return;
    get().commitLayout(updateNode(layout, selectedNodeId, patch));
  },

  updateNodeById: (nodeId, patch) => {
    const { layout } = get();
    get().commitLayout(updateNode(layout, nodeId, patch));
  },

  applyRatio: (ratio) => {
    const next = resizeArtboard(get().layout, ratio);
    get().commitLayout(next);
    set({ toast: `Artboard converted to ${ratio}` });
  },

  undo: () => {
    const { past, layout, future } = get();
    if (!past.length) return;
    const previous = past[past.length - 1];
    set({
      layout: previous,
      past: past.slice(0, -1),
      future: [cloneLayout(layout), ...future].slice(0, 30),
    });
  },

  redo: () => {
    const { future, layout, past } = get();
    if (!future.length) return;
    const next = future[0];
    set({
      layout: next,
      future: future.slice(1),
      past: [...past, cloneLayout(layout)].slice(-30),
    });
  },

  resetLayout: () => {
    const { layout, initialLayout } = get();
    set({
      layout: cloneLayout(initialLayout),
      past: [...get().past, cloneLayout(layout)].slice(-30),
      future: [],
      selectedNodeId: null,
      toast: "Layout reset",
    });
  },

  sendMessage: async (text) => {
    const message = text.trim();
    if (!message || get().isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: message,
      createdAt: new Date().toISOString(),
    };

    set({
      messages: [...get().messages, userMessage],
      isLoading: true,
      toast: "",
    });

    try {
      const response = await API.post("/chat", {
        message,
        layout: get().layout,
        history: get().history,
      });

      const nextLayout = response.data.layout || response.data;
      const assistantText = response.data.reply || "Layout updated. I preserved the design hierarchy and refreshed the JSON.";

      set({
        layout: nextLayout,
        past: [...get().past, cloneLayout(get().layout)].slice(-30),
        future: [],
        messages: [
          ...get().messages,
          {
            id: crypto.randomUUID(),
            sender: "ai",
            text: assistantText,
            createdAt: new Date().toISOString(),
          },
        ],
        history: [
          ...get().history,
          { role: "user", content: message },
          { role: "assistant", content: JSON.stringify(nextLayout) },
        ].slice(-10),
        isLoading: false,
      });
    } catch (error) {
      set({
        messages: [
          ...get().messages,
          {
            id: crypto.randomUUID(),
            sender: "ai",
            text: error?.response?.data?.error || "I could not process that layout instruction.",
            createdAt: new Date().toISOString(),
          },
        ],
        toast: "AI request failed",
        isLoading: false,
      });
    }
  },
}));
