"use client";

import React, { useState, useEffect } from 'react';

interface FigureAnimationProps {
  speed?: number;
  figureSize?: string;
  bottomOffset?: string;
}

const FigureAnimation: React.FC<FigureAnimationProps> = ({
  speed = 2,
  figureSize = 'text-5xl',
  bottomOffset = 'bottom-8'
}) => {
  const [position, setPosition] = useState<number>(0);
  const [figure, setFigure] = useState<number>(0);
  
  // Figures could be emojis, SVG paths, or component names
  const figures: string[] = [
    '🎮', // game controller
    '🚀', // rocket
  ];
  
  useEffect(() => {
    // Select a random figure when component mounts
    const randomIndex: number = 0;
    setFigure(randomIndex);
    
    // Set up animation
    let animationFrame: number;
    let direction: number = 1;
    let pos: number = 0;
    
    const animate = (): void => {
      // Move back and forth across the screen
      if (pos > window.innerWidth - 100) direction = -1;
      if (pos < 0) direction = 1;
      
      pos += direction * speed; // Adjust speed based on props
      setPosition(pos);
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up animation on unmount
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [speed]);
  
  return (
    <div 
      className={`fixed ${bottomOffset} z-50 ${figureSize} transition-all duration-100 ease-linear`}
      style={{ 
        left: `${position}px`,
        transform: 'translateZ(0)', // Hardware acceleration
      }}
    >
      {figures[figure]}
    </div>
  );
};

export default FigureAnimation;
