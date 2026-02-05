import React from "react";
const faqs = [{
  question: "Is my data secure?",
  answer: "We use enterprise-grade encryption and security measures. Your contracts are never stored longer than necessary for analysis."
}, {
  question: "What file formats are supported?",
  answer: "We support PDF, DOCX, and plain text. More formats are coming soon."
}];
const FaqSection = () => {
  return <section className="max-w-4xl mx-auto mt-16 w-full" aria-labelledby="faq-heading">
      <div className="bg-gradient-to-tr from-white via-[#f7f4fa] to-[#f5f7fd] border border-[#eeeafd] shadow-card rounded-2xl px-8 py-8 md:py-10 md:px-12 transition-all my-[29px]">
        <h3 id="faq-heading" className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-legal-primary mb-4 tracking-tight">
          Frequently Asked Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {faqs.map((faq, idx) => <div key={idx} className="flex flex-col gap-2">
              <span className="font-semibold text-base xs:text-lg sm:text-xl text-legal-text mb-1 leading-tight">
                {faq.question}
              </span>
              <span className="text-sm xs:text-base sm:text-lg text-legal-muted leading-relaxed">
                {faq.answer}
              </span>
            </div>)}
        </div>
      </div>
    </section>;
};
export default FaqSection;
