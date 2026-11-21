import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Decided (KAN-55, /overlays/badge): one Badge for every pill. tone × look × size; default neutral · soft · md.
 * Colour = meaning: success done, info in progress, warning to do, danger late / failed, neutral types and counts,
 * brand new / ours, category a kind of thing (Agencijski = category + IconBriefcase). Soft = tint + border one step
 * darker. Sentence case, pill shape, optional leading Tabler icon, no emoji. Types (vehicle, occupation) = neutral
 * outline; on / off states = look "dot".
 *
 * `variant` keeps the stock shadcn looks for old lab pages; new code uses `tone` / `look`.
 */

const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'danger', 'category'] as const;
type BadgeTone = (typeof TONES)[number];

const SOFT: Record<BadgeTone, string> = {
  neutral: 'border-border bg-muted text-foreground/80',
  brand: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
  info: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
  success: 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300',
  warning: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  danger: 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
  category:
    'border-agency-300 bg-agency-50 text-agency-700 dark:border-agency-800 dark:bg-agency-950 dark:text-agency-300',
};
const OUTLINE: Record<BadgeTone, string> = {
  neutral: 'border-border text-foreground/80',
  brand: 'border-teal-300 text-teal-800 dark:border-teal-700 dark:text-teal-200',
  info: 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300',
  success: 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-300',
  warning: 'border-amber-400 text-amber-800 dark:border-amber-700 dark:text-amber-300',
  danger: 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',
  category: 'border-agency-300 text-agency-700 dark:border-agency-700 dark:text-agency-300',
};
const SOLID: Record<BadgeTone, string> = {
  neutral: 'border-transparent bg-foreground text-background',
  brand: 'border-transparent bg-primary text-primary-foreground',
  info: 'border-transparent bg-blue-600 text-white',
  success: 'border-transparent bg-green-600 text-white',
  warning: 'border-transparent bg-amber-500 text-amber-950',
  danger: 'border-transparent bg-red-600 text-white',
  category: 'border-transparent bg-agency-600 text-white',
};
const DOT: Record<BadgeTone, string> = {
  neutral: 'before:bg-neutral-400',
  brand: 'before:bg-teal-500',
  info: 'before:bg-blue-500',
  success: 'before:bg-green-500',
  warning: 'before:bg-amber-500',
  danger: 'before:bg-red-500',
  category: 'before:bg-agency-500',
};

const toneLook = (look: 'soft' | 'outline' | 'solid' | 'dot') =>
  Object.fromEntries(
    TONES.map((tone) => [
      tone,
      look === 'soft'
        ? SOFT[tone]
        : look === 'outline'
          ? OUTLINE[tone]
          : look === 'solid'
            ? SOLID[tone]
            : cn(
                "border-border text-foreground/80 before:size-1.5 before:shrink-0 before:rounded-full before:content-['']",
                DOT[tone]
              ),
    ])
  ) as Record<BadgeTone, string>;

const LOOKS = {
  soft: toneLook('soft'),
  outline: toneLook('outline'),
  solid: toneLook('solid'),
  dot: toneLook('dot'),
};

// Icon sizes go on @/ui Icon's box (a direct div child); its svg fills the box (globals.css).
const badgeSizes = cva('', {
  variants: {
    size: {
      sm: 'h-4.5 gap-1 px-1.5 text-[0.625rem] *:[div]:size-3!',
      md: 'h-5 gap-1 px-2 text-xs *:[div]:size-3.5!',
      lg: 'h-7 gap-1.5 px-3 text-sm *:[div]:size-4!',
    },
  },
  defaultVariants: { size: 'md' },
});

// Stock shadcn variants (old lab pages only).
const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden rounded-full border font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20',
        outline: 'border-border text-foreground [a]:hover:bg-muted',
        ghost: 'border-transparent hover:bg-muted dark:hover:bg-muted/50',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
    },
  }
);

function Badge({
  className,
  tone,
  look,
  size = 'md',
  variant,
  render,
  ...props
}: useRender.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> &
  VariantProps<typeof badgeSizes> & {
    tone?: BadgeTone;
    look?: keyof typeof LOOKS;
  }) {
  const colour = variant && !tone && !look ? '' : LOOKS[look ?? 'soft'][tone ?? 'neutral'];
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(
          badgeVariants({
            variant: variant && !tone && !look ? variant : undefined,
          }),
          badgeSizes({ size }),
          colour,
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

export { Badge, type BadgeTone, badgeVariants };
