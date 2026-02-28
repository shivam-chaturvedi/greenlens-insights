import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-32 pb-20 px-6 md:px-12 max-w-4xl mx-auto">
                <h1 className="font-display text-4xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                    <p className="text-muted-foreground text-lg mb-8">
                        Last updated: February 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            At GreenLens, we collect minimal data required to provide our sustainability analytics services. This may include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                            <li>Account information (name, email) for registered users.</li>
                            <li>Organizational emission data inputted by users into our Carbon Calculator or Community posts.</li>
                            <li>Usage data and interaction metrics on the platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Information</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            The information we collect is used extensively to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Publish aggregated, anonymized public reports and leaderboards.</li>
                            <li>Communicate with you regarding updates, support, or moderation actions.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Sharing and Transparency</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Because GreenLens is built on the premise of public accountability, aggregated emission insights and public community posts are visible to all users. Registration details and private organizational draft data remain confidential and are not sold to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Contact Us</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            If you have any questions or concerns about this privacy policy, please contact us at: <a href="mailto:contact@greenlens.org" className="text-primary hover:underline">contact@greenlens.org</a>.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
