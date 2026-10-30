// Monkey-patch Node.prototype.removeChild and Node.prototype.insertBefore
// to gracefully handle DOM manipulations caused by Google Translate or browser extensions.
if (typeof window !== "undefined" && typeof Node === "function" && Node.prototype && !window.__dom_translate_patched) {
  window.__dom_translate_patched = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (typeof console !== "undefined" && console.debug) {
        console.debug("Ignored removeChild: child is not a direct child of this node (handled for Google Translate / 3rd party DOM mutations)", child, this);
      }
      if (child.parentNode) {
        return child.parentNode.removeChild(child);
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (typeof console !== "undefined" && console.debug) {
        console.debug("Ignored insertBefore: referenceNode is not a direct child of this node (handled for Google Translate / 3rd party DOM mutations)", referenceNode, this);
      }
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode);
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}
