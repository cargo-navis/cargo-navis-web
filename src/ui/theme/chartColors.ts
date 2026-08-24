/**
 * Shared analytics chart palette, so the same metric reads the same colour on the
 * dashboard and on every analytics tab.
 *
 * Regular counts stay in the teal family but a lighter shade than the solid revenue
 * line, so a stacked bar and the line on top of it remain distinguishable.
 */
export const CHART_COLORS = {
  countRegular: { fill: '#7FD4DA55', border: '#3FB4BE' },
  countAgency: { fill: '#FFDDABad', border: '#FFAA4D' },
  revenue: '#13949F',
  cost: '#CC1313',
  margin: '#13A213',
};
