import { links } from "@/lib/data";
import { Facebook, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    const socialLinks = [
        { icon: Facebook, href: "#" },
        { icon: Twitter, href: "#" },
        { icon: Linkedin, href: "#" },
        { icon: Youtube, href: "#" },
        { icon: Instagram, href: "#" },
    ];

    return (
        <footer className="bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                {/* Main Footer Content */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
                    <div className="gap-4">
                        <h2 className="text-xl font-bold text-blue-600">
                            نداء الوطن
                        </h2>
                        <p className="text-gray-600">صوتك في الطوارئ</p>
                    </div>

                    <div className="h-[3rem] w-px bg-primary-700 hidden xl:block" />

                    <div className="text-center mb-8 max-w-3xl mx-auto text-sm text-gray-600">
                        <p>
                            منصة &ldquo;
                            <span className="font-bold text-primary-400">
                                نداء الوطن
                            </span>
                            &rdquo; هي منصة تواصل للطوارئ تتيح للمستخدمين في فلسطين
                            إرسال واستقبال الإشعارات الطوارئ، سواء كانت تتعلق
                            بمساعدة طبية أو أمن طلب مساعدة طبية أو الإبلاغ عن
                            مخاطر تهددهم
                        </p>
                    </div>

                    <div className="h-[3rem] w-px bg-primary-700 hidden xl:block" />

                    <div className="grid gap-y-2">
                        <p>وسائل التواصل الاجتماعي </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon;
                                return (
                                    <Link
                                        key={index}
                                        href={social.href}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-500 hover:bg-blue-50 transition-colors"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200">
                    <nav>
                        <ul className="flex flex-wrap justify-center gap-4">
                            {links.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.link}
                                        className="text-sm text-gray-600 hover:text-blue-500"
                                    >
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <p className="text-sm text-gray-600 mb-4 md:mb-0">
                        جميع حقوق النشر محفوظة لدى نداء الوطن © 2024
                    </p>
                </div>
            </div>
        </footer>
    );
}
