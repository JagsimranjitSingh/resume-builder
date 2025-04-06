import EditResume from "@/app/(home)/_components/EditResume";
import { ResumeInfoProvider } from "@/context/resume-info-provider";
import React from "react";

const Page = () => {
    return (
        <div>
            <ResumeInfoProvider>
                <EditResume />
            </ResumeInfoProvider>
        </div>
    )
};

export default Page;