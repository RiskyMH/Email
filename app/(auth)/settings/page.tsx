import { Button, buttonVariants } from "@/components/ui/button";
import { SmartDrawer, SmartDrawerClose, SmartDrawerContent, SmartDrawerDescription, SmartDrawerFooter, SmartDrawerHeader, SmartDrawerTitle, SmartDrawerTrigger } from "@/components/ui/smart-drawer";
import { getCurrentUser } from "@/utils/jwt";
import prisma from "@/utils/prisma";
import { cn } from "@/utils/tw";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChangePassword, ChangeSetting, SignOut } from "./components.client";
import { changeUsername } from "./actions";
import { ReactNode } from "react";
import NotificationsButton from "./notifications.client";

export const metadata = {
    title: "User Settings",
} satisfies Metadata


export default async function UserSettingsPage() {
    const userId = await getCurrentUser();
    if (!userId) return redirect("/login?from=/settings");

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            username: true,
            email: true
        }
    });
    if (!user) return notFound();

    return (

        <div className="container flex p-5 w-screen h-screen flex-col items-center bg-background" vaul-drawer-wrapper="">
            <Link
                href="/home"
                className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "absolute left-4 top-4 md:left-8 md:top-8"
                )}
            >
                <ChevronLeft className="me-2 h-4 w-4" />
                Home
            </Link>

            <div className="mx-auto flex w-full flex-col gap-3 sm:w-[350px] mt-16">
                <h1 className="text-2xl">Settings</h1>
                {user.email}
                <SettingForm
                    buttonName="Change Username"
                    header={{
                        title: "Edit username",
                        description: "Make changes to your username here. Click save when you're done."
                    }}
                >
                    <ChangeSetting current={user.username} action={changeUsername} />
                </SettingForm>
                <SettingForm
                    buttonName="Change Password"
                    header={{
                        title: "Edit password",
                        description: "Make changes to your password here. Click save when you're done"
                    }}
                >
                    <ChangePassword />
                </SettingForm>
                <NotificationsButton />
                <SignOut />
            </div>
        </div>
    );
}

function SettingForm({ buttonName, header, children }: { buttonName: string, children: ReactNode, header: { title: string, description: string } }) {
    return (
        <SmartDrawer>
            <SmartDrawerTrigger asChild>
                <Button>
                    {buttonName}
                </Button>
            </SmartDrawerTrigger>
            <SmartDrawerContent className="sm:max-w-[425px]">
                <SmartDrawerHeader>
                    <SmartDrawerTitle>{header.title}</SmartDrawerTitle>
                    <SmartDrawerDescription>{header.description}</SmartDrawerDescription>
                </SmartDrawerHeader>
                {children}
                <SmartDrawerFooter className="pt-2 flex sm:hidden">
                    <SmartDrawerClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </SmartDrawerClose>
                </SmartDrawerFooter>
            </SmartDrawerContent>
        </SmartDrawer>

    )
}