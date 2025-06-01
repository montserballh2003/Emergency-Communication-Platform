"use client";
import { UserContext } from "@/app/(home)/layout";
import { links } from "@/lib/data";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { useContext } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation"; // Added useRouter

type Props = Record<string, never>;

export default function Header({}: Props) {
    const [, , removeCookies] = useCookies();
    const router = useRouter(); // Initialized useRouter
    const context = useContext(UserContext);
    const user = context?.user;

    const handleLogout = () => {
        removeCookies("access", { path: '/' }); // Ensured path option for consistency
        removeCookies("refresh", { path: '/' }); // Ensured path option for consistency
        // Optionally, notify backend to blacklist token if that endpoint exists
        router.push('/auth');
        // You might want to refresh the page or reset app state as well,
        // for now, router.push will trigger navigation.
        // If UserContext needs explicit reset, that would be an additional step.
    };

    return (
        <header className="sticky m-8 px-6 py-4 flex justify-between backdrop-blur-sm rounded-xl z-[999]">
            <Link href="/">
                <h1 className="font-extrabold">نداء الوطن</h1>
            </Link>

            <div className="flex gap-3">
                {links.map(({ link, text }) => (
                    <Link
                        key={link}
                        href={link}
                        className="text-black hover:text-black/75"
                    >
                        {text}
                    </Link>
                ))}
                {user?.is_admin && (
                    <Link
                        href="/admin/chats"
                        className="text-black hover:text-black/75"
                    >
                        رسائل العملاء
                    </Link>
                )}
            </div>

            {context?.isLoading ? (
                <p>جارى التحميل</p>
            ) : user && context.isValid ? (
                <div className="flex items-center gap-3">
                    <p className="mt-3">
                        مرحبا {user.first_name + " " + user.last_name}
                    </p>
                    <Button
                        variant="bordered"
                        color="danger"
                        onPress={handleLogout} // Changed to call handleLogout
                    >
                        تسجيل الخروج
                    </Button>
                </div>
            ) : (
                <Button
                    as={Link}
                    href="/auth"
                    variant="bordered"
                    color="primary"
                >
                    تسجيل الدخول
                </Button>
            )}
        </header>
    );
}
