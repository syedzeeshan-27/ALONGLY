"use client";

import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";

export type FaqItem = {
  question: string;
  answer: string;
  href?: string;
  linkLabel?: string;
};

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const baseId = useId();

  return (
    <div className="faq-accordion grid gap-2">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div
            className="faq-item rounded-lg border border-[#dce8e2] bg-white/85"
            data-open={isOpen}
            key={faq.question}
          >
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className="faq-question flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7ab4a8]"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              type="button"
            >
              <span className="faq-question-text text-base font-semibold text-[#243a34]">
                {faq.question}
              </span>
              <span aria-hidden="true" className="faq-question-mark">
                <span />
                <span />
              </span>
            </button>

            <div
              aria-hidden={!isOpen}
              className="faq-answer-shell"
              id={panelId}
              role="region"
            >
              <div className="faq-answer-inner px-5">
                <p className="max-w-3xl text-sm leading-7 text-[#65766f]">
                  {faq.answer}
                </p>
                {faq.href && faq.linkLabel ? (
                  <a
                    className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#c6ddd5] px-3 py-2 text-sm font-semibold text-[#4f8f84] transition hover:bg-[#eef8f4]"
                    href={faq.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {faq.linkLabel}
                    <ArrowRight aria-hidden="true" size={15} strokeWidth={2.4} />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
