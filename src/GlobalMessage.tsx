import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing } from "lucide-react";

export interface BroadcastMessage {
  id: string;
  content: string;
  duration: number; // 展示时间，单位毫秒
}

interface Props {
  message: BroadcastMessage | null;
}

export const GlobalMessage: React.FC<Props> = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* 半透明遮罩背景 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* 消息弹窗 */}
          <motion.div
            key={message.id}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-gray-900 border border-green-500/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,200,83,0.5)] max-w-3xl w-full mx-8 text-center"
          >
            {/* 顶部发光装饰 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
            
            <div className="flex flex-col items-center gap-6">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2, repeat: 3, repeatType: "reverse" }}
                className="bg-green-500/20 p-4 rounded-full"
              >
                <BellRing className="w-12 h-12 text-green-500 drop-shadow-[0_0_10px_rgba(0,200,83,0.8)]" />
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white tracking-wide leading-relaxed">
                {message.content}
              </h2>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
