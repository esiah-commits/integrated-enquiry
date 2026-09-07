import { EnquiryForm } from "@/components/enquiry/EnquiryForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Get your electrical or solar job sorted
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Answer a few questions about your job and our team will call you
            back with the right advice. Most homeowners get a quote inside one
            business day.
          </p>
        </div>

        <EnquiryForm />
      </main>
    </div>
  );
};

export default Index;
