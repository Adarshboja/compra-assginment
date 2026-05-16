export const findElementByRole = (
  layout,
  role
) => {

  const nodes = layout.nodes;

  for (const key in nodes) {

    const node = nodes[key];

    if (
      role === 'headline' &&
      node.type === 'text' &&
      node.data?.content?.includes('Luxury')
    ) {
      return node;
    }

    if (
      role === 'offer' &&
      node.type === 'text' &&
      node.data?.content?.includes('OFF')
    ) {
      return node;
    }
  }

  return null;
};
