"use client";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { FiCloud, FiServer } from "react-icons/fi";
import { LuArrowDown, LuNetwork } from "react-icons/lu";

type ComponentProps = {
  cardTitle?: string;
  cardDescription?: string;
  cloudIcon?: React.ReactNode;
  downIcon?: React.ReactNode;
  networkIcon?: React.ReactNode;
  serverIcons?: { id: number; x: number; y: number }[];
  ctaText?: string;
  ctaHref?: string;
  buttonClass?: string;
};

const defaultServers = [
  { id: 1, x: -90, y: 100 },
  { id: 2, x: 0, y: 100 },
  { id: 3, x: 90, y: 100 },
];

export const Component = ({
  cardTitle = "Elastic Load Balancing",
  cardDescription = "Automatically distribute incoming application traffic across multiple servers to ensure high availability and fault tolerance.",
  cloudIcon = <FiCloud className="size-12 text-neutral-500" />,
  downIcon = <LuArrowDown className="size-8 text-neutral-700" />,
  networkIcon = <LuNetwork className="size-10 text-neutral-500" />,
  serverIcons = defaultServers,
  ctaText,
  ctaHref,
  buttonClass = "flex justify-end mt-3 mr-10",
}: ComponentProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const parentVariants = {
    hover: { transition: { staggerChildren: 0.1 } },
    initial: { transition: { staggerChildren: 0.1, staggerDirection: -1 } },
  };

  const particleVariants = {
    initial: { opacity: 0, y: -20 },
    hover: {
      opacity: [0, 1, 1, 0],
      y: defaultServers[0].y,
      x: defaultServers[0].x,
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  const serverLightVariants = {
      initial: { backgroundColor: "#404040" },
      hover: {
        backgroundColor: ["#404040", "#a855f7", "#404040"],
        transition: {
            duration: 2,
            repeat: Infinity,
        }
      }
  }

  const getParticleY = (i: number) => serverIcons[i % serverIcons.length].y;
  const getParticleX = (i: number) => serverIcons[i % serverIcons.length].x;
  const getDelay = (i: number) => i * 0.4;
  const getServerDelay = (i: number) => i * 0.4 + 1.2;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex flex-col justify-between",
        "h-[28rem] w-full max-w-[350px] space-y-4",
        "overflow-hidden rounded-md bg-black/20 backdrop-blur-md",
      )}
    >
      {/* Animation Canvas */}
      <div className="absolute inset-x-0 top-12 flex h-64 items-center justify-center">
        <div className="relative flex h-full w-full flex-col items-center">
          {/* Icons */}
          <div className="mb-4">{cloudIcon}</div>
          {downIcon}
          {networkIcon}

          {/* Server Icons */}
          <div className="absolute bottom-0 flex w-full justify-around">
            {serverIcons.map((server, i) => (
              <div key={server.id} className="flex flex-col items-center gap-2">
                <FiServer className="size-8 text-neutral-500" />
                <motion.div
                    className="h-2 w-2 rounded-full"
                    variants={serverLightVariants}
                    initial="initial"
                    animate={isHovered ? "hover" : "initial"}
                    custom={i}
                />
              </div>
            ))}
          </div>

          {/* Animated Particles */}
          <motion.div variants={parentVariants} initial="initial" animate={isHovered ? "hover" : "initial"}>
              {[...Array(5)].map((_, i) => (
                  <motion.div
                  key={i}
                  custom={i}
                  variants={particleVariants}
                  className="absolute top-0 size-1.5 rounded-full bg-purple-400"
                  />
              ))}
          </motion.div>
        </div>
      </div>

      {/* Text Content */}
      <div className="absolute bottom-0 z-10 w-full px-4 pb-4">
        <div className="mt-3 text-sm font-semibold text-white">{cardTitle}</div>
        <div className="mt-2 text-xs text-neutral-400">{cardDescription}</div>
        {ctaText && ctaHref && (
          <div className={buttonClass}>
            <a
              href={ctaHref}
              className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:scale-105 transition text-sm"
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-neutral-950 to-transparent" />
    </div>
  );
};
