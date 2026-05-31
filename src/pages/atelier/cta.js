// Dispatch the global lead-form event. Any CTA on the Atelier page calls this.
export function openLead(pkg) {
  try {
    window.dispatchEvent(new CustomEvent("open-lead-form", { detail: { pkg: pkg || "" } }));
  } catch {}
}
