import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cardData } from '../../lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface CardProps {
    id: number;
    title: string;
    description: string;
    index: number;
    totalCards: number;
    color: string;
}

const Card: React.FC<CardProps> = ({ title, description, index, totalCards, color }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        const container = containerRef.current;
        if (!card || !container) return;

        // For horizontal layout, we'll use scroll trigger for reveal animation
        gsap.fromTo(card,
            { opacity: 0, scale: 0.8, x: index % 2 === 0 ? -100 : 100 },
            {
                opacity: 1,
                scale: 1,
                x: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: container,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [index, totalCards]);

    return (
        <div
            ref={containerRef}
            className="flex-shrink-0 w-80 mx-4"
        >
            <div
                ref={cardRef}
                className="relative h-[400px] rounded-[24px] isolate mb-8"
            >
                {/* Electric Border Effect */}
                <div
                    className="absolute inset-[-3px] rounded-[27px] border p-[3px]"
                    style={{
                        background: `conic-gradient(
                            from 0deg,
                            transparent 0deg,
                            ${color} 60deg,
                            ${color.replace('0.8', '0.6')} 120deg,
                            transparent 180deg,
                            ${color.replace('0.8', '0.4')} 240deg,
                            transparent 360deg
                        )`
                    }}
                />

                {/* Main Card Content */}
                <div className="relative w-full h-full flex flex-col justify-center rounded-[24px] backdrop-blur-[25px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(255,255,255,0.1)] overflow-hidden"
                     style={{
                         background: `
                             linear-gradient(145deg,
                                 rgba(255, 255, 255, 0.1),
                                 rgba(255, 255, 255, 0.05)
                             )
                         `
                     }}>
                    {/* Enhanced Glass reflection overlay */}
                    <div className="absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-[rgba(255,255,255,0.25)] to-transparent opacity-50 rounded-t-[24px] pointer-events-none" />

                    {/* Glass shine effect */}
                    <div className="absolute top-[10px] left-[10px] right-[10px] h-[2px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.6)] to-transparent rounded-[1px] pointer-events-none" />

                    {/* Side glass reflection */}
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[rgba(255,255,255,0.3)] to-transparent rounded-l-[24px] pointer-events-none" />

                    {/* Frosted glass texture */}
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-radial-dots pointer-events-none opacity-70 rounded-[24px]"
                         style={{
                             backgroundImage: `
                                 radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 2px),
                                 radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08) 1px, transparent 2px),
                                 radial-gradient(circle at 40% 80%, rgba(255,255,255,0.06) 1px, transparent 2px)
                             `,
                             backgroundSize: '30px 30px, 25px 25px, 35px 35px'
                         }} />

                    {/* Card Content */}
                    <div className="relative z-10 p-6 text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const StackedCards: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        gsap.fromTo(container,
            { opacity: 0 },
            {
                opacity: 1,
                duration: 1.2,
                ease: "power2.out"
            }
        );
    }, []);

    return (
        <main ref={containerRef} className="bg-[#0a0a0a] py-8">
            {/* Cards Section - Horizontal Layout */}
            <section className="w-full text-white">
                {/* Fix for Safari: Use flexbox instead of scroll snap for better compatibility */}
                <div className="flex flex-wrap justify-center items-start gap-8 px-4 lg:px-8">
                    {cardData.map((card, index) => (
                        <Card
                            key={card.id}
                            id={card.id}
                            title={card.title}
                            description={card.description}
                            index={index}
                            totalCards={cardData.length}
                            color={card.color}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
};
