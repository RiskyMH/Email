import { getCurrentUser } from "@/app/utils/user"
import { notFound } from "next/navigation"
import { getMailbox } from "../../tools"
import { Metadata } from "next"
import EmailList from "../email-list"
import { getEmailList } from "../tools"

export const metadata = {
    title: "Trash",
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
    const mailbox = await getMailbox(params.mailbox, userId!)
    if (!mailbox) return notFound()

    console.time("emailfetch")
    const [emails, categories, allCount] = await getEmailList(mailbox.id, { categoryId: searchParams?.category, isBinned: true, isSender: false })
    console.timeEnd("emailfetch")

    return (
        <EmailList emails={emails} mailbox={mailbox.id} categories={categories} emailCount={allCount} type="bin" />
    )
}