import { useRef } from 'react';

// This hack is used to fix issue with `react-select`, which breaks focus if used in `radix-ui/dialog`.
// More info: https://github.com/JedWatson/react-select/issues/5882
export function useFormFocusOverride() {
  const formRef = useRef<HTMLFormElement>(null);

  function handleTabChange(event: any) {
    if (event.key !== 'Tab') return;

    event.preventDefault();

    // Get all focusable elements within the modal
    const focusableElements: any = formRef.current?.querySelectorAll(
      'button:not([class*="mantine"]), [href], input:not([type="hidden"]), input#react-select, select, textarea, [tabindex]:not([tabindex="-1"]):not(:disabled)'
    );
    const firstFocusableElement = focusableElements?.[0];
    const lastFocusableElement = focusableElements?.[focusableElements.length - 1];

    // console.log(focusableElements);

    // If the shift key is pressed and the first element is focused, move focus to the last element
    if (event.shiftKey && document.activeElement === firstFocusableElement) {
      lastFocusableElement?.focus();
      return;
    }

    // If the shift key is not pressed and the last element is focused, move focus to the first element
    if (!event.shiftKey && document.activeElement === lastFocusableElement) {
      firstFocusableElement?.focus();
      return;
    }

    // Otherwise, move focus to the next element
    const direction = event.shiftKey ? -1 : 1;
    const index = Array.prototype.indexOf.call(focusableElements, document.activeElement);
    const nextElement = focusableElements?.[index + direction];

    if (nextElement) {
      setTimeout(() => nextElement?.focus(), 0);
    }
  }

  return { formRef, handleTabChange };
}

// This hack is used to fix issue with `react-select` which triggers `onMenuClose` on blur even when menu is closed.
// More info: https://github.com/JedWatson/react-select/issues/4623
export function usePostalCodeFieldFocusOverride() {
  const postalCodeFieldRef = useRef<any>(null);

  const menuWasOpenRef = useRef(false);

  const handleMenuOpen = () => {
    menuWasOpenRef.current = true;
  };

  const handleMenuClose = () => {
    if (menuWasOpenRef.current) {
      menuWasOpenRef.current = false;
      // Restore focus to the select input after menu closes
      setTimeout(() => {
        const selectInput = postalCodeFieldRef.current?.inputRef;
        if (selectInput && document.activeElement !== selectInput) {
          selectInput.focus();
        }
      }, 0);
    }
  };

  return { postalCodeFieldRef, handleMenuOpen, handleMenuClose };
}
