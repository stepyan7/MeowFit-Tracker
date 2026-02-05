import React, { useMemo } from 'react';
import { NekoMood, UserData, DailyCompletion, PlannerGoal, Workout } from '../types';

const NekoData = {
  [NekoMood.EXCELLENT]: {
    images: ['img_excellent_01', 'img_excellent_02'], 
    bubbles: ["哇喔！簡直是奇蹟喵！", "這肌肉線條...完美喵！", "你是運動天才嗎喵？"],
    quotes: ["我開始懷疑我是不是教出了一個機器人喵？"]
  },
  [NekoMood.SATISFACTION]: {
    images: ['img_satisfaction_01'],
    bubbles: ["不錯喵，有大師風範！", "很有感喵！維持住！"],
    quotes: ["今天的心情跟你的動作一樣漂亮喵。"]
  },
  [NekoMood.GOOD]: {
    images: ['img_good_01'],
    bubbles: ["有在進步喵！保持！", "我看好你喔喵！"],
    quotes: ["每一滴汗水都是變強的證明喵。"]
  },
  [NekoMood.CHILL]: {
    images: ['img_chill_01'],
    bubbles: ["放鬆點喵，生活更美好。", "喵嗚～動一動吧？"],
    quotes: ["有時候，慢下來也是一種練習喵。"]
  },
  [NekoMood.ANGRY]: {
    images: ['img_angry_01'],
    bubbles: ["偷懶嗎喵！？快動！", "再不動變大肥貓了喵！"],
    quotes: ["脂肪在笑你，你還坐得住喵？"]
  }
};

const CatState: React.FC<{ 
  userData: UserData, 
  dailyCompletions: DailyCompletion, 
  plannerGoals: PlannerGoal[], 
  workouts: Workout[] 
}> = ({ dailyCompletions, plannerGoals }) => {
  
  const mood = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayDay = new Date().getDay();
    const todayGoals = plannerGoals.filter(g => g.targetDays.includes(todayDay));
    const doneCount = (dailyCompletions[today] || []).length;
    
    if (todayGoals.length === 0) return NekoMood.CHILL;
    const progress = (doneCount / todayGoals.length) * 100;

    if (progress >= 100) return NekoMood.EXCELLENT;
    if (progress >= 75) return NekoMood.SATISFACTION;
    if (progress >= 50) return NekoMood.GOOD;
    if (progress >= 20) return NekoMood.CHILL;
    return NekoMood.ANGRY;
  }, [dailyCompletions, plannerGoals]);

  const imageId = useMemo(() => {
    const imgs = NekoData[mood].images;
    return imgs[Math.floor(Math.random() * imgs.length)];
  }, [mood, dailyCompletions]);

  const bubbleText = useMemo(() => {
    const bs = NekoData[mood].bubbles;
    return bs[Math.floor(Math.random() * bs.length)];
  }, [mood, dailyCompletions]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* 1. 縮小、淺灰背景、無邊框、微浮動的對話框 */}
      <div className="bg-gray-100 rounded-xl p-2 mb-3 relative shadow-sm max-w-[90%] animate-pulse">
        <p className="text-[11px] font-bold text-gray-500 leading-tight text-center px-1">
          {bubbleText}
        </p>
        {/* 下方小箭頭：同步淺灰色 */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-100 rotate-45"></div>
      </div>

      {/* 2. 貓咪圖片：維持 GitHub 絕對路徑 */}
      <div className="w-full aspect-square relative flex items-center justify-center">
        <img 
          key={imageId} 
          src={`https://raw.githubusercontent.com/stepyan7/MeowFit-Tracker/main/public/assets/images/${imageId}.png`} 
          alt="Cat Coach"
          className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.innerHTML = '<div class="text-4xl">🐱</div>';
            }
          }}
        />
      </div>
      
      {/* 3. 底部金句 (無 Coach 字樣) */}
      <p className="mt-3 text-[9px] italic text-gray-400 text-center px-2 leading-tight opacity-80">
        "{NekoData[mood].quotes[0]}"
      </p>
    </div>
  );
};

export default CatState;