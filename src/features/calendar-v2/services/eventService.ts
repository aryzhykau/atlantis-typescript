// Lightweight event service wrapper used by mobile calendar UI
// Tries to call a REST endpoint if available, otherwise falls back to a resolved Promise.

export async function deleteEvent(eventId: string, isTemplate = false): Promise<void> {
  if (!eventId) return Promise.reject(new Error('Missing event id'));
  // Choose backend path based on whether this is a template or a real training
  const resource = isTemplate ? 'training_templates' : 'real-trainings';
  try {
    // Try root path first (backend often mounted at root in dev). If 404, try /api/ fallback.
    const primaryResp = await fetch(`/${resource}/${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (primaryResp.ok) return;
    if (primaryResp.status === 404) {
      const fallbackResp = await fetch(`/api/${resource}/${encodeURIComponent(eventId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!fallbackResp.ok) {
        const text = await fallbackResp.text();
        throw new Error(text || `Delete failed with status ${fallbackResp.status}`);
      }
      return;
    }
    const text = await primaryResp.text();
    throw new Error(text || `Delete failed with status ${primaryResp.status}`);
  } catch (err) {
    throw err;
  }
}
