import type { AlertType } from './alerts';

export interface Alert {
  id: string;
  ruleName: AlertType;
  alertable: any;
  createdAt: string;
  updatedAt: string;
}
