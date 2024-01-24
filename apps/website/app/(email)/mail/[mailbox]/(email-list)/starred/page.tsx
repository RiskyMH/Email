import { getCurrentUser } from "@/app/utils/user"
import { notFound } from "next/navigation"
import { userMailboxAccess } from "../../tools"
import { Metadata } from "next"
import EmailList from "../email-list"

export const metadata = {
    title: "Starred",
} as Metadata


export default async function Mailbox({
    params,
    searchParams
}: {
    params: {
        mailbox: string
    },
    searchParams?: {
        category?: string
    }
}) {
    const userId = await getCurrentUser()
    const userHasAccess = await userMailboxAccess(params.mailbox, userId)
    if (!userHasAccess) return notFound()

    return (
        <EmailList
            mailboxId={params.mailbox}
            type="starred"
            categoryId={searchParams?.category}
        />
    )
}