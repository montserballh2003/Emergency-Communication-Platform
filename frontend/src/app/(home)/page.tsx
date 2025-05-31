import { AlertSection } from "@/components/specific/AlertSection";
import CallUs from "@/components/specific/CallUs";
import { fetcher } from "@/lib/utils";
import { Button } from "@nextui-org/button";
import { ArrowLeft, Siren } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default async function Home() {

    const offerHelpReqs = await (
        await fetcher("/emergency/?emergency_type=O", null, "GET")
    ).json();

    const medicalReqs = await (
        await fetcher("/emergency/?emergency_type=M", null, "GET")
    ).json();
    const dangerReqs = await (
        await fetcher("/emergency/?emergency_type=D", null, "GET")
    ).json();

    return (
        <>
            {/* <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"> */}
            <div className="absolute w-full h-[75vh] top-0 pt-[35vh] bg-[url(/image_6.png)]">
                <div
                    id="send-emergency"
                    className="max-w-[30rem] drop-shadow-[#008524] bg-[#EEEEEE] mx-auto mb-24 py-8 px-6 rounded-xl flex flex-col items-center gap-3 relative bg-cover bg-center"
                >
                    <Siren className="absolute top-3 left-3" />
                    <h3>أرسل تنبيهًا للطوارئ</h3>
                    <p>
                        حدد إشعار الطوارئ ثم قم بملئ الحقول المطلوبة ومن ثم أرسل
                        الطلب مباشرة وسيتم التوجة الى موقعكم في أسرع وقت ممكن.
                    </p>
                    <Link href="/add-application">Go</Link>
                    <Button
                        as={Link}
                        href="/add-application"
                        endContent={<ArrowLeft />}
                        className="mx-auto"
                        color="danger"
                    >
                        أرسل إشعار للطوارئ
                    </Button>
                </div>
            </div>
            <section id="recieved-emergency" className="mt-[65vh]">
                <h2 className="text-2xl font-bold text-center">
                    إشعارات الطوارئ المستلمة
                </h2>

                <AlertSection
                    data={offerHelpReqs.results}
                    heading="طلبات التنبيه حول الإغاثة"
                />
                <AlertSection
                    data={medicalReqs.results}
                    heading="طلبات التنبيه حول الصحة"
                />
                <AlertSection
                    data={dangerReqs.results}
                    heading="طلبات التنبيه حول الخطر"
                />
            </section>
            <CallUs />
            {/* </div> */}
        </>
    );
}
