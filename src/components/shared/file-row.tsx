import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon, type IconType } from '@/ui';

/**
 * A file in a list (DECISIONS §2 „File rows”: employees, vehicles, nalozi). Row click = preview. On the right the date;
 * on hover / keyboard focus it gives way to ⬇ download + 🗑 delete in the same spot; touch screens show both. Delete
 * goes through `FileDeleteDialog`. Labs /employees, /fleet.
 */
export function FileRow({
  name,
  date,
  icon = 'IconFileText',
  onOpen,
  onDownload,
  onDelete,
}: {
  name: string;
  /** Already formatted (formatDateShort / formatDate). */
  date?: React.ReactNode;
  /** e.g. getFileIcon(document) from src/lib/utils/fileIcon. */
  icon?: IconType;
  onOpen(): void;
  onDownload?(): void;
  /** Leave out when the user may not delete (e.g. deactivated employee). */
  onDelete?(): void;
}) {
  return (
    <div className="group/file relative flex items-center rounded-lg hover:bg-muted/60">
      <button className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-left" type="button" onClick={onOpen}>
        <Icon className="text-muted-foreground" icon={icon} size="m" />
        <span className="flex-1 truncate text-sm">{name}</span>
        {date && (
          <span className="pr-1 text-xs text-muted-foreground tabular-nums pointer-fine:group-focus-within/file:invisible pointer-fine:group-hover/file:invisible">
            {date}
          </span>
        )}
      </button>
      {(onDownload || onDelete) && (
        <div className="flex items-center pr-1 pointer-fine:absolute pointer-fine:right-0 pointer-fine:hidden pointer-fine:group-focus-within/file:flex pointer-fine:group-hover/file:flex">
          {onDownload && (
            <Tooltip>
              <TooltipTrigger
                render={<Button aria-label={`Preuzmi ${name}`} size="icon-sm" variant="ghost" onClick={onDownload} />}
              >
                <Icon icon="IconDownload" size="s" />
              </TooltipTrigger>
              <TooltipContent>Preuzmi</TooltipContent>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label={`Izbriši ${name}`}
                    className="text-muted-foreground hover:text-destructive"
                    size="icon-sm"
                    variant="ghost"
                    onClick={onDelete}
                  />
                }
              >
                <Icon icon="IconTrash" size="s" />
              </TooltipTrigger>
              <TooltipContent>Izbriši</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}

/** „Izbrisati dokument?” confirm for a file row (one per list; open it with the file's name). */
export function FileDeleteDialog({
  fileName,
  loading = false,
  onConfirm,
  onOpenChange,
}: {
  /** The file to delete; null = closed. */
  fileName: string | null;
  loading?: boolean;
  onConfirm(): void;
  onOpenChange(open: boolean): void;
}) {
  return (
    <AlertDialog open={fileName !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon icon="IconTrash" size="m" />
          </AlertDialogMedia>
          <AlertDialogTitle>Izbrisati dokument?</AlertDialogTitle>
          <AlertDialogDescription>{fileName} · Ovo se ne može poništiti.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Odustani</AlertDialogCancel>
          <AlertDialogAction loading={loading} variant="destructive" onClick={onConfirm}>
            <Icon data-icon="inline-start" icon="IconTrash" size="s" /> Izbriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
