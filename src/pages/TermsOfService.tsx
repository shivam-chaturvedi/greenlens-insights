import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto">
                <h1 className="font-display text-4xl font-bold mb-8">Terms of Service</h1>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                    <p className="text-muted-foreground text-lg mb-8">
                        Last updated: February 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            By accessing and using GreenLens ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the Platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            GreenLens provides a suite of sustainability analytics tools, including a Carbon Calculator, educational modules, and a Community hub. These tools are provided "as is" and assist in driving climate accountability.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Conduct</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            You agree to use the Platform only for lawful purposes. Specifically within the Community board, you agree not to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                            <li>Post false or misleading information regarding organizational emissions.</li>
                            <li>Harass, abuse, or threaten other community members.</li>
                            <li>Spam or post promotional content that is irrelevant to the platform's goals.</li>
                        </ul>
                        <p className="text-foreground/80 leading-relaxed mt-4">
                            We reserve the right to remove Content and user accounts that violate our guidelines.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Intellectual Property</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            The Platform and its original content (excluding User-Provided Content), features and functionality are and will remain the exclusive property of GreenLens and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Disclaimer</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            GreenLens relies in part on data provided by users and public databases. We do not warrant the absolute accuracy of the analytical outputs. The information should be used as an organizational guide rather than a rigorous scientific audit.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;
