import React, { useMemo, useEffect } from 'react';
import { UserData, BodyPart, NekoMood, PlannerGoal, DailyCompletion, Workout } from '../types';

interface CatStateProps {
  userData: UserData;
  dailyCompletions: DailyCompletion;
  plannerGoals: PlannerGoal[];
  workouts: Workout[];
}

const CatState: React.FC<CatStateProps> = ({ userData, dailyCompletions, plannerGoals, workouts }) => {
  const { mood, imageId, dialogue, bottomQuote } = useMemo(() => {
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const isMonday = now.getDay() === 1;

    // --- 1. 邏輯判定數據 ---
    const getStats = () => {
      const curr = new Date();
      const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
      
      let workoutDaysCount = 0;
      let completedWorkoutDays = 0;
      let consecutiveMissedWorkoutDays = 0;
      let streakBroken = false;

      for (let i = 0; i < 7; i++) {
        const d = new Date(new Date(first).setDate(new Date(first).getDate() + i));
        const dow = d.getDay();
        const goals = plannerGoals.filter(g => g.targetDays.includes(dow));
        if (goals.length > 0) {
          workoutDaysCount++;
          const key = d.toISOString().split('T')[0];
          const done = (dailyCompletions[key] || []).filter(id => goals.some(g => g.id === id)).length;
          if (done === goals.length) completedWorkoutDays++;
        }
      }

      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dow = d.getDay();
        const goals = plannerGoals.filter(g => g.targetDays.includes(dow));
        if (goals.length > 0) {
          const key = d.toISOString().split('T')[0];
          const done = (dailyCompletions[key] || []).length;
          if (done === 0) {
            if (!streakBroken) consecutiveMissedWorkoutDays++;
          } else {
            streakBroken = true;
          }
        }
      }
      return { workoutDaysCount, completedWorkoutDays, consecutiveMissedWorkoutDays };
    };

    const stats = getStats();
    const todayGoals = plannerGoals.filter(g => g.targetDays.includes(now.getDay()));
    const todayDoneIds = dailyCompletions[todayKey] || [];
    const todayRate = todayGoals.length === 0 ? 1 : todayDoneIds.length / todayGoals.length;
    const isRestDay = todayGoals.length === 0;

    const doneWorkoutsToday = todayDoneIds.map(id => {
      const goal = plannerGoals.find(g => g.id === id);
      return workouts.find(w => w.id === goal?.workoutId);
    });
    const hasYoga = doneWorkoutsToday.some(w => w?.bodyPart === BodyPart.YOGA);
    const hasStretch = doneWorkoutsToday.some(w => w?.bodyPart === BodyPart.STRETCH);

    // --- 2. 決定 Mood ---
    let finalMood = NekoMood.GOOD;

    if (hour >= 0 && hour <= 6) finalMood = NekoMood.NIGHTOWL;
    else if (isMonday && todayRate === 0) finalMood = NekoMood.MONDAY;
    else if (hour >= 12 && todayRate === 0) finalMood = NekoMood.LAZY;
    else if (isRestDay) finalMood = NekoMood.CHILL;
    else if (hasYoga) finalMood = NekoMood.YOGA;
    else if (hasStretch) finalMood = NekoMood.STRETCH;
    else if (todayRate === 1 && stats.completedWorkoutDays >= 4) finalMood = NekoMood.EXCELLENT;
    else if (todayRate === 1) finalMood = NekoMood.SATISFACTION;
    else if (stats.consecutiveMissedWorkoutDays >= 3) finalMood = NekoMood.ANGRY;
    else if (todayRate < 0.4) finalMood = NekoMood.GUILT;
    else if (todayRate >= 0.4 && todayRate < 0.8) finalMood = NekoMood.MOTIVATIONAL;

    // --- 3. 資源對照表 (補全所有可能的 NekoMood) ---
    const MOOD_ASSETS: Record<string, { images: string[], bubbles: string[], quotes: string[] }> = {
      [NekoMood.EXCELLENT]: {
        images: ['img_excellent_01'],
        bubbles: ["哇喔！你簡直是個奇蹟喵！", "值得載入橘貓史冊喵！"],
        quotes: ["我開始懷疑我是不是教出了一個機器人喵？"]
      },
      [NekoMood.SATISFACTION]: {
        images: ['img_satisfaction_01'],
        bubbles: ["看來你還記得有這 App 喵。", "罐罐吃起來特別香喵～"],
        quotes: ["今天的表現，本教練勉強給個讚。"]
      },
      [NekoMood.GOOD]: {
        images: ['img_good_01'],
        bubbles: ["節奏不錯喵！", "肉球感覺到了你的努力。"],
        quotes: ["穩定發揮，這才像個人類喵。"]
      },
      [NekoMood.MOTIVATIONAL]: {
        images: ['img_motivation_01'],
        bubbles: ["差一點就成功了喵！", "再努力一下喵！"],
        quotes: ["今晚的小魚乾就在前面等你了喵！"]
      },
      [NekoMood.ANGRY]: {
        images: ['img_angry_01'],
        bubbles: ["你把我當空氣是不是？！", "我要亮爪子了喵！"],
        quotes: ["火很大，火大到可以烤熟你的懶惰了喵。"]
      },
      [NekoMood.GUILT]: {
        images: ['img_guilt_01'],
        bubbles: ["心虛的眼神我聞到了喵。", "良心不會痛嗎喵？"],
        quotes: ["你就繼續假裝沒看到我，反正我只是隻貓喵。"]
      },
      [NekoMood.CHILL]: {
        images: ['img_chill_01'],
        bubbles: ["跟我一起看雲喵。", "休息是為了下一頓罐罐。"],
        quotes: ["放空對心臟好，這是我貓族的智慧喵。"]
      },
      [NekoMood.LAZY]: {
        images: ['img_lazy_01'],
        bubbles: ["反射神經比貓草還慢喵。", "太陽都曬屁股了喵。"],
        quotes: ["如果你再不開動，我就要去你枕頭上『打招呼』了喵。"]
      },
      [NekoMood.MONDAY]: {
        images: ['img_monday_01'],
        bubbles: ["週一憂鬱我理解喵。", "別拿週一當藉口喵。"],
        quotes: ["雖然是週一，但汗水是不會騙人的喵。"]
      },
      [NekoMood.NIGHTOWL]: {
        images: ['img_nightowl_01'],
        bubbles: ["這麼晚找我，是想我喵？", "熬夜對肉球不好喵。"],
        quotes: ["深夜不睡覺，是在反省今天沒運動嗎喵？"]
      },
      [NekoMood.YOGA]: {
        images: ['img_yoga_01'],
        bubbles: ["這曲線跟我有得比喵。", "優雅喵～"],
        quotes: ["身心合一，罐罐合一喵。"]
      },
      [NekoMood.STRETCH]: {
        images: ['img_stretch_01'],
        bubbles: ["筋開腰軟真舒服喵。", "別像木頭一樣硬喵。"],
        quotes: ["拉開你的筋骨，迎接下一場罐罐饗宴喵。"]
      }
    };

    // 安全防護邏輯：如果當前 Mood 沒有資源，強制使用 CHILL
    const assets = MOOD_ASSETS[finalMood] || MOOD_ASSETS[NekoMood.CHILL];
    const randomIdx = (arr: any[]) => Math.floor(Math.random() * arr.length);
    
    return {
      mood: finalMood,
      imageId: assets.images[randomIdx(assets.images)],
      dialogue: assets.bubbles[randomIdx(assets.bubbles)],
      bottomQuote: assets.quotes[randomIdx(assets.quotes)]
    };
  }, [dailyCompletions, plannerGoals, workouts]);

  // 注入樣式
  useEffect(() => {
    const styleId = 'cat-state-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-[450px] mx-auto animate-in fade-in zoom-in duration-500">
      
      {/* 1. 對話框 */}
      <div className="relative mb-6 group cursor-default">
        <div className="bg-white border-2 border-gray-100 px-6 py-4 rounded-[2rem] shadow-xl relative z-10 transition-transform group-hover:-rotate-1">
          <p className="text-sm font-black text-gray-800 leading-relaxed italic">
            「{dialogue}」
          </p>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-b-2 border-r-2 border-gray-100 rotate-45 z-0" />
      </div>

      {/* 2. 貓咪圖片 (400x400) */}
      <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center relative">
        <div className={`absolute inset-0 rounded-full blur-3xl opacity-10 transition-colors duration-1000 ${
          mood === NekoMood.ANGRY ? 'bg-red-500' : 'bg-indigo-500'
        }`} />
        
        <img 
          src={`/assets/images/${imageId}.png`} 
          alt={`${mood} Cat Coach`}
          className="w-full h-full object-contain relative z-10 animate-bounce-slow"
          onError={(e) => { 
            console.warn(`Missing image: ${imageId}, falling back to default.`);
            e.currentTarget.src = '/assets/images/img_chill_01.png'; 
          }}
        />
      </div>

      {/* 3. 下方 Quote */}
      <div className="mt-6 px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="h-0.5 w-8 bg-gray-100 rounded-full" />
          <p className="text-gray-400 font-medium italic text-[13px] tracking-wide leading-relaxed">
            {bottomQuote}
          </p>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">
            — {mood} COACH —
          </p>
        </div>
      </div>

    </div>
  );
};

export default CatState;