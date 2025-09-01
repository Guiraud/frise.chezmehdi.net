
// Configuration Vis-Timeline
export const visTimelineConfig = {
  orientation: 'top',
  stack: true,
  showCurrentTime: true,
  zoomable: true,
  moveable: true
};

export function initVisTimeline(container, items, options) {
  const timeline = new Timeline(container, items, { ...visTimelineConfig, ...options });
  return timeline;
}
