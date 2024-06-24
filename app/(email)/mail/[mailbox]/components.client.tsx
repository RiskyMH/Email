'use client'

import TooltipText from "@/components/tooltip-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tw";
import { StarIcon, Loader2, BellDotIcon, Trash2Icon, ArchiveRestoreIcon, MailOpenIcon, CheckIcon, RotateCcwIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, PropsWithChildren } from "react"
import { useTransition } from 'react';


export function ClientStar({ action, enabled, className }: { action: () => void, enabled: boolean, className?: string }) {
    const [isPending, startTransition] = useTransition();

    const onClick = (e: MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isPending) return;

        startTransition(action)
    }

    return (
        <Button variant="ghost" size="auto" onClick={onClick as any} aria-disabled={isPending} className={cn(className, "hover:bg-transparent rounded-full ring-offset-5", enabled && "text-blue/80")}>
            {isPending ?
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
                : <StarIcon fill={enabled ? "currentColor" : "transparent"} className="size-5" />
            }
        </Button>
    )
}

function EmptyIcon(props: any) {
    return <div {...props} />
}

const iconMap: Record<string, LucideIcon> = {
    StarIcon: StarIcon,
    BellDotIcon: BellDotIcon,
    Trash2Icon: Trash2Icon,
    ArchiveRestoreIcon: ArchiveRestoreIcon,
    MailOpenIcon: MailOpenIcon,
    CheckIcon: CheckIcon,
}
interface ContextMenuActionProps {
    action: () => void,
    icon: keyof typeof iconMap | "EmptyIcon",
    fillIcon?: boolean | null,
    tooltip?: string,
}

export function ContextMenuAction({ children, action, icon, fillIcon, tooltip, ...props }: PropsWithChildren<ContextMenuActionProps>) {
    const Icon: LucideIcon | null = iconMap[icon] ?? null;

    const [isPending, startTransition] = useTransition();

    const onClick = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        e.preventDefault();
        if (isPending) return;

        startTransition(action)
    }

    const base = (
        <button {...props} onClick={onClick}>
            {Icon && !isPending && <Icon className="size-5 text-muted-foreground" fill={fillIcon ? "currentColor" : "transparent"} />}
            {icon === "EmptyIcon" && !isPending && <EmptyIcon className="size-5 text-muted-foreground" />}
            {isPending && <Loader2 className="size-5 text-muted-foreground animate-spin" />}
            {children}
        </button>
    )

    if (tooltip) {
        return (
            <TooltipText text={tooltip}>
                <Button variant="ghost" size="auto" className="rounded-full p-2 -m-2 text-muted-foreground hover:text-foreground" asChild>
                    {base}
                </Button>
            </TooltipText>
        )
    }

    return base
}

export function RefreshButton({ className }: { className?: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="ghost"
            size="auto"
            onClick={() => { !isPending && startTransition(router.refresh) }}
            className={cn(className, "rounded-full p-2 -m-2 text-muted-foreground hover:text-foreground ")}
        >
            <RotateCcwIcon className={cn(isPending && "animate-reverse-spin", "size-5 text-muted-foreground")} />
        </Button>
    )
}

const changeMailboxCookie = (mailboxId: string) => {
    document.cookie = `mailboxId=${mailboxId}; path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT;`
}

export function MailboxLink({ mailboxId, children, ...props }: PropsWithChildren<{ mailboxId: string }>) {
    return <Link {...props} onClick={() => changeMailboxCookie(mailboxId)} href={`/mail/${mailboxId}`}>{children}</Link>
}

