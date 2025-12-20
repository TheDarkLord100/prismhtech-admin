import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-[#F7F7F5] flex flex-col">
            <Navbar type="non"/>
            {/* Main content */}
            <section className="flex-1 flex items-center justify-center px-6 md:px-16 py-40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl w-full">

                    {/* LEFT: Robot illustration */}
                    <div className="flex justify-center md:justify-end">
                        <Image
                            src="/Assets/404.png"
                            alt="404 Robot"
                            width={450}
                            height={450}
                            priority
                        />
                    </div>

                    {/* RIGHT: Text */}
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-green-700">
                            ERROR 404 !!!
                        </h1>

                        <p className="mt-4 text-2xl md:text-3xl font-semibold text-green-800">
                            PAGE NOT FOUND
                        </p>

                        <p className="mt-6 text-gray-600 max-w-md mx-auto md:mx-0">
                            The page you are looking for might have been removed,
                            had its name changed, or is temporarily unavailable.
                        </p>

                        <Link
                            href="/"
                            className="inline-block mt-8 px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition"
                        >
                            Go back to Home
                        </Link>
                    </div>

                </div>
            </section>
        </main>
    );
}
