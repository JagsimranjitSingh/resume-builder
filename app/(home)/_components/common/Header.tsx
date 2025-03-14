import Link from "next/link";
import React from "react";

const Header = () => {
    return (
        <div className="shadow-sm w-full sticky top-0 bg-white dark:bg-gray-900 z-[9]">
            <div className="w-full mx-auto max-w-7xl py-2 px-5 flex item-center justify-between">
                <div className="flex item-center flex-1 gap-9">
                    <div>
                        <Link href="/dashboard" className="font-black text-[20px] text-primary">ResumeBuild</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header;