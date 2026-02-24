import { SceneData, QuizQuestion, GuideStep } from './types';

// Import audio files directly so Vite handles them
import audio1 from './src/assets/audio/scene_1.mp3';
import audio2 from './src/assets/audio/scene_2.mp3';
import audio3 from './src/assets/audio/scene_3.mp3';
import audio4 from './src/assets/audio/scene_4.mp3';
import audio5 from './src/assets/audio/scene_5.mp3';
import audio6 from './src/assets/audio/scene_6.mp3';

export const SCENES: SceneData[] = [
  {
    id: 1,
    th: {
      title: "ปัญหาใต้ฝ่าเท้า (The Invisible Problem)",
      description: "ดินหลวมหรือโพรงใต้ดินเปรียบเสมือนฟองน้ำที่รับน้ำหนักได้ไม่ดี ทำให้สิ่งปลูกสร้างทรุดตัว",
      script: [
        "รู้ไหมครับว่าใต้เท้าของเราเนี่ยมีโลกอีกใบซ่อนอยู่",
        "เป็นโลกที่อาจจะกำลังสั่นคลอนรากฐานของทุกสิ่งทุกอย่างที่เราสร้างขึ้นมา...",
        "เคยเอะใจกันบ้างไหมครับว่าทำไมตึกเก่าๆ บางทีมันถึงทรุดตัวลง",
        "หรือทำไมพื้นบ้านที่เราอยู่ถึงเริ่มมีรอยแตกร้าว",
        "คำตอบของเรื่องนี้อาจจะซ่อนอยู่ลึกกว่าที่เราคิดไว้เยอะเลยครับ...",
        "ลองนึกภาพตามกันง่ายๆ นะครับว่าถ้าเราไปสร้างบ้านอยู่บนฟองน้ำดู",
        "ดินที่มันหลวมๆ เนี่ย มันก็ไม่ต่างอะไรจากฟองน้ำเลยครับ",
        "คือมันอาจจะรับน้ำหนักได้ในช่วงแรกๆ นะ แต่ไม่นานทุกอย่างก็ต้องค่อยๆ ทรุดตัวลงมา",
        "นี่แหละครับคือตัวการสำคัญที่ซ่อนอยู่ใต้ดิน"
      ],
      audio: audio1
    },
    en: {
      title: "The Invisible Problem",
      description: "Loose soil or underground voids act like a sponge, leading to structural subsidence.",
      script: [
        "Did you know there's a hidden world beneath our feet?",
        "A world that might be shaking the foundation of everything we build.",
        "Have you ever wondered why old buildings subside or cracks appear in the floor?",
        "The answer lies deep underground.",
        "Imagine building a house on a sponge.",
        "Loose soil is just like that sponge.",
        "It might hold up at first, but eventually, everything sinks.",
        "This is the invisible culprit hidden below."
      ]
    },
    zh: {
      title: "隐形的问题 (The Invisible Problem)",
      description: "松软的土壤或地下空洞就像海绵一样，导致结构沉降。",
      script: [
        "你知道吗？在我们脚下隐藏着另一个世界。",
        "一个可能正在动摇我们所建一切基础的世界。",
        "你是否想过为什么老建筑会下沉，或者地面会出现裂缝？",
        "答案深藏地下。",
        "想象一下在海绵上盖房子。",
        "松软的土壤就像海绵一样。",
        "起初可能还能支撑，但最终一切都会下沉。",
        "这就是隐藏在地下的罪魁祸首。"
      ]
    }
  },
  {
    id: 2,
    th: {
      title: "ทางออก: การอัดฉีดเกราท์ (Compaction Grouting)",
      description: "เทคโนโลยีการอัดฉีดซีเมนต์ข้นเพื่อสร้างฐานรากใหม่ที่แข็งแกร่ง",
      script: [
        "และนี่แหละครับคืออาวุธลับที่เราจะพูดถึงกันในวันนี้ Compaction Grouting",
        "ซึ่งมันไม่ใช่แค่การแก้ปัญหาเฉพาะหน้า แต่มันคือการสร้างเกราะป้องกันที่แข็งแกร่งขึ้นมาจากใต้ดินเลยทีเดียว...",
        "คือหัวใจของมันเนี่ยง่ายมากๆ เลยครับ แทนที่เราจะเอาปูนไปผสมกับดิน",
        "เราจะฉีดก้อนซีเมนต์ที่มันข้นๆ หนืดๆ เข้าไปดันให้ดินที่อยู่รอบๆ มันแน่นขึ้นมาแทน",
        "มันคล้ายๆ กับการที่เราอัดอากาศเข้าไปในลูกโป่งเพื่อให้มันแข็งแรงและคงรูปนั่นแหละครับ"
      ],
      audio: audio2
    },
    en: {
      title: "The Solution: Compaction Grouting",
      description: "Technology injecting thick cement to create a strong new foundation.",
      script: [
        "This is the secret weapon we're discussing today: Compaction Grouting.",
        "It's not just a quick fix, but building a strong shield from the ground up.",
        "The core concept is very simple. Instead of mixing cement with soil,",
        "we inject thick, stiff cement to displace and densify the surrounding soil.",
        "It's like pumping air into a balloon to make it firm and keep its shape."
      ]
    },
    zh: {
      title: "解决方案：压密注浆 (Compaction Grouting)",
      description: "注入浓缩水泥以建立坚固新地基的技术。",
      script: [
        "这就是我们今天要讨论的秘密武器：压密注浆。",
        "这不仅仅是权宜之计，而是从地下建立坚固的防御。",
        "核心概念很简单。我们不是将水泥与土壤混合，",
        "而是注入粘稠、坚硬的水泥，以挤压并加密周围的土壤。",
        "就像给气球充气一样，使其坚固并保持形状。"
      ]
    }
  },
  {
    id: 3,
    th: {
      title: "ขั้นตอนที่ 1: การติดตั้งท่อ (Casing Installation)",
      description: "เจาะหรือตอกท่อเหล็กลงไปจนถึงชั้นดินแข็ง (Bearing Stratum)",
      script: [
        "ขั้นตอนแรกคือการติดตั้งท่อเหล็ก หรือ Casing ครับ",
        "เราจะกดหรือตอกท่อนี้ลงไปในดิน ผ่านชั้นดินหลวมๆ ลงไปจนถึงชั้นดินแข็งด้านล่างสุด",
        "ท่อนี้เปรียบเสมือนเส้นทางหลักที่จะนำพาวัสดุอัดฉีดลงไปเสริมความแข็งแรงให้กับรากฐานครับ"
      ],
      audio: audio3
    },
    en: {
      title: "Step 1: Casing Installation",
      description: "Driving or drilling a steel pipe down to the Bearing Stratum.",
      script: [
        "The first step is Casing Installation.",
        "We drive or drill this steel pipe through the loose soil down to the solid bearing stratum below.",
        "This pipe acts as the main channel to deliver the grout material to strengthen the foundation."
      ]
    },
    zh: {
      title: "第一步：套管安装 (Casing Installation)",
      description: "将钢管钻入地下，直达坚硬的持力层。",
      script: [
        "第一步是套管安装。",
        "我们将钢管钻入松软的土壤中，直到到达下方的坚硬持力层。",
        "这根管道是输送注浆材料以加固地基的主要通道。"
      ]
    }
  },
  {
    id: 4,
    th: {
      title: "ขั้นตอนที่ 2: การอัดฉีดกระเปาะแรก (Primary Injection)",
      description: "อัดฉีดซีเมนต์ข้นผ่านท่อเพื่อสร้างฐานกระเปาะที่มั่นคง",
      script: [
        "ขั้นตอนที่ 2: การอัดฉีดกระเปาะแรก (Primary Injection) อัดฉีดซีเมนต์ข้นผ่านท่อเพื่อสร้างฐานกระเปาะที่มั่นคง",
        "เมื่อท่อลงถึงระดับที่ต้องการแล้ว ก็ถึงเวลาพระเอกของเราครับ",
        "Low-Mobility Grout หรือซีเมนต์ข้นพิเศษ จะถูกอัดผ่านท่อลงไป",
        "พอออกไปที่ปลายท่อ มันจะขยายตัวเป็นกระเปาะวงกลมเหมือนลูกโป่ง",
        "แรงดันมหาศาลจะดันดินรอบข้างให้แน่นขึ้นทันทีครับ เปรียบเสมือนการวางศิลาฤกษ์ที่แข็งแกร่งที่สุด"
      ],
      audio: audio4
    },
    en: {
      title: "Step 2: Primary Injection",
      description: "Injecting thick cement through the pipe to create a solid bulb base.",
      script: [
        "Once the pipe reaches the target depth, it's time for our hero.",
        "Low-Mobility Grout, or special thick cement, is pumped down the pipe.",
        "As it exits the tip, it expands into a circular bulb like a balloon.",
        "The immense pressure immediately compacts the surrounding soil. It's like laying the strongest cornerstone."
      ]
    },
    zh: {
      title: "第二步：初次注浆 (Primary Injection)",
      description: "通过管道注入浓缩水泥，建立坚固的球体基础。",
      script: [
        "一旦管道到达目标深度，主角就登场了。",
        "低流动性浆液，即特制的浓缩水泥，被泵入管道。",
        "当它从尖端流出时，会像气球一样膨胀成球体。",
        "巨大的压力立即压实周围的土壤。就像奠定了最坚固的基石。"
      ]
    }
  },
  {
    id: 5,
    th: {
      title: "ขั้นตอนที่ 3: การสร้างเสาต่อเนื่อง (Column Formation)",
      description: "ดึงท่อขึ้นทีละนิดและอัดฉีดซ้อนกันเหมือนต่อเลโก้ จนกลายเป็นเสาซีเมนต์ที่มั่นคง",
      script: [
        "ขั้นตอนที่ 3: การสร้างเสาต่อเนื่อง (Column Formation) ดึงท่อขึ้นทีละนิดและอัดฉีดซ้อนกันเหมือนต่อเลโก้ จนกลายเป็นเสาซีเมนต์ที่มั่นคง",
        "หลังจากที่เราสร้างฐานที่แข็งแรงที่สุดตรงก้นหลุมได้แล้ว",
        "ขั้นตอนต่อไปก็คือการสร้างเสาขึ้นมาเพื่อค้ำจุนทุกอย่างไว้...",
        "มันเหมือนกับการต่อเลโก้จากข้างล่างขึ้นมาเลยครับ",
        "เราจะค่อยๆ ดึงท่อเหล็กขึ้นมาทีละนิด",
        "แล้วก็อัดฉีดซีเมนต์สร้างกระเปาะใหม่ซ้อนทับก้อนเดิมไปเรื่อยๆ",
        "จนกระทั่งมันกลายเป็นเสาต้นนึงที่แข็งแรงและก็ทนทานมากๆ"
      ],
      audio: audio5
    },
    en: {
      title: "Step 3: Column Formation",
      description: "Withdrawing the pipe incrementally and stacking grout bulbs like Lego to form a column.",
      script: [
        "After creating a solid base at the bottom, the next step is to build a column to support everything.",
        "It's like building Lego from the bottom up.",
        "We slowly withdraw the pipe incrementally.",
        "Then we inject cement to form new bulbs stacking on top of the old ones,",
        "until it becomes a strong and durable column."
      ]
    },
    zh: {
      title: "第三步：桩体形成 (Column Formation)",
      description: "逐步拔出管道，像搭积木一样堆叠浆液球体，形成桩体。",
      script: [
        "在底部建立坚固的基础后，下一步是建立支撑一切的柱体。",
        "就像从下往上搭积木一样。",
        "我们缓慢拔出管道。",
        "并注入浆液在旧球体上方形成新球体，",
        "从而形成坚固耐用的柱体。"
      ]
    }
  },
  {
    id: 6,
    th: {
      title: "ผลลัพธ์ที่ยั่งยืน (Sustainable Result)",
      description: "ดินแน่นขึ้น ฐานรากมั่นคง และสามารถยกอาคารที่ทรุดตัวให้กลับคืนสู่ระดับเดิม",
      script: [
        "ผลลัพธ์ที่ยั่งยืน (Sustainable Result) ดินแน่นขึ้น ฐานรากมั่นคง และสามารถยกอาคารที่ทรุดตัวให้กลับคืนสู่ระดับเดิม",
        "พอทุกอย่างเสร็จเรียบร้อยแล้วเนี่ย ผลลัพธ์ที่ได้มันไม่ใช่แค่การซ่อมแซมแบบชั่วคราวชนะครับ",
        "แต่มันคือการสร้างความมั่นคงที่จะอยู่ไปอีกนานแสนนานเลย...",
        "และนี่คืออีกหนึ่งความเจ๋งของเทคนิคนี้เลย คือมันไม่ใช่แค่ทำให้ดินแน่นขึ้นนะ",
        "แต่เรายังสามารถใช้แรงดันเนี่ย ยกอาคารที่ทรุดตัวให้กลับขึ้นมาตรงเหมือนเดิมได้ด้วย",
        "เหมือนมีแม่แรงยักษ์มาช่วยดันจากใต้ดินเลยล่ะครับ...",
        "สุดท้ายแล้วใต้พื้นดินที่เรามองไม่เห็นเนี่ย มันจะเต็มไปด้วยเสาซีเมนต์แข็งแกร่งที่เรียงรายกัน",
        "เหมือนเป็นกองทัพเลย คอยปกป้อง คอยค้ำจุนโครงสร้างของเราไว้อย่างเงียบๆ และทรงพลังมากๆ"
      ],
      audio: audio6
    },
    en: {
      title: "Sustainable Result",
      description: "Densified soil, stable foundation, and capability to lift subsided structures.",
      script: [
        "Once completed, the result isn't just a temporary repair.",
        "It creates stability that lasts for a very long time.",
        "The cool thing is, not only does it densify the soil,",
        "but the pressure can also lift subsided structures back to level.",
        "Like a giant jack pushing from underground.",
        "Finally, the ground beneath is filled with strong cement columns,",
        "standing like an army, silently and powerfully supporting our structures."
      ]
    },
    zh: {
      title: "可持续的结果 (Sustainable Result)",
      description: "土壤加密，地基稳固，并能抬升下沉的结构。",
      script: [
        "完成后，结果不仅仅是临时修复。",
        "它创造了持久的稳定性。",
        "最棒的是，它不仅能加密土壤，",
        "还能利用压力将下沉的结构抬升回原来的水平。",
        "就像地下有一个巨大的千斤顶。",
        "最终，地下充满了坚固的水泥柱，",
        "像一支军队一样，默默而有力地支撑着我们的建筑。"
      ]
    }
  }
];

export const QUIZ_DATA: QuizQuestion[] = [
  {
    id: 1,
    question: {
      th: "Compaction Grouting ใช้วัสดุแบบใดในการอัดฉีด?",
      en: "What type of material is used in Compaction Grouting?",
      zh: "压密注浆使用什么类型的材料？"
    },
    options: {
      th: ["น้ำโคลนเหลว", "ซีเมนต์ข้นความหนืดสูง (Low Mobility Grout)", "สารเคมีขยายตัว", "ทรายแห้ง"],
      en: ["Liquid Slurry", "Low Mobility Grout (Stiff)", "Expanding Chemical", "Dry Sand"],
      zh: ["液体浆料", "低流动性浆液（稠）", "膨胀化学品", "干沙"]
    },
    correctAnswer: 1
  },
  {
    id: 2,
    question: {
      th: "กระบวนการสร้างเสาเข็มทำในทิศทางใด?",
      en: "In which direction is the column formed?",
      zh: "桩体是在哪个方向形成的？"
    },
    options: {
      th: ["จากบนลงล่าง (Top-Down)", "จากล่างขึ้นบน (Bottom-Up)", "ทำพร้อมกันทั้งต้น", "ไม่มีทิศทางที่แน่นอน"],
      en: ["Top-Down", "Bottom-Up", "All at once", "Random"],
      zh: ["自上而下", "自下而上", "一次成型", "随机"]
    },
    correctAnswer: 1
  },
  {
    id: 3,
    question: {
      th: "ข้อดีหลักของ Compaction Grouting คืออะไร?",
      en: "What is the main advantage of Compaction Grouting?",
      zh: "压密注浆的主要优点是什么？"
    },
    options: {
      th: ["ราคาถูกที่สุด", "ใช้น้ำเยอะ", "เพิ่มความหนาแน่นของดินและยกโครงสร้างได้", "ทำได้เร็วที่สุด"],
      en: ["Cheapest option", "Uses lots of water", "Densifies soil and can heave structures", "Fastest method"],
      zh: ["最便宜的选择", "使用大量水", "加密土壤并能抬升结构", "最快的方法"]
    },
    correctAnswer: 2
  }
];

export const GUIDE_STEPS: GuideStep[] = [
  {
    targetId: 'visual-stage',
    title: { th: 'หน้าจอแสดงผล', en: 'Visual Stage', zh: '视觉舞台' },
    description: { th: 'แสดงภาพอนิเมชั่นจำลองขั้นตอนการทำงาน', en: 'Displays the animated simulation of the process.', zh: '显示过程的动画模拟。' },
    modeRequired: 'STORY'
  },
  {
    targetId: 'tab-story',
    title: { th: 'โหมดเนื้อเรื่อง', en: 'Story Mode', zh: '故事模式' },
    description: { th: 'เรียนรู้ทีละขั้นตอนผ่านการเล่าเรื่องพร้อมภาพประกอบ', en: 'Learn step-by-step with narrative storytelling.', zh: '通过叙事故事逐步学习。' },
    modeRequired: 'STORY'
  },
  {
    targetId: 'controls-area',
    title: { th: 'แผงควบคุม', en: 'Control Panel', zh: '控制面板' },
    description: { th: 'เล่นอัตโนมัติ เปิด/ปิดเสียง และเปลี่ยนฉาก', en: 'Auto-play, toggle audio, and navigate scenes.', zh: '自动播放，切换音频和导航场景。' },
    modeRequired: 'STORY'
  },
  {
    targetId: 'tab-sim',
    title: { th: 'โหมดจำลอง (Lab)', en: 'Simulation Lab', zh: '模拟实验室' },
    description: { th: 'ทดลองควบคุมเครื่องจักรด้วยตัวเอง ควบคุมแรงดันและการอัดฉีด', en: 'Manually control the machinery, pressure, and injection.', zh: '手动控制机械、压力和注浆。' },
    modeRequired: 'SIMULATION'
  },
  {
    targetId: 'tab-quiz',
    title: { th: 'แบบทดสอบ', en: 'Quiz Mode', zh: '测验模式' },
    description: { th: 'ทดสอบความรู้หลังเรียนจบ', en: 'Test your knowledge after learning.', zh: '学习后测试您的知识。' },
    modeRequired: 'QUIZ'
  }
];