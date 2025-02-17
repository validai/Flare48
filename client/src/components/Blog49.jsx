"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";

export function Blog49() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto w-full max-w-lg text-center">
            <p className="mb-3 font-semibold md:mb-4">Saved</p>
            <h1 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Your Saved Articles
            </h1>
            <p className="md:text-md">
              Explore the articles you've saved for later.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-start">
          <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:gap-y-16 lg:grid-cols-2">
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-[.75fr_1fr] md:gap-y-4">
              <a href="#" className="w-full">
                <img
                  src="https://images.unsplash.com/photo-1562673005-7693bd6d6e54?q=80&w=1156&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Relume placeholder image"
                  className="aspect-square size-full object-cover"
                />
              </a>
              <div className="flex h-full flex-col items-start justify-start">
                <p className="mb-2 text-sm font-semibold">Sports</p>
                <a className="mb-2" href="#">
                  <h3 className="text-xl font-bold md:text-2xl">
                    Exciting Game Highlights You Missed
                  </h3>
                </a>
                <p>Catch up on the latest sports news.</p>
                <div className="mt-5 flex items-center md:mt-6">
                  <div className="mr-4 shrink-0">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                      alt="Relume placeholder avatar"
                      className="aspect-square size-12 min-h-12 min-w-12 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold">John Doe</h6>
                    <div className="flex items-center">
                      <p className="text-sm">11 Jan 2022</p>
                      <span className="mx-2">•</span>
                      <p className="text-sm">5 min read</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-[.75fr_1fr] md:gap-y-4">
              <a href="#" className="w-full">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="aspect-square size-full object-cover"
                />
              </a>
              <div className="flex h-full flex-col items-start justify-start">
                <p className="mb-2 text-sm font-semibold">Politics</p>
                <a className="mb-2" href="#">
                  <h3 className="text-xl font-bold md:text-2xl">
                    New Policies That Impact You
                  </h3>
                </a>
                <p>Stay informed on the latest political developments.</p>
                <div className="mt-5 flex items-center md:mt-6">
                  <div className="mr-4 shrink-0">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                      alt="Relume placeholder avatar"
                      className="aspect-square size-12 min-h-12 min-w-12 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold">Jane Smith</h6>
                    <div className="flex items-center">
                      <p className="text-sm">12 Jan 2022</p>
                      <span className="mx-2">•</span>
                      <p className="text-sm">4 min read</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-[.75fr_1fr] md:gap-y-4">
              <a href="#" className="w-full">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="aspect-square size-full object-cover"
                />
              </a>
              <div className="flex h-full flex-col items-start justify-start">
                <p className="mb-2 text-sm font-semibold">Technology</p>
                <a className="mb-2" href="#">
                  <h3 className="text-xl font-bold md:text-2xl">
                    Innovations Shaping Our Future
                  </h3>
                </a>
                <p>Discover the latest in tech advancements.</p>
                <div className="mt-5 flex items-center md:mt-6">
                  <div className="mr-4 shrink-0">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                      alt="Relume placeholder avatar"
                      className="aspect-square size-12 min-h-12 min-w-12 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold">Alice Johnson</h6>
                    <div className="flex items-center">
                      <p className="text-sm">13 Jan 2022</p>
                      <span className="mx-2">•</span>
                      <p className="text-sm">6 min read</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-[.75fr_1fr] md:gap-y-4">
              <a href="#" className="w-full">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image"
                  className="aspect-square size-full object-cover"
                />
              </a>
              <div className="flex h-full flex-col items-start justify-start">
                <p className="mb-2 text-sm font-semibold">Health</p>
                <a className="mb-2" href="#">
                  <h3 className="text-xl font-bold md:text-2xl">
                    Tips for a Healthier Lifestyle
                  </h3>
                </a>
                <p>Learn how to improve your well-being.</p>
                <div className="mt-5 flex items-center md:mt-6">
                  <div className="mr-4 shrink-0">
                    <img
                      src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                      alt="Relume placeholder avatar"
                      className="aspect-square size-12 min-h-12 min-w-12 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold">Bob Brown</h6>
                    <div className="flex items-center">
                      <p className="text-sm">14 Jan 2022</p>
                      <span className="mx-2">•</span>
                      <p className="text-sm">7 min read</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Button
              title="View all"
              variant="secondary"
              className="mt-10 sm:mt-18 md:mt-20"
            >
              View all
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
