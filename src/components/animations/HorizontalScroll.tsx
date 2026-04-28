import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface HorizontalScrollProps {
  children: ReactNode[];
  className?: string;
  title?: string;
}

export default function HorizontalScroll({ children, className, title }: HorizontalScrollProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef
  });

  // Calculate the total width to scroll. 
  // We assume children are roughly the same width or we just set a fixed percentage.
  // To reach the end, we translate - (number of items - 1) * 100%
  const numItems = children.length;
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(numItems - 1) * 100}%`]);

  return (
    <section ref={targetRef} className={cn("relative", className)} style={{ height: `${numItems * 100}vh` }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden bg-inherit">
        {title && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
             <h2 className="text-4xl md:text-6xl font-black italic font-mono uppercase tracking-tighter opacity-5 text-white underline decoration-primary/20 decoration-2 underline-offset-8">
               {title}
             </h2>
          </div>
        )}
        <motion.div style={{ x }} className="flex h-full">
          {children.map((item, index) => (
            <div key={index} className="w-screen h-full flex-shrink-0 flex items-center justify-center px-6 md:px-24">
               <div className="w-full max-w-5xl mx-auto">
                 {item}
               </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
