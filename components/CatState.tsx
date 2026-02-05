import React, { useMemo } from 'react';
import { NekoMood, UserData, DailyCompletion, PlannerGoal, Workout } from '../types';

const NekoData = {
  [NekoMood.EXCELLENT]: {
    images: ['img_excellent_01', 'img_excellent_02', 'img_excellent_03', 'img_excellent_04', 'img_excellent_05'],
    bubbles: ["你簡直是個奇蹟喵！", "我懷疑你是機器人喵！", "值得載入橘貓史冊喵！", "這個月的表現超乎我的想像！", "我決定賞你...一個罐罐的空盒子～喵！", "人類，你今天的成就，值得載入我橘貓家族的史冊！", "值得載入橘貓史冊喵！"],
  },
  [NekoMood.SATISFACTION]: {
    images: ['img_satisfaction_01', 'img_satisfaction_02', 'img_satisfaction_03', 'img_satisfaction_04', 'img_satisfaction_05'],
    bubbles: ["罐罐吃起來特別香喵～", "看來你還記得有這App喵。", "我的尾巴在愉悅擺動喵。", "你今天完成了你的目標，我也完成了我的目標：督促你～喵。"],
  },
  [NekoMood.GOOD]: {
    images: ['img_good_01', 'img_good_02', 'img_good_03', 'img_good_04', 'img_good_05'],
    bubbles: ["節奏不錯喵！", "穩定發揮，像個人類了喵。", "肉球感覺到了你的努力。", "今天表現有及格喵！給你一個肯定的點頭", "看來你已經漸入佳境了，我的肉球感覺到了你的努力喵。", "不急不徐，穩定輸出，這才是長久之道喵。"],
  },
  [NekoMood.MOTIVATIONAL]: {
    images: ['img_motivational_01', 'img_motivational_02', 'img_motivational_03', 'img_motivational_04', 'img_motivational_05'],
    bubbles: ["差一點就成功了喵！", "再努力一下，小魚乾就在前面！", "我的力量都傳給你了！", "去吧，喵勇者！", "每一小步都是進步，就像我每天都能多睡一分鐘一樣厲害喵！"],
  },
  [NekoMood.GUILT]: {
    images: ['img_guilt_01', 'img_guilt_02', 'img_guilt_03', 'img_guilt_04', 'img_guilt_05'],
    bubbles: ["心虛的眼神我聞到了喵。", "你就繼續假裝沒看到我喵。", "良心不會痛嗎喵？", "你別以為我不知道你心裡在想什麼，你的罪惡感快溢出螢幕了喵。", "看你現在這副樣子...我都替你感到尷尬了喵。"],
  },
  [NekoMood.ANGRY]: {
    images: ['img_angry_01', 'img_angry_02', 'img_angry_03', 'img_angry_04', 'img_angry_05'],
    bubbles: ["你把我當空氣嗎喵！", "我要亮爪子了喵！", "你想讓我們一起變肥宅嗎？", "我的耐心快用完了喵！", "我生氣起來連我自己都怕！喵！"],
  },
  [NekoMood.CHILL]: {
    images: ['img_chill_01', 'img_chill_02', 'img_chill_03', 'img_chill_04', 'img_chill_05'],
    bubbles: ["跟我一起看雲喵。", "放空對心臟好喵。", "休息是為了吃更多罐罐。", "音樂開大聲點，現在是屬於我們兩個的 Lazy Time 喵～"],
  },
  [NekoMood.IGNORANCE]: {
    images: ['img_ignorance_01', 'img_ignorance_02', 'img_ignorance_03', 'img_ignorance_04', 'img_ignorance_05'],
    bubbles: ["喔？你剛才說了什麼嗎？我只聽到我的肚子在叫喵。", "你的存在感，比我掉的毛還稀薄⋯⋯喵。", "我就靜靜地看著你裝傻，看你能撐多久 喵。"],
  },
  [NekoMood.MONDAY]: {
    images: ['img_monday_01', 'img_monday_02', 'img_monday_03', 'img_monday_04', 'img_monday_05'],
    bubbles: ["星期一憂鬱我理解喵。", "是因為週一憂鬱還是因為懶喵？", "如果是因為星期一而貪懶，我就要亮爪子了喵。"],
    quotes: ["星期一憂鬱我理解喵。"]
  },
  [NekoMood.LAZY]: {
    images: ['img_lazy_01', 'img_lazy_02', 'img_lazy_03', 'img_lazy_04', 'img_lazy_05'],
    bubbles: ["太陽曬屁股才開App喵。", "反射神經比貓草還慢喵。", "如果你今天不打卡，我就去你枕頭上『留下禮物』。"],
  },
  [NekoMood.YOGA]: {
    images: ['img_yoga_01', 'img_yoga_02', 'img_yoga_03', 'img_yoga_04', 'img_yoga_05'],
    bubbles: ["優雅曲線跟我有得比喵。", "今天的罐罐吃起來一定特別香喵～"],
  },
  [NekoMood.STRETCH]: {
    images: ['img_stretch_01', 'img_stretch_02', 'img_stretch_03', 'img_stretch_04', 'img_stretch_05'],
    bubbles: ["筋開腰軟真舒服喵。", "我才不會像你的肩膀一樣硬邦邦～喵。"],
  },
  [NekoMood.NIGHTOWL]: {
    images: ['img_nightowl_01', 'img_nightowl_02', 'img_nightowl_03', 'img_nightowl_04', 'img_nightowl_05'],
    bubbles: ["這麼晚找我，是心虛還是想我喵？", "宵夜吃完睡不著喵？"],
  }
};

const getLocalDateKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const CatState: React.FC<{ 
  userData: UserData, 
  dailyCompletions: DailyCompletion, 
  plannerGoals: PlannerGoal[], 
  workouts: Workout[] 
}> = ({ dailyCompletions, plannerGoals, workouts }) => {
  
  const mood = useMemo(() => {
    const now = new Date();
    const todayKey = getLocalDateKey(now);
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    
    const todayGoals = plannerGoals.filter(g => g.targetDays.includes(dayOfWeek));
    const doneIds = dailyCompletions[todayKey] || [];
    const todayProgress = todayGoals.length === 0 ? 0 : (doneIds.length / todayGoals.length) * 100;
    const isRestDay = todayGoals.length === 0;

    // 計算本週完成度超過100%的天數
    let week100PercentDays = 0;
    for(let i=0; i<7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = getLocalDateKey(d);
        const gForD = plannerGoals.filter(g => g.targetDays.includes(d.getDay()));
        if(gForD.length > 0 && (dailyCompletions[k] || []).length >= gForD.length) week100PercentDays++;
    }

    // 判斷連續運動日 0% 的天數
    let continuousZeroDays = 0;
    for(let i=1; i<=5; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const gForD = plannerGoals.filter(g => g.targetDays.includes(d.getDay()));
        if(gForD.length > 0) {
            if((dailyCompletions[getLocalDateKey(d)] || []).length === 0) continuousZeroDays++;
            else break;
        }
    }

    // 優先權判斷
    if (hour >= 0 && hour < 6) return NekoMood.NIGHTOWL;
    const todayWorkouts = doneIds.map(id => {
        const goal = plannerGoals.find(g => g.id === id);
        return workouts.find(w => w.id === goal?.workoutId);
    });
    if (todayWorkouts.some(w => w?.source === 'Yoga')) return NekoMood.YOGA;
    if (todayWorkouts.some(w => w?.source === 'Stretch')) return NekoMood.STRETCH;
    if (isRestDay) return NekoMood.CHILL;
    if (dayOfWeek === 1 && todayProgress === 0) return NekoMood.MONDAY;
    if (hour >= 12 && todayProgress === 0) return NekoMood.LAZY;
    if (todayProgress >= 100 && week100PercentDays >= 4) return NekoMood.EXCELLENT;
    if (todayProgress >= 100 || week100PercentDays >= 2) return NekoMood.SATISFACTION;
    if (todayProgress >= 80) return NekoMood.GOOD;
    if (todayProgress >= 40) return NekoMood.MOTIVATIONAL;
    if (continuousZeroDays >= 3) return NekoMood.ANGRY;
    if (continuousZeroDays >= 2) return NekoMood.IGNORANCE;
    return NekoMood.GUILT;
  }, [dailyCompletions, plannerGoals, workouts]);

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
      {/* 對話氣泡 */}
      <div className="bg-gray-100 rounded-xl p-2 mb-3 relative shadow-sm max-w-[95%]">
        <p className="text-[10px] font-bold text-gray-500 leading-tight text-center px-1">
          {bubbleText}
        </p>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-100 rotate-45"></div>
      </div>

      {/* 圖片展示 */}
      <div className="w-full aspect-square relative flex items-center justify-center">
        <img 
          key={imageId} 
          src={`https://raw.githubusercontent.com/stepyan7/MeowFit_Assets/main/images/${imageId}.png`} 
          alt="Cat Coach"
          className="max-w-full max-h-full object-contain animate-bounce-subtle"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.parentElement) e.currentTarget.parentElement.innerHTML = '<div class="text-4xl">🐱</div>';
          }}
        />
      </div>
      
      {/* 底部小字金句 */}
    </div>
  );
};

export default CatState;