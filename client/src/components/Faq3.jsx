"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@relume_io/relume-ui";
import React from "react";

export function Faq3() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[.75fr,1fr] lg:gap-x-20">
        <div>
          <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            FAQs
          </h2>
          <p className="md:text-md">
            Find answers to your questions about using Flare 48 and its exciting
            features.
          </p>
          <div className="mt-6 md:mt-8">
            <Button title="Contact" variant="secondary">
              Contact
            </Button>
          </div>
        </div>
        <Accordion type="multiple">
          <AccordionItem value="item-0">
            <AccordionTrigger className="md:py-5 md:text-md">
              How to save articles?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              To save articles, simply click the 'Save' button located next to
              each article. This will store your favorites for easy access
              later. You can view saved articles in your profile section.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1">
            <AccordionTrigger className="md:py-5 md:text-md">
              What categories are available?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              Flare 48 offers a variety of categories including sports,
              politics, entertainment, and technology. You can easily select
              your preferred categories to tailor your news feed. This ensures
              you receive updates that matter most to you.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="md:py-5 md:text-md">
              How often is news updated?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              News on Flare 48 is updated every 48 hours to provide you with the
              latest stories. This ensures you are always informed about recent
              events. Stay current without the clutter of older news.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="md:py-5 md:text-md">
              Can I change categories?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              Yes, you can change your selected categories at any time. Simply
              navigate to the settings menu and choose your preferred
              categories. This allows you to customize your news experience as
              your interests evolve.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="md:py-5 md:text-md">
              Is there a mobile app?
            </AccordionTrigger>
            <AccordionContent className="md:pb-6">
              Currently, Flare 48 is accessible via web browsers. However, we
              are actively working on a mobile app for enhanced accessibility.
              Stay tuned for updates on our app launch!
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
