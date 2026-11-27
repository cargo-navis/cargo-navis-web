import { toast } from '@/components/ui/toast';

interface ToastProps {
  title: string;
  description?: string;
  /** Defaults: 4 s, errors 8 s (hover pauses). */
  timeout?: number;
}

interface SuccessToastProps extends ToastProps {
  /** A button next to the text, e.g. undo. */
  action?: { label: string; onClick: () => void };
}

/** Returns the toast id, so callers can close it (e.g. from its action). */
export const showSuccessToast = ({ title, description, timeout, action }: SuccessToastProps) => {
  return toast.add({
    type: 'success',
    title,
    description,
    ...(timeout !== undefined && { timeout }),
    ...(action && { actionProps: { children: action.label, onClick: action.onClick } }),
  });
};

export const showErrorToast = ({ title, description, timeout }: ToastProps) => {
  toast.add({ type: 'error', title, description, ...(timeout !== undefined && { timeout }) });
};

export const closeToast = (id: string) => {
  toast.close(id);
};
