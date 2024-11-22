"use client"

import { motion } from "framer-motion"

export default function AnimatedDevLogo() {
  const buildingAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const roofAnimation = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { duration: 0.5, ease: "easeInOut" }
    }
  }

  const windowAnimation = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  }

  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-8 h-8 text-primary"
        initial="hidden"
        animate="visible"
      >
        <motion.g
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 4,
                staggerChildren: 0.5
              }
            }
          }}
        >
          {/* Foundation */}
          <motion.rect x="2" y="22" width="20" height="2" fill="currentColor" variants={buildingAnimation} />
          
          {/* Left wall */}
          <motion.rect x="2" y="12" width="2" height="10" fill="currentColor" variants={buildingAnimation} />
          
          {/* Right wall */}
          <motion.rect x="20" y="12" width="2" height="10" fill="currentColor" variants={buildingAnimation} />
          
          {/* Roof */}
          <motion.path
            d="M2 12L12 2L22 12"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            variants={roofAnimation}
          />
          
          {/* Door */}
          <motion.rect x="10" y="16" width="4" height="6" fill="currentColor" variants={buildingAnimation} />
          
          {/* Windows */}
          <motion.rect x="5" y="14" width="3" height="3" fill="currentColor" variants={windowAnimation} />
          <motion.rect x="16" y="14" width="3" height="3" fill="currentColor" variants={windowAnimation} />
        </motion.g>
      </motion.svg>
    </div>
  )
} 