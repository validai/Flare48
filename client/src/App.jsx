import React from "react";
import { Navbar1 } from "./components/Navbar1";
import { Header1 } from "./components/Header1";
import { Blog39 } from "./components/Blog39";
import { Cta1 } from "./components/Cta1";
import { Faq3 } from "./components/Faq3";
import { Cta2 } from "./components/Cta2";
import { Footer1 } from "./components/Footer1";

export default function Page() {
  return (
    <div>
      <Navbar1 />
      <Header1 />
      <section id="latest-news">
        <Blog39 />
      </section>
      <Cta1 />
      <Faq3 />
      <Cta2 />
      <Footer1 />
    </div>
  );
}
