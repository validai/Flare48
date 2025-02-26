import React, { useState } from "react";
import { Mail } from "lucide-react";

const faqData = [
  {
    question: "How to save articles?",
    answer:
      "Click the 'Save' button next to each article to store them for easy access later. You can view saved articles in your profile.",
  },
  {
    question: "What categories are available?",
    answer:
      "We offer categories like sports, politics, entertainment, and technology. Customize your feed to get updates that matter most.",
  },
  {
    question: "How often is news updated?",
    answer:
      "News updates every 48 hours to ensure you stay informed with fresh stories while avoiding older clutter.",
  },
  {
    question: "Can I change categories?",
    answer:
      "Yes! Navigate to settings and select your preferred categories to customize your experience as your interests evolve.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Currently, our platform is web-based, but a mobile app is in development. Stay tuned for updates!",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="px-[5%] py-16 md:py-24 lg:py-28 bg-neutral-100 dark:bg-neutral-900">
      <div className="container grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[.75fr,1fr] lg:gap-x-20">
        
        <div>
          <h2 className="mb-5 text-4xl font-bold md:mb-6 md:text-6xl lg:text-7xl text-neutral-900 dark:text-neutral-100">
            FAQs
          </h2>
          <p className="md:text-lg text-neutral-700 dark:text-neutral-300">
            Find answers to common questions about our platform and features.
          </p>
          <div className="mt-6 md:mt-8">
            <a href="mailto:support@yourwebsite.com" className="flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-xl hover:bg-neutral-700 transition">
              <Mail className="w-5 h-5" />
              Contact Support
            </a>
          </div>
        </div>

        <div className="w-full">
          {faqData.map(({ question, answer }, index) => (
            <div key={index} className="border-b border-neutral-400 dark:border-neutral-700">
              <div
                onClick={() => toggleAnswer(index)} 
                className="flex justify-between items-center py-3 text-lg text-neutral-900 dark:text-neutral-100 cursor-pointer"
              >
                <span>{question}</span>
                <span>
                  <svg 
                    className={`w-5 h-5 transform transition-all duration-200 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`} 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 15l-7-7-7 7" />
                  </svg>
                </span>
              </div>
              {openIndex === index && (
                <div className="pb-3 text-neutral-700 dark:text-neutral-300">
                  {answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Faq;
