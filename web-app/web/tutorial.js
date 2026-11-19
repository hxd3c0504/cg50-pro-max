(()=>{
const en=()=>document.documentElement.lang.startsWith('en');
const t=(zh,english)=>en()?english:zh;
const courses = {
 "basics": {
  "title": [
   "基础操作与操作技巧",
   "Calculator basics and tips"
  ],
  "question": [
   "第一次拿到 CG50。算出 1/3 和 π/2，看看同一个答案的两种写法。",
   "Your first CG50 calculation: display 1/3 and π/2 in two forms."
  ],
  "steps": [
   {
    "text": [
     "按蓝色 AC/ON 开机。按 MENU 看所有应用，按 1 进入「计算·矩阵」。",
     "Press AC/ON to power on, MENU to see the apps, then 1 for Run-Matrix."
    ],
    "keys": [
     "AC",
     "MENU",
     "1"
    ],
    "auto": true
   },
   {
    "text": [
     "输入 1 ÷ 2，先别按 EXE。按 DEL 删去 2，改输 3，再按 EXE。",
     "Type 1 ÷ 2. Before evaluating, press DEL, replace 2 with 3, then press EXE."
    ],
    "keys": [
     "1",
     "/",
     "2",
     "DEL",
     "3",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按 S↔D。观察 1/3 和 0.333…，再按一次切回来。",
     "Press S↔D to switch between 1/3 and 0.333…; press again to switch back."
    ],
    "keys": [
     "SD",
     "SD"
    ],
    "auto": true
   },
   {
    "text": [
     "按 SHIFT，再按黄色 π 下方的 ×10ˣ。输入 ÷ 2，按 EXE，再用 S↔D 切换。",
     "Press SHIFT, then ×10ˣ under the yellow π label. Enter ÷ 2, press EXE, then switch with S↔D."
    ],
    "keys": [
     "SHIFT",
     "EXP",
     "/",
     "2",
     "EXE",
     "SD"
    ],
    "auto": true
   },
   {
    "text": [
     "按 OPTN。找到屏幕底部第 4 格 CALC，按正下方 F4。底栏换了一排，按 EXIT 退一层，再按 EXIT 回输入行。",
     "Press OPTN and read the fourth bottom label, CALC. Press F4 beneath it. Notice the new labels; press EXIT twice to return to entry."
    ],
    "keys": [
     "OPTN",
     "F4",
     "EXIT",
     "EXIT"
    ],
    "auto": true
   },
   {
    "text": [
     "按 ALPHA，再按红色 A 下方的 X,θ,T，确认输入行出现 A。按 AC 清空输入。",
     "Press ALPHA, then X,θ,T beneath the red A. Check that A appears, then clear the entry with AC."
    ],
    "keys": [
     "ALPHA",
     "XVAR",
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "按 MENU 回主菜单。按 SHIFT，再按 AC/ON 上方的黄色 OFF 关机。",
     "Press MENU to return home. Press SHIFT followed by AC/ON beneath the yellow OFF label to power down."
    ],
    "keys": [
     "MENU",
     "SHIFT",
     "AC"
    ],
    "auto": true
   }
  ],
  "result": [
   "π/2 ≈ 1.5708。再开机试一次：先看底栏文字，再选对应的 F 键。",
   "π/2 ≈ 1.5708. Power on again and use a bottom label to choose the matching F key."
  ]
 },
 "derivative": {
  "title": [
   "怎么在 x 的位置求导",
   "Find the derivative at a given x"
  ],
  "question": [
   "位置 s(t)=t² 米。第 3 秒的瞬时速度是多少？",
   "Position is s(t)=t² metres. Find the instantaneous speed at 3 seconds."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "MENU → 1 进入计算。按 OPTN → F4（CALC），看新底栏。",
     "Open MENU → 1. Press OPTN → F4 (CALC) and read the new labels."
    ],
    "keys": [
     "MENU",
     "1",
     "OPTN",
     "F4"
    ],
    "auto": true
   },
   {
    "text": [
     "按 F2（d/dx）。在函数框按 X,θ,T，再按 x²，得到 X²。",
     "Press F2 (d/dx). In the function box press X,θ,T followed by x²."
    ],
    "keys": [
     "F2",
     "XVAR",
     "SQ"
    ],
    "auto": true
   },
   {
    "text": [
     "按右方向键移到求导点，输入 3，再按 EXE。",
     "Press the right arrow to reach the evaluation point, enter 3, then EXE."
    ],
    "keys": [
     "ArrowRight",
     "3",
     "EXE"
    ],
    "auto": true
   }
  ],
  "result": [
   "结果 6 米/秒。自己把求导点改成 4 再算一次，应得到 8。",
   "The speed is 6 m/s. Try the same function at 4 seconds and check for 8 m/s."
  ]
 },
 "integral": {
  "title": [
   "怎么输入定积分",
   "Enter a definite integral"
  ],
  "question": [
   "流量为 t² 升/分钟。从第 0 到第 2 分钟一共流过多少升？",
   "Flow is t² litres per minute. How much flows from minute 0 to minute 2?"
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "进入 MENU → 1。按 OPTN → F4（CALC）→ F4（∫dx）。",
     "Open MENU → 1, then OPTN → F4 (CALC) → F4 (∫dx)."
    ],
    "keys": [
     "MENU",
     "1",
     "OPTN",
     "F4",
     "F4"
    ],
    "auto": true
   },
   {
    "text": [
     "在函数框输入 X²。按右方向键进下限填 0，再按右方向键进上限填 2。",
     "Enter X². Move right to the lower limit and enter 0, then right to the upper limit and enter 2."
    ],
    "keys": [
     "XVAR",
     "SQ",
     "ArrowRight",
     "0",
     "ArrowRight",
     "2"
    ],
    "auto": true
   },
   {
    "text": [
     "确认下限在下面、上限在上面，按 EXE。再试把上下限交换。",
     "Check the positions of the two limits and press EXE. Try exchanging the limits."
    ],
    "keys": [
     "EXE"
    ]
   }
  ],
  "result": [
   "累计流量约 2.6667 升，即 8/3 升。交换上下限后，积分约为 −2.6667。",
   "The accumulated volume is about 2.6667 L, or 8/3 L. Reversing the limits gives about −2.6667."
  ]
 },
 "absolute": {
  "title": [
   "怎么输入绝对值",
   "Enter an absolute value"
  ],
  "question": [
   "温度偏差是 −3 °C，要报告偏差的大小。",
   "A temperature deviation is −3 °C. Report its magnitude."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "MENU → 1。按 OPTN → F6（下一页）→ F4（NUM）→ F1（Abs）。",
     "Open MENU → 1, then OPTN → F6 (next page) → F4 (NUM) → F1 (Abs)."
    ],
    "keys": [
     "MENU",
     "1",
     "OPTN",
     "F6",
     "F4",
     "F1"
    ],
    "auto": true
   },
   {
    "text": [
     "在绝对值模板内按专门的负号键 (−)，输入 3，按 EXE。",
     "Inside the absolute-value template, press the dedicated (−) key, enter 3, then EXE."
    ],
    "keys": [
     "NEG",
     "3",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "再打开 Abs，在里面输入 2 − 5，这一次用两个数之间的减号键。",
     "Open Abs again and enter 2 − 5 inside, using the subtraction key between the numbers."
    ]
   }
  ],
  "result": [
   "两次都得到 3。第一题输入负数，第二题先算括在绝对值里的差。",
   "Both answers are 3. The first uses a negative number; the second evaluates a difference inside Abs."
  ]
 },
 "polar": {
  "title": [
   "怎么画极坐标图（Polar）",
   "Plot a polar graph"
  ],
  "question": [
   "用极坐标画 r=2sin(θ)，并判断圆位于横轴哪一侧。",
   "Plot r=2sin(θ) in polar form and locate the circle relative to the horizontal axis."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "MENU → 5 进入图形。用空白图形行，按 F3（TYPE）→ F2（r=）。",
     "Open Graph with MENU → 5. Choose an empty graph row, then F3 (TYPE) → F2 (r=)."
    ],
    "keys": [
     "MENU",
     "5"
    ]
   },
   {
    "text": [
     "按 SHIFT → MENU 打开 SET UP，Angle 选 Rad。按 EXIT 返回。",
     "Open SET UP with SHIFT → MENU, set Angle to Rad and press EXIT."
    ],
    "keys": [
     "SHIFT",
     "MENU"
    ]
   },
   {
    "text": [
     "输入 2sin(θ)。用 X,θ,T 键填 θ，确认 sin 的括号只配一对。按 EXE 保存。",
     "Enter 2sin(θ), using X,θ,T for θ. Check the parentheses around θ, then press EXE."
    ],
    "keys": [
     "2",
     "SIN"
    ]
   },
   {
    "text": [
     "在 V-Window 将 θ 范围设为 0 到 2π、步长约 0.05，确保坐标窗包含 x=−2 到 2、y=−1 到 3。退出后按 DRAW。",
     "In V-Window use θ from 0 to 2π with a step near 0.05. Include x from −2 to 2 and y from −1 to 3. Exit and select DRAW."
    ]
   }
  ],
  "result": [
   "图形在横轴上方，与原点相切，最高到 (0,2)。若显示像椭圆，用等比例坐标观察。",
   "The circle lies above the axis, touches the origin and reaches (0,2). Use equal axis scales if it looks stretched."
  ]
 },
 "s1.1": {
  "title": [
   "进入统计模式并输入数据",
   "Enter data in Statistics"
  ],
  "question": [
   "录入 4 次通勤时间：12、15、18、20 分钟。第二个数曾误记成 16。",
   "Enter four commute times: 12, 15, 18 and 20 minutes. The second was first recorded as 16."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "按 MENU → 2 进入统计。看 List 1 第一格，练习数据会输入这里。",
     "Press MENU → 2 for Statistics. Find the first cell of List 1."
    ],
    "keys": [
     "MENU",
     "2"
    ],
    "auto": true
   },
   {
    "text": [
     "逐个输 12、16、18、20，每个数后按 EXE，观察光标向下移一行。",
     "Enter 12, 16, 18 and 20, pressing EXE after each. Watch the cursor move down."
    ],
    "keys": [
     "1",
     "2",
     "EXE",
     "1",
     "6",
     "EXE",
     "1",
     "8",
     "EXE",
     "2",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移回第 2 格，直接输入 15 → EXE。再在末尾临时加一个 99，选中该格，按 F6 → F3（DELETE）删除。",
     "Go back to row 2, type 15 and press EXE. Append a spare 99, select that cell and press F6 → F3 (DELETE) to remove it."
    ]
   }
  ],
  "result": [
   "列表只有四行 12、15、18、20。若下次要清空练习列，在该列选 F6 → F4（DEL-ALL） 并核对确认提示。",
   "The four entries are 12, 15, 18, 20. To clear a practice column later, select F6 → F4 (DEL-ALL) in that column and check the confirmation."
  ]
 },
 "s1.2": {
  "title": [
   "输入频数表",
   "Enter a frequency table"
  ],
  "question": [
   "四类测验成绩是 60、70、80、90 分，对应人数是 1、2、4、1。求全班平均分。",
   "Scores of 60, 70, 80 and 90 have frequencies 1, 2, 4 and 1. Find the class mean."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "按 MENU → 2 进入统计。看 List 1 第一格，练习数据会输入这里。",
     "Press MENU → 2 for Statistics. Find the first cell of List 1."
    ],
    "keys": [
     "MENU",
     "2"
    ],
    "auto": true
   },
   {
    "text": [
     "在 List 1 依次输入 60、70、80、90，每个数后按 EXE。",
     "Enter 60, 70, 80, 90 in List 1. Press EXE after each value."
    ],
    "keys": [
     "6",
     "0",
     "EXE",
     "7",
     "0",
     "EXE",
     "8",
     "0",
     "EXE",
     "9",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按 → 移到空白 List 2 的第一格。逐行录入 1, 2, 4, 1。",
     "Move right to the first cell of empty List 2. Enter 1, 2, 4, 1 one row at a time."
    ],
    "keys": [
     "ArrowRight",
     "1",
     "EXE",
     "2",
     "EXE",
     "4",
     "EXE",
     "1",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "两列应各有 4 个数。第一列是分数，第二列是人数。",
     "Check that both lists contain four entries: scores in the first and counts in the second."
    ]
   },
   {
    "text": [
     "CALC → SET。单变量 XList 用 List 1。按 ↓ 到频数行，选「列表」，填 2 → EXE。",
     "Open CALC → SET. Keep 1Var XList at List 1. Move to frequency, choose List and enter 2."
    ],
    "keys": [
     "F2",
     "F6",
     "ArrowDown",
     "F2",
     "2",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按 EXIT 回计算菜单，按 F1（1VAR）查看 n 和平均数。",
     "Press EXIT, then F1 (1VAR). Read the sample size and mean."
    ],
    "keys": [
     "EXIT",
     "F1"
    ],
    "auto": true
   },
   {
    "text": [
     "应看到 n=8 和 x̄=76.25。退出结果页，回 CALC → SET，把 1Var Freq 调回 1，留给下一组原始数据。",
     "Expect n=8 and x̄=76.25. Leave the results, reopen CALC → SET and restore 1Var Freq to 1 for raw data."
    ]
   }
  ],
  "result": [
   "应得 n=8、平均 76.25 分。如果 n=4，检查频数栏是否仍然填着 1。",
   "Expect n=8 and a mean of 76.25. If n=4, check whether the frequency field still contains 1."
  ]
 },
 "s1.3": {
  "title": [
   "画直方图",
   "Draw a histogram"
  ],
  "question": [
   "八次等待时间为 2、4、4、6、8、12、14、14 分钟。画组距为 5 的直方图。",
   "Eight waits are 2, 4, 4, 6, 8, 12, 14 and 14 minutes. Plot a histogram with bin width 5."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "按 MENU → 2 进入统计。看 List 1 第一格，练习数据会输入这里。",
     "Press MENU → 2 for Statistics. Find the first cell of List 1."
    ],
    "keys": [
     "MENU",
     "2"
    ],
    "auto": true
   },
   {
    "text": [
     "在 List 1 依次输入 2、4、4、6、8、12、14、14，每个数后按 EXE。",
     "Enter 2, 4, 4, 6, 8, 12, 14, 14 in List 1. Press EXE after each value."
    ],
    "keys": [
     "2",
     "EXE",
     "4",
     "EXE",
     "4",
     "EXE",
     "6",
     "EXE",
     "8",
     "EXE",
     "1",
     "2",
     "EXE",
     "1",
     "4",
     "EXE",
     "1",
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按 GRPH → SET，选 StatGraph1，在 Graph Type 行选 Hist。",
     "Open GRPH → SET. Select StatGraph1 and choose Hist on the Graph Type row."
    ],
    "keys": [
     "F1",
     "F6"
    ],
    "auto": false
   },
   {
    "text": [
     "将 XList 设为 List 1、Frequency 设为 1。EXIT → GPH1。",
     "Set XList to List 1 and Frequency to 1, then EXIT → GPH1."
    ]
   },
   {
    "text": [
     "填 Start=0，Pitch=5，执行 DRAW。读出三根柱子的高度，再将 Pitch 改为 10 重画。",
     "Set Start=0 and Pitch=5, then DRAW. Read the three heights and repeat with Pitch=10."
    ]
   }
  ],
  "result": [
   "组距 5 时，三个区间 [0,5)、[5,10)、[10,15) 的频数为 3、2、3。组距 10 时为 5、3，总数仍是 8。",
   "At width 5 the three counts are 3, 2, 3 in [0,5), [5,10), [10,15). At width 10 they are 5, 3. Both totals are 8."
  ]
 },
 "s1.4": {
  "title": [
   "求平均数、标准差和五数概括",
   "Find the mean, standard deviation and five-number summary"
  ],
  "question": [
   "用同样八次等待时间 2、4、4、6、8、12、14、14 描述中心和离散程度。",
   "Describe the centre and spread of the waits 2, 4, 4, 6, 8, 12, 14 and 14."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "按 MENU → 2 进入统计。看 List 1 第一格，练习数据会输入这里。",
     "Press MENU → 2 for Statistics. Find the first cell of List 1."
    ],
    "keys": [
     "MENU",
     "2"
    ],
    "auto": true
   },
   {
    "text": [
     "在 List 1 依次输入 2、4、4、6、8、12、14、14，每个数后按 EXE。",
     "Enter 2, 4, 4, 6, 8, 12, 14, 14 in List 1. Press EXE after each value."
    ],
    "keys": [
     "2",
     "EXE",
     "4",
     "EXE",
     "4",
     "EXE",
     "6",
     "EXE",
     "8",
     "EXE",
     "1",
     "2",
     "EXE",
     "1",
     "4",
     "EXE",
     "1",
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按 SHIFT → MENU，在统计设置中将 Q1Q3 Type 设为 Std，再按 EXIT 回列表。",
     "Open SET UP with SHIFT → MENU. Set Q1Q3 Type to Std and return to the list with EXIT."
    ],
    "keys": [
     "SHIFT",
     "MENU"
    ],
    "auto": false
   },
   {
    "text": [
     "CALC → SET 选 XList=List 1、Freq=1。返回后选 1VAR，读 x̄、sx、σx 和 n。",
     "Under CALC → SET choose List 1 and Freq=1. Return to 1VAR and read x̄, sx, σx and n."
    ],
    "keys": [
     "F2",
     "F6"
    ]
   },
   {
    "text": [
     "用向下键找到 minX、Q1、Med、Q3、maxX，用 Q3−Q1 算 IQR。",
     "Scroll down to minX, Q1, Med, Q3 and maxX. Subtract Q1 from Q3 for the IQR."
    ]
   }
  ],
  "result": [
   "平均 8，样本标准差约 4.781，总体标准差约 4.472。五数概括为 2、4、7、13、14，IQR=9。",
   "Mean 8, sample SD about 4.781, population SD about 4.472. Five-number summary: 2, 4, 7, 13, 14; IQR=9."
  ]
 },
 "s1.5": {
  "title": [
   "画箱线图、找离群值和比较两组数据",
   "Use boxplots to find outliers and compare groups"
  ],
  "question": [
   "比较两组等待时间。A 为 2、3、3、4、4、5、5、14，B 为 4、5、5、6、6、7、7、16。",
   "Compare waits. A: 2, 3, 3, 4, 4, 5, 5, 14. B: 4, 5, 5, 6, 6, 7, 7, 16."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "按 MENU → 2 进入统计。看 List 1 第一格，练习数据会输入这里。",
     "Press MENU → 2 for Statistics. Find the first cell of List 1."
    ],
    "keys": [
     "MENU",
     "2"
    ],
    "auto": true
   },
   {
    "text": [
     "在 List 1 依次输入 2、3、3、4、4、5、5、14，每个数后按 EXE。",
     "Enter 2, 3, 3, 4, 4, 5, 5, 14 in List 1. Press EXE after each value."
    ],
    "keys": [
     "2",
     "EXE",
     "3",
     "EXE",
     "3",
     "EXE",
     "4",
     "EXE",
     "4",
     "EXE",
     "5",
     "EXE",
     "5",
     "EXE",
     "1",
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按 → 移到空白 List 2 的第一格。逐行录入 4, 5, 5, 6, 6, 7, 7, 16。",
     "Move right to the first cell of empty List 2. Enter 4, 5, 5, 6, 6, 7, 7, 16 one row at a time."
    ],
    "keys": [
     "ArrowRight",
     "4",
     "EXE",
     "5",
     "EXE",
     "5",
     "EXE",
     "6",
     "EXE",
     "6",
     "EXE",
     "7",
     "EXE",
     "7",
     "EXE",
     "1",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "GRPH → SET，将 GPH1 和 GPH2 均设为 MedBox，XList 分别选 List 1、List 2。",
     "Open GRPH → SET. Use MedBox for both GPH1 and GPH2; set XList to List 1 and List 2 respectively."
    ],
    "keys": [
     "F1",
     "F6"
    ],
    "auto": false
   },
   {
    "text": [
     "两张图均选 Freq=1、Outliers=On。返回 GRPH → SEL，让 GPH1、GPH2 同时 On，再 DRAW。",
     "Use Freq=1 and Outliers=On for both. Return to GRPH → SEL, enable GPH1 and GPH2, then DRAW."
    ]
   },
   {
    "text": [
     "比较同一刻度下的中位数。用 A 的 Q1=3、Q3=5 算上围栏 5+1.5×(5−3)。",
     "Compare medians on the shared scale. Use Q1=3 and Q3=5 for A to compute the upper fence, 5+1.5×(5−3)."
    ]
   }
  ],
  "result": [
   "中位数从 4 移到 6，两组 IQR 都是 2。A 的上围栏为 8，所以 14 单独成点；B 的 16 也单独成点。",
   "The medians shift from 4 to 6. Both IQRs are 2. A’s upper fence is 8, so 14 is plotted separately, as is 16 in B."
  ]
 },
 "s1.6": {
  "title": [
   "随机抽样和随机分组",
   "Draw a random sample and assign groups"
  ],
  "question": [
   "从 12 位同学中抽 4 位接受访谈。再设计一个实验，把这 12 人平均随机分组。",
   "Select 4 of 12 students for interviews. Then randomly assign the 12 students to two equal experiment groups."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "给每人编唯一号码 1 到 12。MENU → 1 → OPTN → 下一页 → PROB → RAND → Int。",
     "Give everyone a unique ID from 1 to 12. Open MENU → 1 → OPTN → next page → PROB → RAND → Int."
    ],
    "keys": [
     "MENU",
     "1",
     "OPTN",
     "F6",
     "F3",
     "F4",
     "F2"
    ],
    "auto": true
   },
   {
    "text": [
     "补全 RanInt#(1,12)，按 EXE。反复执行，记录前四个不同编号，重复号跳过。",
     "Complete RanInt#(1,12) and press EXE. Repeat until you have four distinct IDs, skipping repeats."
    ],
    "keys": [
     "1",
     ",",
     "1",
     "2",
     ")",
     "EXE"
    ]
   },
   {
    "text": [
     "分组实验另起一次抽取。从完整名单抽六个不同编号进 A 组，其余六人进 B 组。",
     "Start fresh for the experiment. Draw six distinct IDs from the full roster for A and assign the rest to B."
    ]
   }
  ],
  "result": [
   "访谈样本应有四个不同编号。实验分组应是 6 加 6，每人恰好出现一次。每次运行的编号可以不同。",
   "Check four distinct interview IDs. The experiment needs six per group and each ID exactly once. Different draws are valid."
  ]
 },
 "s2.1": {
  "title": [
   "用双向表算条件概率",
   "Find conditional probabilities from a two-way table"
  ],
  "question": [
   "40 人的调查中，住校生有 12 人骑车、8 人步行，走读生有 6 人骑车、14 人步行。",
   "Of 40 students, 12 boarders cycle and 8 walk. Among day students, 6 cycle and 14 walk."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "先圈出“已知住校”的 20 人。MENU → 1，输入 12 ÷ (12+8) → EXE。",
     "Restrict attention to the 20 boarders. Open MENU → 1 and enter 12 ÷ (12+8) → EXE."
    ],
    "keys": [
     "MENU",
     "1",
     "1",
     "2",
     "/",
     "(",
     "1",
     "2",
     "+",
     "8",
     ")",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "再圈出“已知骑车”的人。输入 12 ÷ (12+6) → EXE，用 S↔D 看小数。",
     "Now restrict attention to cyclists. Enter 12 ÷ (12+6) → EXE and use S↔D for a decimal."
    ],
    "keys": [
     "1",
     "2",
     "/",
     "(",
     "1",
     "2",
     "+",
     "6",
     ")",
     "EXE",
     "SD"
    ],
    "auto": true
   },
   {
    "text": [
     "再算“随机抽到一位既住校又骑车的同学”。这次分母用全体 40 人。",
     "Now find the probability of drawing someone who both boards and cycles. Use the full group of 40."
    ],
    "keys": [
     "1",
     "2",
     "/",
     "4",
     "0",
     "EXE"
    ],
    "auto": true
   }
  ],
  "result": [
   "P(骑车｜住校)=0.60，P(住校｜骑车)≈0.667，P(住校且骑车)=0.30。三个算式的分子都是 12。",
   "P(cycles given boarder)=0.60, P(boarder given cyclist)≈0.667, and P(both)=0.30. All three numerators are 12."
  ]
 },
 "s2.2": {
  "title": [
   "用随机数模拟概率",
   "Simulate probability with random numbers"
  ],
  "question": [
   "每次罚球独立，命中率 30%。用模拟估计三次罚球至少命中一次的概率。",
   "Each free throw independently has a 30% chance of success. Simulate the chance of at least one make in three throws."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "MENU → 1 → OPTN → 下一页 → PROB → RAND → Int。输入 RanInt#(1,10,3) → EXE。",
     "Open MENU → 1 → OPTN → next page → PROB → RAND → Int. Enter RanInt#(1,10,3) → EXE."
    ],
    "keys": [
     "MENU",
     "1",
     "OPTN",
     "F6",
     "F3",
     "F4",
     "F2",
     "1",
     ",",
     "1",
     "0",
     ",",
     "3",
     ")",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "一次输出三个数，代表一轮。1 到 3 算命中，4 到 10 算未中。例：{8,2,2} 这一轮记 1。",
     "Treat the three numbers as one round. Values 1–3 are makes and 4–10 are misses. For {8,2,2}, record one successful round."
    ]
   },
   {
    "text": [
     "重复共 20 轮，每轮只记 0 或 1。用成功轮数 ÷ 20，按 EXE 得模拟估计。",
     "Run 20 rounds in total, recording one 0 or 1 per round. Divide successful rounds by 20 and press EXE."
    ]
   }
  ],
  "result": [
   "用 1−0.7³ 得理论值 0.657。模拟值随抽样波动，验收看每轮的事件和分母是否正确。",
   "Compare with the theoretical 1−0.7³=0.657. Estimates vary; check how a successful round was defined and counted."
  ]
 },
 "s2.3": {
  "title": [
   "用概率表求期望和标准差",
   "Find expected value and standard deviation"
  ],
  "question": [
   "每天收到 0、1、2 份作业的概率分别是 0.2、0.5、0.3。求期望和标准差。",
   "Daily assignment counts 0, 1 and 2 have probabilities 0.2, 0.5 and 0.3. Find the mean and SD."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "按 MENU → 2 进入统计。看 List 1 第一格，练习数据会输入这里。",
     "Press MENU → 2 for Statistics. Find the first cell of List 1."
    ],
    "keys": [
     "MENU",
     "2"
    ],
    "auto": true
   },
   {
    "text": [
     "在 List 1 依次输入 0、1、2，每个数后按 EXE。",
     "Enter 0, 1, 2 in List 1. Press EXE after each value."
    ],
    "keys": [
     "0",
     "EXE",
     "1",
     "EXE",
     "2",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按 → 移到空白 List 2 的第一格。逐行录入 0.2, 0.5, 0.3。",
     "Move right to the first cell of empty List 2. Enter 0.2, 0.5, 0.3 one row at a time."
    ],
    "keys": [
     "ArrowRight",
     "0",
     ".",
     "2",
     "EXE",
     "0",
     ".",
     "5",
     "EXE",
     "0",
     ".",
     "3",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "检查 List 2 三个概率之和为 1。下一步用这两列求期望。",
     "Check that the three probabilities in List 2 sum to 1 before computing the expectation."
    ]
   },
   {
    "text": [
     "MENU → 1，用 OPTN → LIST 选择 Sum 和 List 指令。输入 Sum(List 1 × List 2) → EXE，记下 μ。",
     "Open MENU → 1. Use OPTN → LIST to insert Sum and List commands. Evaluate Sum(List 1 × List 2) and record μ."
    ],
    "keys": [
     "MENU",
     "1",
     "OPTN"
    ]
   },
   {
    "text": [
     "计算 Sum((List 1 − 1.1)² × List 2) 得方差，再用 SHIFT → x² 插入平方根求标准差。",
     "Evaluate Sum((List 1 − 1.1)² × List 2) for the variance. Use SHIFT → x² to enter a square root for the SD."
    ]
   }
  ],
  "result": [
   "期望为 1.1 份，方差为 0.49，标准差为 0.7 份。若最后得到 0.49，还差一步开平方。",
   "The mean is 1.1 assignments, variance 0.49 and SD 0.7 assignments. A result of 0.49 still needs a square root."
  ]
 },
 "s2.4": {
  "title": [
   "用二项分布算恰好、至多和至少",
   "Find exact and cumulative binomial probabilities"
  ],
  "question": [
   "10 道独立判断题，每题答对概率为 0.6。分别求恰好、至多和至少答对 7 道的概率。",
   "For 10 independent questions with success probability 0.6, find the chance of exactly, at most and at least 7 correct."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "求恰好 7 次：MENU → 2 → DIST → BINM → Bpd。选变量，按 ↓ 进入第一项。",
     "For exactly 7, open Statistics → DIST → BINM → Bpd. Choose Variable and move down to the first field."
    ],
    "keys": [
     "MENU",
     "2",
     "F5",
     "F5",
     "F1",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "x 填 7，按 EXE 确认。",
     "Enter 7 for x, then press EXE."
    ],
    "keys": [
     "7",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Numtrial (n) 填 10，按 EXE 确认。",
     "Enter 10 for Numtrial (n), then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "p 填 0.6，按 EXE 确认。",
     "Enter 0.6 for p, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "结果约 0.2150。按两次 EXIT，再选 DIST → BINM → Bcd，求至多 7 次。选变量，按 ↓ 进入第一项。",
     "Check for 0.2150. Exit twice and choose DIST → BINM → Bcd for at most 7. Choose Variable and move down to the first field."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F5",
     "F5",
     "F2",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Lower 填 0，按 EXE 确认。",
     "Enter 0 for Lower, then press EXE."
    ],
    "keys": [
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Upper 填 7，按 EXE 确认。",
     "Enter 7 for Upper, then press EXE."
    ],
    "keys": [
     "7",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Numtrial (n) 填 10，按 EXE 确认。",
     "Enter 10 for Numtrial (n), then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "p 填 0.6，按 EXE 确认。",
     "Enter 0.6 for p, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "结果约 0.8327。回到 Bcd，这次求至少 7 次，从 7 累加到 10。选变量，按 ↓ 进入第一项。",
     "Check for 0.8327. Reopen Bcd for at least 7, summing from 7 to 10. Choose Variable and move down to the first field."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F5",
     "F5",
     "F2",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Lower 填 7，按 EXE 确认。",
     "Enter 7 for Lower, then press EXE."
    ],
    "keys": [
     "7",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Upper 填 10，按 EXE 确认。",
     "Enter 10 for Upper, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Numtrial (n) 填 10，按 EXE 确认。",
     "Enter 10 for Numtrial (n), then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "p 填 0.6，按 EXE 确认。",
     "Enter 0.6 for p, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   }
  ],
  "result": [
   "三次应依次得到 0.2150、0.8327、0.3823。用 1−P(X≤6) 核对最后一项。",
   "In order: 0.2150, 0.8327, 0.3823. Check the last value using 1−P(X≤6)."
  ]
 },
 "s2.5": {
  "title": [
   "用正态分布算概率",
   "Find normal probabilities"
  ],
  "question": [
   "分数服从正态分布，均值 70，标准差 10。一个人处于 60 到 80 分之间的概率是多少？",
   "Scores are normal with mean 70 and SD 10. What is the probability of a score between 60 and 80?"
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "算 60 到 80 之间的面积：MENU → 2 → DIST → NORM → Ncd。选变量，按 ↓ 进入第一项。",
     "For the area between 60 and 80 open Statistics → DIST → NORM → Ncd. Choose Variable and move down to the first field."
    ],
    "keys": [
     "MENU",
     "2",
     "F5",
     "F1",
     "F2",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Lower 填 60，按 EXE 确认。",
     "Enter 60 for Lower, then press EXE."
    ],
    "keys": [
     "6",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Upper 填 80，按 EXE 确认。",
     "Enter 80 for Upper, then press EXE."
    ],
    "keys": [
     "8",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "σ 填 10，按 EXE 确认。",
     "Enter 10 for σ, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "μ 填 70，按 EXE 确认。",
     "Enter 70 for μ, then press EXE."
    ],
    "keys": [
     "7",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "中间面积约 0.6827。现在回 Ncd 算低于 60 的左尾。选变量，按 ↓ 进入第一项。",
     "The middle area is about 0.6827. Reopen Ncd for the left tail below 60. Choose Variable and move down to the first field."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F5",
     "F1",
     "F2",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Lower 填 -1E99，按 EXE 确认。",
     "Enter -1E99 for Lower, then press EXE."
    ],
    "keys": [
     "NEG",
     "1",
     "EXP",
     "9",
     "9",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Upper 填 60，按 EXE 确认。",
     "Enter 60 for Upper, then press EXE."
    ],
    "keys": [
     "6",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "σ 填 10，按 EXE 确认。",
     "Enter 10 for σ, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "μ 填 70，按 EXE 确认。",
     "Enter 70 for μ, then press EXE."
    ],
    "keys": [
     "7",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "左尾约 0.1587。现在回 Ncd 算高于 80 的右尾。选变量，按 ↓ 进入第一项。",
     "Left tail ≈0.1587. Reopen Ncd for the right tail above 80. Choose Variable and move down to the first field."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F5",
     "F1",
     "F2",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Lower 填 80，按 EXE 确认。",
     "Enter 80 for Lower, then press EXE."
    ],
    "keys": [
     "8",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Upper 填 1E99，按 EXE 确认。",
     "Enter 1E99 for Upper, then press EXE."
    ],
    "keys": [
     "1",
     "EXP",
     "9",
     "9",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "σ 填 10，按 EXE 确认。",
     "Enter 10 for σ, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "μ 填 70，按 EXE 确认。",
     "Enter 70 for μ, then press EXE."
    ],
    "keys": [
     "7",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   }
  ],
  "result": [
   "中间约 0.6827，两侧各约 0.1587。用 (80−70)÷10=1 验证 80 分在均值上方一个标准差处。",
   "The centre has probability about 0.6827, each tail about 0.1587. Check that (80−70)÷10=1, one SD above the mean."
  ]
 },
 "s2.6": {
  "title": [
   "从百分位反查原始分数",
   "Find a score from its percentile"
  ],
  "question": [
   "同一场考试均值 70，标准差 10，分数近似正态。前 10% 的分数线在哪里？",
   "Scores are approximately normal with mean 70 and SD 10. Find the cutoff for the top 10%."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "进入 DIST → NORM → InvN。选择变量，移到 Tail 选右尾，再下移填面积。",
     "Open DIST → NORM → InvN, select Variable, move to Tail, select Right, then move down."
    ],
    "keys": [
     "MENU",
     "2",
     "F5",
     "F1",
     "F3",
     "F2",
     "ArrowDown",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Area 填 0.1，按 EXE 确认。",
     "Enter 0.1 for Area, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "1",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "σ 填 10，按 EXE 确认。",
     "Enter 10 for σ, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "μ 填 70，按 EXE 确认。",
     "Enter 70 for μ, then press EXE."
    ],
    "keys": [
     "7",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "临界分数约 82.82。回到 InvN，改用左侧面积 0.90。",
     "The cutoff is about 82.82. Reopen InvN and use left area 0.90."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F5",
     "F1",
     "F3",
     "F2",
     "ArrowDown",
     "F1",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Area 填 0.9，按 EXE 确认。",
     "Enter 0.9 for Area, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "9",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "σ 填 10，按 EXE 确认。",
     "Enter 10 for σ, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "μ 填 70，按 EXE 确认。",
     "Enter 70 for μ, then press EXE."
    ],
    "keys": [
     "7",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "两个分数相同。自行用 Ncd 输入 82.82 到 1×10⁹⁹、σ=10、μ=70，核对右尾约 0.10。",
     "The scores match. Use Ncd from 82.82 to 1×10⁹⁹ with σ=10 and μ=70 to check that the upper tail is about 0.10."
    ]
   }
  ],
  "result": [
   "两条路径都得约 82.82 分。若只记整数分，至少要 83 分。",
   "Both paths give about 82.82 points. With whole-number scores, the minimum qualifying score is 83."
  ]
 },
 "s3.1": {
  "title": [
   "计算样本比例的概率",
   "Find probabilities for sample proportions"
  ],
  "question": [
   "总体成功率 0.60，随机抽 100 人。用正态近似估计样本比例至少 0.70 的概率。",
   "Population success probability is 0.60. Approximate the chance that a random sample of 100 has proportion at least 0.70."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "先检查随机、独立或不放回时样本不超过总体 10%，并确认 np=60、n(1−p)=40 均至少 10。",
     "Check random sampling and independence, or the 10% condition when sampling without replacement. The large counts are 60 and 40."
    ]
   },
   {
    "text": [
     "MENU → 2 → DIST → NORM → Ncd。下界 0.70，上界 1×10⁹⁹，μ=0.60，σ=√(0.6×0.4÷100)，执行。",
     "Use MENU → 2 → DIST → NORM → Ncd. Use 0.70 to 1×10⁹⁹, μ=0.60 and σ=√(0.6×0.4÷100). Execute."
    ],
    "keys": [
     "MENU",
     "2",
     "F5",
     "F1",
     "F2"
    ]
   },
   {
    "text": [
     "换成两个独立随机样本，各 100 人，p₁=0.60、p₂=0.50。求第一组减第二组至少 0.20：下界 0.20、μ=0.10、σ=√((0.24+0.25)÷100)。",
     "For two independent samples of 100 with p₁=0.60 and p₂=0.50, find P(first minus second ≥0.20). Set the lower bound to 0.20, μ=0.10 and σ=√((0.24+0.25)÷100)."
    ]
   }
  ],
  "result": [
   "按样本比例的正态模型，两题约为 0.0206 和 0.0766。输入 0.70 表示比例，输入 70 则换了量纲。",
   "The normal approximations are about 0.0206 and 0.0766. Enter 0.70 on the proportion scale."
  ]
 },
 "s3.2": {
  "title": [
   "做单比例 z 区间和检验",
   "Build a one-proportion z interval and run a test"
  ],
  "question": [
   "随机调查 80 人，56 人支持延长开放时间。估计总体支持率，再检验支持率是否超过 60%。",
   "In a random survey, 56 of 80 support longer hours. Estimate population support, then test whether it exceeds 60%."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "随机且满足大样本条件。先估计总体比例，进入 INTR → Z → 1-PROP。",
     "After checking random sampling and large counts, estimate support with INTR → Z → 1-PROP."
    ],
    "keys": [
     "MENU",
     "2",
     "F4",
     "F1",
     "F3"
    ],
    "auto": true
   },
   {
    "text": [
     "C-Level 填 0.95，按 EXE 确认。",
     "Enter 0.95 for C-Level, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "9",
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x 填 56，按 EXE 确认。",
     "Enter 56 for x, then press EXE."
    ],
    "keys": [
     "5",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n 填 80，按 EXE 确认。",
     "Enter 80 for n, then press EXE."
    ],
    "keys": [
     "8",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "95% 区间约 (0.5996, 0.8004)。退出两次 → TEST → Z → 1-PROP，选右尾 >，按 ↓ 填原假设比例。",
     "Interval ≈(0.5996, 0.8004). Exit twice → TEST → Z → 1-PROP. Select > and move down to the null proportion."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F3",
     "F1",
     "F3",
     "F3",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "p₀ 填 0.6，按 EXE 确认。",
     "Enter 0.6 for p₀, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x 填 56，按 EXE 确认。",
     "Enter 56 for x, then press EXE."
    ],
    "keys": [
     "5",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n 填 80，按 EXE 确认。",
     "Enter 80 for n, then press EXE."
    ],
    "keys": [
     "8",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   }
  ],
  "result": [
   "95% 双侧区间约为 (0.5996, 0.8004)。右尾检验 p≈0.0339，在 5% 水平有证据支持超过 60%。两次使用的尾部不同。",
   "The two-sided 95% interval is about (0.5996, 0.8004). The right-tailed test gives p≈0.0339, evidence at 5% that support exceeds 60%. Note the different tails."
  ]
 },
 "s3.3": {
  "title": [
   "比较两个总体比例",
   "Compare two population proportions"
  ],
  "question": [
   "两个校区独立随机抽样，各抽 100 人。A 有 70 人支持，B 有 55 人支持，检验 A 的支持率是否更高。",
   "Independent random samples of 100 per campus give 70 supporters at A and 55 at B. Is support higher at A?"
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "先写 A−B。进入 INTR → Z → 2-PROP 来估计两校区支持率之差。",
     "Write A−B. Open INTR → Z → 2-PROP to estimate the difference between campuses."
    ],
    "keys": [
     "MENU",
     "2",
     "F4",
     "F1",
     "F4"
    ],
    "auto": true
   },
   {
    "text": [
     "C-Level 填 0.95，按 EXE 确认。",
     "Enter 0.95 for C-Level, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "9",
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x1 填 70，按 EXE 确认。",
     "Enter 70 for x1, then press EXE."
    ],
    "keys": [
     "7",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n1 填 100，按 EXE 确认。",
     "Enter 100 for n1, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x2 填 55，按 EXE 确认。",
     "Enter 55 for x2, then press EXE."
    ],
    "keys": [
     "5",
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n2 填 100，按 EXE 确认。",
     "Enter 100 for n2, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "区间下端大于零。退出两次 → TEST → Z → 2-PROP。A 放在第一组，选 >，按 ↓。",
     "The interval lies above zero. Exit twice → TEST → Z → 2-PROP. With A first, select > and press down."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F3",
     "F1",
     "F4",
     "F3",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "x1 填 70，按 EXE 确认。",
     "Enter 70 for x1, then press EXE."
    ],
    "keys": [
     "7",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n1 填 100，按 EXE 确认。",
     "Enter 100 for n1, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x2 填 55，按 EXE 确认。",
     "Enter 55 for x2, then press EXE."
    ],
    "keys": [
     "5",
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n2 填 100，按 EXE 确认。",
     "Enter 100 for n2, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   }
  ],
  "result": [
   "差的估计为 15 个百分点，95% 区间约 (1.74,28.26) 个百分点。右尾 p≈0.0142，在 5% 水平有证据支持 A 更高。",
   "The estimate is 15 percentage points, with a 95% interval about (1.74, 28.26) points. Right-tailed p≈0.0142 supports higher support at A at 5%."
  ]
 },
 "s3.4": {
  "title": [
   "做卡方独立性和同质性检验",
   "Run chi-square tests of independence and homogeneity"
  ],
  "question": [
   "A、B 两个校区各随机抽 50 人。A 有 30 人骑车、20 人步行，B 有 20 人骑车、30 人步行。比较通勤方式分布。",
   "Randomly sample 50 from each campus. A has 30 cyclists and 20 walkers; B has 20 cyclists and 30 walkers. Compare the commute distributions."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "MENU → 1 → MAT/VCT。在空白 Mat A 上按 DIM，分别输入 2 行、2 列，最后再按一次 EXE 打开矩阵。",
     "Open MENU → 1 → MAT/VCT. On empty Mat A choose DIM, enter 2 rows and 2 columns, then press EXE again to open the matrix."
    ],
    "keys": [
     "MENU",
     "1",
     "F3",
     "F3",
     "2",
     "EXE",
     "2",
     "EXE",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按行填入 30、20、20、30，每格用 EXE 确认，行合计和列合计留在表外。",
     "Enter 30, 20, 20 and 30 by row. Confirm each cell with EXE. Leave the marginal totals out."
    ],
    "keys": [
     "3",
     "0",
     "EXE",
     "2",
     "0",
     "EXE",
     "2",
     "0",
     "EXE",
     "3",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "MENU → 2 → TEST → χ² → 2-WAY。先看 Observed 为 Mat A、Expected 为 Mat B。",
     "Open MENU → 2 → TEST → χ² → 2-WAY. Check Observed is Mat A and Expected is Mat B."
    ],
    "keys": [
     "MENU",
     "2",
     "F3",
     "F3",
     "F2"
    ],
    "auto": true
   },
   {
    "text": [
     "向下移到执行，按 EXE。读出检验统计量、p 值和自由度。",
     "Move down to Execute and press EXE. Read the statistic, p-value and degrees of freedom."
    ],
    "keys": [
     "ArrowDown",
     "ArrowDown",
     "ArrowDown",
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "现在查期望频数：按 MENU → 1，进入矩阵编辑器，选 Mat B → EXE。用第一格的行合计×列合计÷总人数核对。",
     "Now inspect the expected counts. Use MENU → 1, open the matrix editor, select Mat B and press EXE. Verify the first cell using row total × column total ÷ grand total."
    ]
   }
  ],
  "result": [
   "四格期望数均为 25，χ²=4，df=1，p≈0.0455。分校区抽样用同质性检验；若从全体抽一个样本并记录两个分类变量，同一操作可做独立性检验。",
   "All expected counts are 25. χ²=4, df=1, p≈0.0455. Separate campus samples call for homogeneity; one sample classified by both variables uses the same steps for independence."
  ]
 },
 "s4.1": {
  "title": [
   "计算样本平均数的概率",
   "Find probabilities for sample means"
  ],
  "question": [
   "包装重量近似正态，μ=100 克、σ=10 克。比较一个包装超过 104 克与 25 个包装平均超过 104 克的概率。",
   "Package weights are normal with μ=100 g and σ=10 g. Compare one weight above 104 g with the mean of 25 above 104 g."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "单个包装用总体标准差 10，打开 Ncd。选变量，按 ↓ 进入第一项。",
     "For one package use the population SD of 10 and open Ncd. Choose Variable and move down to the first field."
    ],
    "keys": [
     "MENU",
     "2",
     "F5",
     "F1",
     "F2",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Lower 填 104，按 EXE 确认。",
     "Enter 104 for Lower, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Upper 填 1E99，按 EXE 确认。",
     "Enter 1E99 for Upper, then press EXE."
    ],
    "keys": [
     "1",
     "EXP",
     "9",
     "9",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "σ 填 10，按 EXE 确认。",
     "Enter 10 for σ, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "μ 填 100，按 EXE 确认。",
     "Enter 100 for μ, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "单个包装约 0.3446。现在算 25 件的平均，标准差改成 10÷√25=2。选变量，按 ↓ 进入第一项。",
     "For one package the chance is about 0.3446. For a mean of 25 the SD becomes 10÷√25=2. Choose Variable and move down to the first field."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F5",
     "F1",
     "F2",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Lower 填 104，按 EXE 确认。",
     "Enter 104 for Lower, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Upper 填 1E99，按 EXE 确认。",
     "Enter 1E99 for Upper, then press EXE."
    ],
    "keys": [
     "1",
     "EXP",
     "9",
     "9",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "σ 填 2，按 EXE 确认。",
     "Enter 2 for σ, then press EXE."
    ],
    "keys": [
     "2",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "μ 填 100，按 EXE 确认。",
     "Enter 100 for μ, then press EXE."
    ],
    "keys": [
     "1",
     "0",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "两条独立产线均值都是 100，标准差为 6 和 8，各抽 25 件。均值差的中心是 0，标准差 √((6²+8²)/25)=2，求超过 4 克的概率。选变量，按 ↓ 进入第一项。",
     "Two independent lines both average 100, with SDs 6 and 8 and samples of 25 each. For a difference above 4 g use mean 0 and SD √((6²+8²)/25)=2. Choose Variable and move down to the first field."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F5",
     "F1",
     "F2",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "Lower 填 4，按 EXE 确认。",
     "Enter 4 for Lower, then press EXE."
    ],
    "keys": [
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Upper 填 1E99，按 EXE 确认。",
     "Enter 1E99 for Upper, then press EXE."
    ],
    "keys": [
     "1",
     "EXP",
     "9",
     "9",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "σ 填 2，按 EXE 确认。",
     "Enter 2 for σ, then press EXE."
    ],
    "keys": [
     "2",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "μ 填 0，按 EXE 确认。",
     "Enter 0 for μ, then press EXE."
    ],
    "keys": [
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   }
  ],
  "result": [
   "单个包装约 0.3446，25 件的平均约 0.0228。两条产线之差的标准差也为 2 克，尾部概率同样约 0.0228。",
   "The probabilities are about 0.3446 and 0.0228. The SD of the two-line difference is also 2 g, giving about 0.0228 again."
  ]
 },
 "s4.2": {
  "title": [
   "做单样本 t 区间和检验",
   "Build a one-sample t interval and run a test"
  ],
  "question": [
   "随机抽取 25 个包装，平均重量 52 克，样本标准差 5 克，分布大致对称、无明显离群。估计总体均值，并检验是否超过 50 克。",
   "A random sample of 25 packages has mean 52 g and sample SD 5 g, roughly symmetric with no obvious outliers. Estimate the population mean and test whether it exceeds 50 g."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "独立样本、大致对称。进入 INTR → t → 1-SAMPLE，用汇总数据估计平均重量。选变量，按 ↓ 进入第一项。",
     "For this independent, roughly symmetric sample open INTR → t → 1-SAMPLE to estimate mean weight. Choose Variable and move down to the first field."
    ],
    "keys": [
     "MENU",
     "2",
     "F4",
     "F2",
     "F1",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "C-Level 填 0.95，按 EXE 确认。",
     "Enter 0.95 for C-Level, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "9",
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x̄ 填 52，按 EXE 确认。",
     "Enter 52 for x̄, then press EXE."
    ],
    "keys": [
     "5",
     "2",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "sx 填 5，按 EXE 确认。",
     "Enter 5 for sx, then press EXE."
    ],
    "keys": [
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n 填 25，按 EXE 确认。",
     "Enter 25 for n, then press EXE."
    ],
    "keys": [
     "2",
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "区间约 (49.94,54.06)。退出两次 → TEST → t → 1-SAMPLE，选变量，选 >，再下移。",
     "Interval ≈(49.94,54.06). Exit twice → TEST → t → 1-SAMPLE. Choose Variable, select >, then move down."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F3",
     "F2",
     "F1",
     "F2",
     "ArrowDown",
     "F3",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "μ₀ 填 50，按 EXE 确认。",
     "Enter 50 for μ₀, then press EXE."
    ],
    "keys": [
     "5",
     "0",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x̄ 填 52，按 EXE 确认。",
     "Enter 52 for x̄, then press EXE."
    ],
    "keys": [
     "5",
     "2",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "sx 填 5，按 EXE 确认。",
     "Enter 5 for sx, then press EXE."
    ],
    "keys": [
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n 填 25，按 EXE 确认。",
     "Enter 25 for n, then press EXE."
    ],
    "keys": [
     "2",
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "移到「执行」，按 EXE 查看结果。",
     "Move to Execute and press EXE to see the result."
    ],
    "keys": [
     "ArrowDown",
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "现在试原始数据：EXIT 两次，在空列输 47、47、52、57、57。INTR → t → 1-SAMPLE 选 List、指定该列、Freq=1、C-Level=0.95。执行并比较区间宽度。",
     "Now exit twice and enter 47,47,52,57,57 in an empty list. In INTR → t → 1-SAMPLE choose List, that list, Freq=1 and C-Level=0.95. Compare the interval widths."
    ]
   }
  ],
  "result": [
   "原题 95% 区间约 (49.94,54.06) 克，t=2、df=24，右尾 p≈0.0285。新列表的 x̄=52、sx=5、n=5，95% 区间变宽到约 (45.79,58.21)。",
   "For the original sample, the 95% interval is about (49.94,54.06) g; t=2, df=24, right-tailed p≈0.0285. The new list has mean 52, sx=5 and n=5; its interval widens to about (45.79,58.21)."
  ]
 },
 "s4.3": {
  "title": [
   "比较同一批人的前后变化",
   "Compare paired before-and-after data"
  ],
  "question": [
   "同一批 8 人训练前的得分为 60、65、70、62、68、71、63、66，训练后为 61、67、73、64、70、72、66、68。估计平均变化。",
   "Eight students scored 60,65,70,62,68,71,63,66 before training and 61,67,73,64,70,72,66,68 after. Estimate the mean change."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "按 MENU → 2 进入统计。看 List 1 第一格，练习数据会输入这里。",
     "Press MENU → 2 for Statistics. Find the first cell of List 1."
    ],
    "keys": [
     "MENU",
     "2"
    ],
    "auto": true
   },
   {
    "text": [
     "在 List 1 依次输入 60、65、70、62、68、71、63、66，每个数后按 EXE。",
     "Enter 60, 65, 70, 62, 68, 71, 63, 66 in List 1. Press EXE after each value."
    ],
    "keys": [
     "6",
     "0",
     "EXE",
     "6",
     "5",
     "EXE",
     "7",
     "0",
     "EXE",
     "6",
     "2",
     "EXE",
     "6",
     "8",
     "EXE",
     "7",
     "1",
     "EXE",
     "6",
     "3",
     "EXE",
     "6",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按 → 移到空白 List 2 的第一格。逐行录入 61, 67, 73, 64, 70, 72, 66, 68。",
     "Move right to the first cell of empty List 2. Enter 61, 67, 73, 64, 70, 72, 66, 68 one row at a time."
    ],
    "keys": [
     "ArrowRight",
     "6",
     "1",
     "EXE",
     "6",
     "7",
     "EXE",
     "7",
     "3",
     "EXE",
     "6",
     "4",
     "EXE",
     "7",
     "0",
     "EXE",
     "7",
     "2",
     "EXE",
     "6",
     "6",
     "EXE",
     "6",
     "8",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "同一人的前后测应在同一行：第一行是 60、61，最后一行是 66、68。",
     "Check each row belongs to one person: the first pair is 60 and 61 and the last is 66 and 68."
    ]
   },
   {
    "text": [
     "在 List 3 的列标题输入 List 2 − List 1 → EXE。列表名可用 SHIFT → 1（List）再输入列号。检查前两项为 1、2。",
     "At the List 3 column heading evaluate List 2 − List 1. Insert List with SHIFT → 1, then enter its number. The first differences should be 1 and 2."
    ]
   },
   {
    "text": [
     "检查差值分布大致对称、无明显离群，假设各人独立。INTR → t → 1-SAMPLE，用 List 3、Freq=1、C-Level=0.95。",
     "Check the differences for approximate symmetry and outliers, assuming independence across students. Open INTR → t → 1-SAMPLE with List 3, Freq=1, C-Level=0.95."
    ]
   },
   {
    "text": [
     "回 TEST → t → 1-SAMPLE，选 List 3，μ₀=0，若问是否提高则选 >。",
     "Open TEST → t → 1-SAMPLE using List 3 and μ₀=0. Choose > to test for an increase."
    ]
   }
  ],
  "result": [
   "平均提高 2 分，95% 区间约 (1.37,2.63) 分，df=7，右尾 p≈0.000070。正号来自“后测减前测”。",
   "The mean increase is 2 points. The 95% interval is about (1.37,2.63), df=7 and right-tailed p≈0.000070. Positive means after minus before."
  ]
 },
 "s4.4": {
  "title": [
   "比较两个独立组的平均数",
   "Compare two independent group means"
  ],
  "question": [
   "随机独立抽取 A、B 两班学生，各 16 人。平均分为 82 和 78，两组样本标准差都是 4，组内均大致对称、无明显离群。",
   "Independent random samples from classes A and B each contain 16 students. Means are 82 and 78, both sample SDs are 4, and neither group shows marked skew or outliers."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "写下 A−B。进入 INTR → t → 2-SAMPLE，选 Variable，按 ↓ 到置信水平。",
     "Write A−B. Open INTR → t → 2-SAMPLE, select Variable and move down to C-Level."
    ],
    "keys": [
     "MENU",
     "2",
     "F4",
     "F2",
     "F2",
     "F2",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "C-Level 填 0.95，按 EXE 确认。",
     "Enter 0.95 for C-Level, then press EXE."
    ],
    "keys": [
     "0",
     ".",
     "9",
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x̄1 填 82，按 EXE 确认。",
     "Enter 82 for x̄1, then press EXE."
    ],
    "keys": [
     "8",
     "2",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "sx1 填 4，按 EXE 确认。",
     "Enter 4 for sx1, then press EXE."
    ],
    "keys": [
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n1 填 16，按 EXE 确认。",
     "Enter 16 for n1, then press EXE."
    ],
    "keys": [
     "1",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x̄2 填 78，按 EXE 确认。",
     "Enter 78 for x̄2, then press EXE."
    ],
    "keys": [
     "7",
     "8",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "sx2 填 4，按 EXE 确认。",
     "Enter 4 for sx2, then press EXE."
    ],
    "keys": [
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n2 填 16，按 EXE 确认。",
     "Enter 16 for n2, then press EXE."
    ],
    "keys": [
     "1",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Pooled 选 Off。向下移过保存栏到执行，按 EXE。",
     "Set Pooled to Off. Move past Save Res to Execute and press EXE."
    ],
    "keys": [
     "F2",
     "ArrowDown",
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "区间约 (1.11,6.89)。退出两次，进入 TEST → t → 2-SAMPLE，选 Variable，再选 μ₁>μ₂。",
     "Interval ≈(1.11,6.89). Exit twice, choose TEST → t → 2-SAMPLE, select Variable and choose μ₁>μ₂."
    ],
    "keys": [
     "EXIT",
     "EXIT",
     "F3",
     "F2",
     "F2",
     "F2",
     "ArrowDown",
     "F3",
     "ArrowDown"
    ],
    "auto": true
   },
   {
    "text": [
     "x̄1 填 82，按 EXE 确认。",
     "Enter 82 for x̄1, then press EXE."
    ],
    "keys": [
     "8",
     "2",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "sx1 填 4，按 EXE 确认。",
     "Enter 4 for sx1, then press EXE."
    ],
    "keys": [
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n1 填 16，按 EXE 确认。",
     "Enter 16 for n1, then press EXE."
    ],
    "keys": [
     "1",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "x̄2 填 78，按 EXE 确认。",
     "Enter 78 for x̄2, then press EXE."
    ],
    "keys": [
     "7",
     "8",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "sx2 填 4，按 EXE 确认。",
     "Enter 4 for sx2, then press EXE."
    ],
    "keys": [
     "4",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "n2 填 16，按 EXE 确认。",
     "Enter 16 for n2, then press EXE."
    ],
    "keys": [
     "1",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "Pooled 仍选 Off。移过保存栏和图形颜色，到执行再按 EXE。",
     "Keep Pooled Off, move past Save Res and Graph Color to Execute, then press EXE."
    ],
    "keys": [
     "F2",
     "ArrowDown",
     "ArrowDown",
     "ArrowDown",
     "EXE"
    ],
    "auto": true
   }
  ],
  "result": [
   "A 比 B 平均高 4 分，95% 区间约 (1.11,6.89) 分，右尾 p≈0.00413。两班各有 16 人并不构成配对。",
   "The estimated difference is 4 points. The 95% interval is about (1.11,6.89), right-tailed p≈0.00413. Equal group sizes alone do not establish pairing."
  ]
 },
 "s5.1": {
  "title": [
   "画散点图、求回归直线和看残差",
   "Draw a scatterplot, fit a line and examine residuals"
  ],
  "question": [
   "五位学生的练习时长 x 为 1、2、3、4、5 小时，得分 y 为 2、3、5、4、6。用回归预测练习 3 小时的得分。",
   "Practice times x are 1,2,3,4,5 hours and scores y are 2,3,5,4,6. Predict the score for three hours."
  ],
  "steps": [
   {
    "text": [
     "按 AC/ON 开始本课的独立练习。",
     "Press AC/ON to start this practice session."
    ],
    "keys": [
     "AC"
    ],
    "auto": true
   },
   {
    "text": [
     "按 MENU → 2 进入统计。看 List 1 第一格，练习数据会输入这里。",
     "Press MENU → 2 for Statistics. Find the first cell of List 1."
    ],
    "keys": [
     "MENU",
     "2"
    ],
    "auto": true
   },
   {
    "text": [
     "在 List 1 依次输入 1、2、3、4、5，每个数后按 EXE。",
     "Enter 1, 2, 3, 4, 5 in List 1. Press EXE after each value."
    ],
    "keys": [
     "1",
     "EXE",
     "2",
     "EXE",
     "3",
     "EXE",
     "4",
     "EXE",
     "5",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "按 → 移到空白 List 2 的第一格。逐行录入 2, 3, 5, 4, 6。",
     "Move right to the first cell of empty List 2. Enter 2, 3, 5, 4, 6 one row at a time."
    ],
    "keys": [
     "ArrowRight",
     "2",
     "EXE",
     "3",
     "EXE",
     "5",
     "EXE",
     "4",
     "EXE",
     "6",
     "EXE"
    ],
    "auto": true
   },
   {
    "text": [
     "GRPH → SET，选 Scatter，XList=List 1，YList=List 2，Freq=1。EXIT → GPH1 画散点图。",
     "Open GRPH → SET and select Scatter, XList=List 1, YList=List 2, Freq=1. EXIT → GPH1 draws the scatterplot."
    ],
    "keys": [
     "F1",
     "F6"
    ],
    "auto": false
   },
   {
    "text": [
     "保存残差。回列表，按 SHIFT → MENU，在 SET UP 把 Resid List 指向空白 List 3，再 EXIT。",
     "Save residuals. From the list editor press SHIFT → MENU. In SET UP assign an empty List 3 to Resid List, then EXIT."
    ]
   },
   {
    "text": [
     "求直线。在 CALC → SET 中指定 2Var XList=List 1、YList=List 2、Freq=1。选 CALC → REG → X，选择 a+bx。",
     "Fit the line. Under CALC → SET set 2Var XList=List 1, YList=List 2 and Freq=1. Use CALC → REG → X and choose a+bx."
    ]
   },
   {
    "text": [
     "看系数和拟合程度。屏幕应给 a=1.3、b=0.9、r=0.90、r²=0.81。把 3 代入 1.3+0.9x，再用实测得分 5 减去预测值。",
     "Read a=1.3, b=0.9, r=0.90 and r²=0.81. Substitute 3 into 1.3+0.9x, then subtract the prediction from the observed score of 5."
    ]
   },
   {
    "text": [
     "画残差图。在 GRPH → SET 将另一个图设为 Scatter，XList=List 1、YList=List 3，绘图。找到 x=3 的点，看它落在零线上方还是下方。",
     "Make a residual plot. In GRPH → SET configure another Scatter with XList=List 1 and YList=List 3. Draw it and locate the point for x=3 relative to zero."
    ]
   }
  ],
  "result": [
   "预测值 4 分，残差 +1 分。该点比拟合直线高 1 分，在残差图上是 (3,1)。r² 表示线性模型解释了样本得分变异的 81%。",
   "Prediction: 4 points. Residual: +1. The point sits 1 above the fitted line and appears at (3,1) on the residual plot. The model explains 81% of the sample variation in score."
  ]
 }
};
const units = [
 {
  "title": [
   "单变量数据与数据收集",
   "One-variable data and data collection"
  ],
  "courses": [
   "s1.1",
   "s1.2",
   "s1.3",
   "s1.4",
   "s1.5",
   "s1.6"
  ]
 },
 {
  "title": [
   "概率、随机变量与分布",
   "Probability and random variables"
  ],
  "courses": [
   "s2.1",
   "s2.2",
   "s2.3",
   "s2.4",
   "s2.5",
   "s2.6"
  ]
 },
 {
  "title": [
   "总体比例的统计推断",
   "Inference for proportions"
  ],
  "courses": [
   "s3.1",
   "s3.2",
   "s3.3",
   "s3.4"
  ]
 },
 {
  "title": [
   "总体均值的统计推断",
   "Inference for means"
  ],
  "courses": [
   "s4.1",
   "s4.2",
   "s4.3",
   "s4.4"
  ]
 },
 {
  "title": [
   "回归分析",
   "Regression analysis"
  ],
  "courses": [
   "s5.1"
  ]
 }
];
let section=courses.basics;
const card=document.createElement('aside');
card.id='lesson-coach';card.hidden=true;
card.innerHTML='<div><strong></strong><p aria-live="polite"></p></div>';
document.body.append(card);
const message=card.querySelector('p');
const seen='cg50-tutorial-keypad-v2';
let index=-1,keyIndex=0,free=false,showQuestion=false;
const inputQueue=[];
let worker=null,busy=false,ready=false,lit=null,request=0,failed=false;
const screen=document.createElement('canvas');
const ctx=screen.getContext('2d');
const marker=document.createElement("span");marker.className="lesson-slot";marker.hidden=true;document.querySelector(".screen-frame").append(marker);
// Native fx-CG50 framebuffer, including its margins around the six soft keys.
const lcdImage=marker.parentElement.querySelector('img.lcd');
function placeSlot(){
 const slot=Number(currentKey()?.match(/^F([1-6])$/)?.[1]);
 const lcd=lcdImage.getBoundingClientRect();
 marker.hidden=card.hidden||!ready||failed||!slot||!lcd.width||!lcd.height;
 if(marker.hidden)return;
 const frame=marker.parentElement.getBoundingClientRect();
 const scale=Math.min(lcd.width/396,lcd.height/224);
 // The canvas centers the bitmap with object-fit: contain.
 const left=lcd.left-frame.left-marker.parentElement.clientLeft+(lcd.width-396*scale)/2;
 const top=lcd.top-frame.top-marker.parentElement.clientTop+(lcd.height-224*scale)/2;
 Object.assign(marker.style,{
  left:(left+(7+64*(slot-1))*scale)+'px',top:(top+193*scale)+'px',
  width:62*scale+'px',height:22*scale+'px'
 });
}
const slotObserver=new ResizeObserver(placeSlot);
slotObserver.observe(marker.parentElement);slotObserver.observe(lcdImage);
const avatar=new Image();
avatar.alt='';card.append(avatar);
const device=document.querySelector('#device');
const main=document.querySelector('main');
let manual=null,drag=null;
const heartSheet=new Image();
const heartCanvas=document.createElement('canvas');
heartCanvas.className='lesson-heart';heartCanvas.setAttribute('aria-hidden','true');card.append(heartCanvas);
const heartContext=heartCanvas.getContext('2d');
let effectFrame=0,heartRequest=0,tapTimes=[];
const ease=value=>{const t=Math.min(1,Math.max(0,value));return t*t*(3-2*t)};
// The atlas and the pink outline share the same 15 fps animation clock.
const heartFPS=15;
const heartFrameCount=45;
const heartColumns=9;
const heartDuration=heartFrameCount*1000/heartFPS;
const heartOutline=[[0,4],[0,2],[1,2],[1,1],[3,1],[3,2],[4,2],[4,3],[5,3],
 [5,2],[6,2],[6,1],[8,1],[8,2],[9,2],[9,5],[8,5],[8,6],[7,6],[7,7],
 [6,7],[6,8],[5,8],[5,9],[4,9],[4,8],[3,8],[3,7],[2,7],[2,6],[1,6],[1,5],[0,5],[0,4]];
function drawCelebration(i){
 const c=heartContext,side=heartCanvas.width,cell=heartSheet.naturalWidth/heartColumns;
 const ms=i*1000/heartFPS;
 c.clearRect(0,0,side,side);
 c.drawImage(heartSheet,(i%heartColumns)*cell,Math.floor(i/heartColumns)*cell,cell,cell,0,0,side,side);
 // The cap hand reaches the pocket at 1000 ms. The drawing hand begins after it settles.
 const reveal=ease((ms-1100)/920);
 if(!reveal)return;
 const turn=ease((ms-2020)/830),lift=ease((ms-2600)/400);
 c.save();c.scale(side,side);
 c.translate(339/443+.024*turn,153/443+.044*turn-.082*lift);
 const unit=6.8/443;c.scale(unit,unit);c.translate(0,-4);
 const amount=reveal*(heartOutline.length-1),last=Math.floor(amount);
 c.beginPath();c.moveTo(...heartOutline[0]);
 for(let i=1;i<=last;i++)c.lineTo(...heartOutline[i]);
 if(last+1<heartOutline.length){
  const [x,y]=heartOutline[last],[nx,ny]=heartOutline[last+1];
  c.lineTo(x+(nx-x)*(amount-last),y+(ny-y)*(amount-last));
 }
 if(reveal===1){
  c.closePath();c.fillStyle='rgba(255,123,164,'+ease((ms-2020)/420)+')';c.fill();
 }
 c.strokeStyle='#ff9dbd';c.lineWidth=.76;c.lineJoin='round';c.stroke();c.restore();
}
function animateHeart(start,now,previous=-1){
 const elapsed=now-start;
 if(elapsed>=heartDuration){stopHeart();placeGuide();return}
 const frame=Math.floor(elapsed*heartFPS/1000);
 if(frame!==previous)drawCelebration(frame);
 effectFrame=requestAnimationFrame(time=>animateHeart(start,time,frame));
}
function stopHeart(){
 heartRequest++;
 cancelAnimationFrame(effectFrame);effectFrame=0;
 card.classList.remove('playing-heart');
 tapTimes=[];
}
async function playHeart(){
 if(effectFrame||card.hidden)return;
 const requestId=++heartRequest;
 if(heartSheet.complete&&!heartSheet.naturalWidth)heartSheet.src='./guide-heart.png';
 try{await heartSheet.decode()}catch{return}
 if(requestId!==heartRequest||card.hidden||drag)return;
 const box=avatar.getBoundingClientRect();
 // Keep the whole square frame visible when the guide is close to the viewport edge.
 const left=Math.max(0,Math.min(box.left+(box.width-box.height)/2,innerWidth-box.height));
 card.style.setProperty('--heart-left',(left-box.left)+'px');
 const resolution=Math.max(1,Math.round(box.height*Math.min(window.devicePixelRatio||1,3)));
 heartCanvas.width=heartCanvas.height=resolution;
 card.classList.add('playing-heart');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){
  drawCelebration(heartFrameCount-1);
  const end=performance.now()+heartDuration;
  function wait(now){if(now<end){effectFrame=requestAnimationFrame(wait);return}stopHeart();placeGuide()}
  effectFrame=requestAnimationFrame(wait);
 }else{
  const start=performance.now();animateHeart(start,start);
 }
}
avatar.draggable=false;
avatar.addEventListener('pointerdown',event=>{
 if(effectFrame||drag||!event.isPrimary||event.button!==0)return;
 const box=card.getBoundingClientRect();
 drag={startX:event.clientX,startY:event.clientY,start:performance.now(),moved:false,id:event.pointerId,dx:event.clientX-box.left,dy:event.clientY-box.top};
 avatar.setPointerCapture(event.pointerId);
 event.preventDefault();
});
avatar.addEventListener('pointermove',event=>{
 if(drag?.id!==event.pointerId)return;
 if(!drag.moved&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<7)return;
 drag.moved=true;tapTimes=[];
 manual={left:event.clientX-drag.dx,top:event.clientY-drag.dy};
 placeGuide();
});
avatar.addEventListener('pointerup',event=>{
 if(drag?.id!==event.pointerId)return;
 const now=performance.now();
 if(!drag.moved&&now-drag.start<350&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<7){
  tapTimes=tapTimes.filter(time=>now-time<=800);
  tapTimes.push(now);
  if(tapTimes.length===3&&!busy&&ready&&!failed)playHeart();
 }else tapTimes=[];
 drag=null;
});
avatar.addEventListener('pointercancel',()=>{tapTimes=[];drag=null});
function resetPosition(){
 stopHeart();
 if(drag&&avatar.hasPointerCapture(drag.id))avatar.releasePointerCapture(drag.id);
 drag=null;manual=null;
}
avatar.addEventListener('lostpointercapture',()=>{drag=null});
const settings=document.querySelector('#cg50-settings-dialog');
const setting=document.createElement('div');
setting.className='cg50-setting lesson-size';
setting.innerHTML='<label for="lesson-scale"></label><output for="lesson-scale"></output><button type="button" class="lesson-size-reset"></button><input id="lesson-scale" type="range" min="25" max="400" step="1"><img hidden alt="" src="./guide-idle.png">';
settings.querySelector('label[for="cg50-history-enabled"]').after(setting);
const slider=setting.querySelector('input'),preview=setting.querySelector('img');
const sizeKey='cg50-tutorial-guide-percent-v2';
const defaultSize=100;
const resetSize=setting.querySelector('button');
let stored=defaultSize;
try{
 const saved=localStorage.getItem(sizeKey);
 const legacy=Number(localStorage.getItem('cg50-tutorial-guide-percent'));
 if(saved!==null&&Number(saved)>=25&&Number(saved)<=400)stored=Number(saved);
 else if(legacy>=70&&legacy<=150)stored=Math.round(legacy/1.3);
}catch{}
slider.value=stored;
let hideTimer;
function sizePreview(){
 clearTimeout(hideTimer);preview.hidden=false;
 hideTimer=setTimeout(()=>{preview.hidden=true},1800);
}
function applySize(){
 const scale=1.3*1.15*Number(slider.value)/100;
 document.documentElement.style.setProperty('--lesson-avatar-width',Math.round(88*scale)+'px');
 setting.querySelector('output').textContent=slider.value+'%';
 placeGuide();
}
slider.addEventListener('pointerdown',sizePreview);
function saveSize(){
 applySize();sizePreview();
 try{localStorage.setItem(sizeKey,slider.value)}catch{}
}
slider.addEventListener('input',saveSize);
resetSize.addEventListener('click',()=>{slider.value=defaultSize;saveSize()});
settings.addEventListener('close',()=>{clearTimeout(hideTimer);preview.hidden=true});

// Source pixels: sprite dimensions, index fingertip, and direction from knuckle to tip.
const hands=[
 ['right',144,166,125,85,12,-1], ['left',144,168,8,87,-12,-1],
 ['up-left',140,180,21,55,-10,-8], ['up-right',137,180,115,55,10,-8],
 ['down-left',140,180,19,122,-9,8], ['down-right',131,180,107,122,9,8],
 ['right-up', 255, 350, 240, 125.5, 36, -18],
 ['left-up', 255, 350, 15, 125.5, -36, -18],
 ['up-right-steep', 255, 350, 212.5, 52.5, 20, -39],
 ['up-left-steep', 255, 350, 42.5, 52.5, -20, -39],
 ['right-down', 255, 350, 234.5, 195, 38, 10],
 ['left-down', 255, 350, 20.5, 195, -38, 10],
 ['down-right-steep', 255, 350, 212, 271, 22, 35],
 ['down-left-steep', 255, 350, 43, 271, -22, 35],
 ['down', 310, 440, 239, 314, 0.2, 39],
 ['up', 310, 440, 242, 74.5, 2, -40]
];
const clamp=(value,min,max)=>Math.max(min,Math.min(value,max));
function placeGuide(){
 if(card.hidden||effectFrame)return;
 const key=(lit||device).getBoundingClientRect();
 const x=key.left+key.width/2,y=key.top+key.height/2;
 const top=document.querySelector('header').getBoundingClientRect().bottom+3;
 // Leave room for the key outline even when the guide is dragged onto it.
 const clearance=8;
 const roomX=Math.max(key.left-2,innerWidth-2-key.right)-clearance;
 const roomY=Math.max(key.top-top,innerHeight-2-key.bottom)-clearance;
 const fit=Math.floor(Math.max(roomX,roomY*88/128));
 card.style.width=lit?'min(var(--lesson-fit-width), '+Math.max(1,fit)+'px)':'';
 const {width:w,height:h}=avatar.getBoundingClientRect();
 const limitX=v=>clamp(v,2,innerWidth-w-2);
 const limitY=v=>clamp(v,top,innerHeight-h-2);
 function clearKey(left,yPos){
  if(!lit||left+w<=key.left-clearance||left>=key.right+clearance||
     yPos+h<=key.top-clearance||yPos>=key.bottom+clearance)return [left,yPos];
  const sides=[[key.left-clearance-w,yPos],[key.right+clearance,yPos],
               [left,key.top-clearance-h],[left,key.bottom+clearance]];
  let closest=[left,yPos],distance=Infinity;
  for(const [sx,sy] of sides){
   if(sx<2||sx+w>innerWidth-2||sy<top||sy+h>innerHeight-2)continue;
   const shift=Math.hypot(sx-left,sy-yPos);
   if(shift<distance){closest=[sx,sy];distance=shift}
  }
  return closest;
 }
 let best;
 for(const [pose,iw,ih,tipX,tipY,vx,vy] of hands){
  // object-fit: contain centers the sprite within a fixed-aspect image box.
  const scale=Math.min(w/iw,h/ih);
  const ax=(w-iw*scale)/2+tipX*scale;
  const ay=(h-ih*scale)/2+tipY*scale;
  const norm=Math.hypot(vx,vy),ux=vx/norm,uy=vy/norm;
  // Move back along the finger's own axis until the card clears the key.
  const gapX=(key.width/2+clearance+(ux>0?w-ax:ax))/Math.abs(ux);
  const gapY=(key.height/2+clearance+(uy>0?h-ay:ay))/Math.abs(uy);
  // Find the part of the pointing ray on which the entire card still fits.
  const originX=x-ax,originY=y-ay;
  const xs=[(originX-2)/ux,(originX-limitX(Infinity))/ux];
  const ys=[(originY-top)/uy,(originY-limitY(Infinity))/uy];
  const near=Math.max(0,Math.min(...xs),Math.min(...ys));
  const far=Math.min(Math.max(...xs),Math.max(...ys));
  const desired=Math.min(gapX,gapY);
  const gap=near<=far?clamp(desired,near,far):desired;
  const [left,cardTop]=clearKey(limitX(manual?.left??x-ux*gap-ax),
                                limitY(manual?.top??y-uy*gap-ay));
  const fx=left+ax,fy=cardTop+ay,dx=x-fx,dy=y-fy;
  const forward=dx*ux+dy*uy;
  const miss=Math.hypot(dx-forward*ux,dy-forward*uy,Math.min(0,forward));
  const score=24*miss+Math.hypot(dx,dy);
  if(!best||score<best.score)best={score,pose,left,cardTop};
 }
 card.style.left=best.left+'px';card.style.top=best.cardTop+'px';
 if(!lit&&!manual){
  const side=key.left-w-10>=2?key.left-w-10:key.right+10;
  card.style.left=limitX(side)+'px';
  card.style.top=limitY(key.top+key.height*.50-h/2)+'px';
 }
 const pose=lit?best.pose:'idle',url='./guide-'+pose+'.png';
 if(avatar.getAttribute('src')!==url)avatar.src=url;
 card.dataset.pose=pose;
 placeBubble(key,top);

}
const bubble=message.parentElement;
function placeBubble(key,top){
 const a=avatar.getBoundingClientRect(),w=bubble.offsetWidth,h=bubble.offsetHeight;
 const midX=a.left+(a.width-w)/2,midY=a.top+(a.height-h)/2;
 const deviceBox=device.getBoundingClientRect();
 const screenBox=marker.parentElement.getBoundingClientRect();
 const candidates=[[a.left-w-4,midY],[a.right+4,midY],[midX,a.top-h-4],[midX,a.bottom+4],
                   [deviceBox.right+4,midY],[deviceBox.left-w-4,midY]];
 let best;
 for(const [x,y] of candidates){
  const left=clamp(x,4,innerWidth-w-4),yPos=clamp(y,top,innerHeight-h-4);
  const overlap=r=>Math.max(0,Math.min(left+w,r.right)-Math.max(left,r.left))*
                   Math.max(0,Math.min(yPos+h,r.bottom)-Math.max(yPos,r.top));
  const distance=Math.hypot(Math.max(0,a.left-left-w,left-a.right),
                            Math.max(0,a.top-yPos-h,yPos-a.bottom));
  const score=(lit&&overlap(key)>0?1e8:0)+4*overlap(a)+overlap(deviceBox)+overlap(screenBox)+distance+Math.hypot(x-left,y-yPos);
  if(!best||score<best.score)best={left,yPos,score};
 }
 bubble.style.left=best.left+'px';bubble.style.top=best.yPos+'px';
}
const observer=new ResizeObserver(placeGuide);
for(const element of [card,bubble,device,main,document.querySelector('.screen-frame')])observer.observe(element);
window.addEventListener('resize',placeGuide);

// Emphasize key legends, menu choices and the math the student should look for.
const focusTerms=/AC\/ON|S↔D|×10ˣ|X,θ,T|→|÷|×|\(−\)|\(\)|\b(?:MENU|DEL|EXE|OPTN|EXIT|ALPHA|SHIFT|OFF|CALC|NUM|SIN|Abs|F[1-6])\b|d\/dx|∫dx|r\s*=\s*2\s*sin\(θ\)|r\s*=|π\/2|π|x²|X²|x\s*=\s*3|[−-]?\d+(?:[./]\d+)?…?|绝对值|定积分|右方向键|right arrow|精确分数|小数|fraction|decimal|「[^」]+」/g;
function showMessage(text){
 const parts=[];
 let end=0;
 for(const match of text.matchAll(focusTerms)){
  parts.push(text.slice(end,match.index));
  const mark=document.createElement('mark');mark.textContent=match[0];parts.push(mark);
  end=match.index+match[0].length;
 }
 message.replaceChildren(...parts,text.slice(end));
}
// A course starts with its question, continues in a disposable emulator,
// and ends with a self-check that still accepts calculator input.
const keyCue=document.createElement('span');
keyCue.className='lesson-key-cue';bubble.append(keyCue);
const actions=document.createElement('footer');
bubble.append(actions);
function control(action){
 const button=document.createElement('button');
 button.type='button';
 button.addEventListener('click',action);
 actions.append(button);
 return button;
}
const questionButton=control(()=>{showQuestion=!showQuestion;render()});
const exploreButton=control(()=>{
 if(busy||inputQueue.length)return;
 free=true;showQuestion=false;resetPosition();render();
});
const continueButton=control(()=>{
 if(busy||inputQueue.length)return;
 if(failed){start();return}
 if(!ready)return;
 if(index>section.steps.length){close();toggleMenu(true);replay.focus();return}
 advance();
});
const restartButton=control(()=>start());
function currentKey(){
 if(free||index<0)return null;
 return section.steps[index]?.keys?.[keyIndex]||null;
}
function advance(){
 index++;keyIndex=0;free=false;showQuestion=false;
 resetPosition();render();
 if(index>section.steps.length)playHeart();
}
function render(){
 replay.textContent=card.hidden?t('进入教程','Enter tutorial'):t('退出教程','Exit tutorial');
 replay.setAttribute('aria-pressed',String(!card.hidden));
 document.body.classList.toggle('guided',!card.hidden);
 placeSlot();
 if(lit)lit.classList.remove('lesson-target');
 lit=null;
 if(card.hidden)return;
 const intro=index<0,review=index===section.steps.length,done=index>section.steps.length;
 const key=currentKey();
 if(ready&&key&&!failed){
  lit=device.querySelector('[data-key="'+key+'"]');
  lit?.classList.add('lesson-target');
 }
 const phase=intro?t('练习题','Practice'):review?t('核对结果','Check your result'):
    done?t('已完成','Completed'):(index+1)+' / '+section.steps.length;
 card.querySelector('strong').textContent=t(...section.title)+' · '+phase;
 let text='';
 if(failed)text=t('练习加载失败。请重试。','Practice could not load. Please retry.');
 else if(!ready)text=t('hyc正在思考🤔','hyc is thinking 🤔');
 else if(done)text=t('这门课完成了，可以继续选课。','Lesson complete. Choose another course when ready.');
 else if(intro||showQuestion)text=t(...section.question);
 else if(review)text=t(...section.result);
 else text=t(...section.steps[index].text);
 showMessage(text);
 keyCue.hidden=!lit||showQuestion;
 if(lit)keyCue.textContent=t('下一键 ','Next key ')+(lit.getAttribute('aria-label')||key)+' · '+(keyIndex+1)+'/'+section.steps[index].keys.length;
 questionButton.hidden=!ready||failed||intro||done;
 questionButton.textContent=showQuestion?t('回到练习','Back to task'):t('看题目','View problem');
 questionButton.setAttribute('aria-pressed',String(showQuestion));
 exploreButton.hidden=!lit||showQuestion;
 exploreButton.textContent=t('自行按键','Free input');
 continueButton.hidden=!failed&&(!ready||!!key||showQuestion);
 continueButton.textContent=failed?t('重试','Retry'):intro?t('开始练习','Start practice'):
     done?t('返回目录','Course directory'):review?t('完成本课','Finish lesson'):
     index===section.steps.length-1?t('核对结果','Check result'):t('本步完成','Step done');
 restartButton.hidden=!done;
 restartButton.textContent=t('再练一次','Practice again');
 placeGuide();requestAnimationFrame(placeGuide);
}
function close(){
 resetPosition();inputQueue.length=0;
 worker?.terminate();worker=null;card.hidden=true;render();
 window.CG50PracticeFrame(null);
 try{localStorage.setItem(seen,'1')}catch{}
}

async function start(){
 resetPosition();
 if(!heartSheet.src)heartSheet.src="./guide-heart.png";
 worker?.terminate();card.setAttribute("aria-busy","false");card.hidden=false;index=-1;keyIndex=0;free=false;showQuestion=false;inputQueue.length=0;ready=false;busy=false;failed=false;
 screen.width=384;screen.height=216;ctx.fillStyle='#18201e';ctx.fillRect(0,0,384,216);window.CG50PracticeFrame(screen);render();
 const session=new Worker('./worker.js');worker=session;
 function fault(){if(worker===session){failed=true;busy=false;inputQueue.length=0;render()}}
 session.onerror=fault;
 session.onmessage=({data:m})=>{
  if(worker!==session)return;
  if(m.error||m.type==='fault'){fault();return}
  if(m.type==='frame'){
   if(index<0 || (index===0 && keyIndex===0 && !free))return;
   if(screen.width!==m.width||screen.height!==m.height){screen.width=m.width;screen.height=m.height}
   ctx.putImageData(new ImageData(new Uint8ClampedArray(m.pixels),m.width,m.height),0,0);window.CG50PracticeFrame(screen);
  }else if(m.id==='boot'){ready=true;render()}
  else if(busy&&m.id===request){
   busy=false;card.setAttribute("aria-busy","false");
   if(currentKey()){
    keyIndex++;
    if(!currentKey()&&section.steps[index].auto)advance();
    else{resetPosition();render()}
   }
   dispatchKey();
  }
 };
 try{
  const [flash,state]=await Promise.all(['flash_full.bin','cg50_state.bin'].map(async name=>{const r=await fetch('./defaults/'+name);if(!r.ok)throw Error(r.status);return r.arrayBuffer()}));
  if(worker===session)session.postMessage({action:'boot',id:'boot',flash,state},[flash,state]);
 }catch{fault()}
}
// Serialize taps so quickly entered numbers and ALPHA combinations arrive in order.
function dispatchKey(){
 if(busy||!ready||failed||!worker||!inputQueue.length)return;
 const id=inputQueue.shift(),expected=currentKey();
 if(expected&&id!==expected){
  inputQueue.length=0;
  showMessage(t('下一键是 ','Next key: ')+(lit?.getAttribute('aria-label')||expected)+'。 '+t(...section.steps[index].text));
  placeGuide();return;
 }
 busy=true;card.setAttribute("aria-busy","true");worker.postMessage({id:++request,action:'practiceKey',key:id});
}
window.CG50LessonKey=id=>{
 if(card.hidden)return false;
 if(effectFrame||!ready||failed||index<0||index>section.steps.length)return true;
 inputQueue.push(id);dispatchKey();return true;
};
const replay=document.createElement('button');
replay.type='button';document.querySelector('#cg50-reload-config').before(replay);
const menu=document.createElement('nav');
menu.id='lesson-directory';menu.hidden=true;document.body.append(menu);
replay.setAttribute('aria-controls',menu.id);
const heading=document.createElement('strong');menu.append(heading);
const menuLabels=[];
function addCourse(parent,id){
 const item=courses[id];
 const button=document.createElement('button');
 button.type='button';button.dataset.course=id;
 button.onclick=()=>{toggleMenu(false);replay.focus();section=item;start()};
 parent.append(button);menuLabels.push([button,item.title]);
 return button;
}
addCourse(menu,'basics').className='lesson-shared';
const columns=document.createElement('div');
columns.className='lesson-columns';menu.append(columns);
function column(title){
 const group=document.createElement('section'),label=document.createElement('h2');
 label.textContent=title;group.append(label);columns.append(group);return group;
}
const calculus=column('Calculus'),statistics=column('Statistics');
for(const id of ['derivative','integral','absolute','polar'])addCourse(calculus,id);
units.forEach((unit,i)=>{
 const group=document.createElement('details'),summary=document.createElement('summary');
 group.name='cg50-statistics-units';
 const number=document.createElement('small'),label=document.createElement('span');
 menuLabels.push([number,['单元 '+(i+1),'Unit '+(i+1)]],[label,unit.title]);
 summary.append(number,label);group.append(summary);statistics.append(group);
 const list=document.createElement('div');group.append(list);
 for(const id of unit.courses)addCourse(list,id);
 // Also support browsers without exclusive details groups.
 group.addEventListener('toggle',()=>{
  if(!group.open)return;
  for(const other of statistics.querySelectorAll('details[open]'))if(other!==group)other.open=false;
 });
});
window.addEventListener('keydown',event=>{
 const target=event.target;
 // Preserve native Enter/Space activation, summary arrows and tab traversal.
 if((menu.contains(target)||actions.contains(target))&&
    ['Enter',' ','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))
  event.stopPropagation();
},true);
function positionMenu(){
 if(menu.hidden)return;
 const r=replay.getBoundingClientRect();
 menu.style.left=Math.max(6,Math.min(r.left,innerWidth-menu.offsetWidth-6))+'px';
 menu.style.top=r.bottom+5+'px';menu.style.maxHeight=Math.max(60,innerHeight-r.bottom-14)+'px';
}
function toggleMenu(open){
 if(open)menu.querySelectorAll("details").forEach(d=>d.open=false);
 menu.hidden=!open;replay.setAttribute('aria-expanded',String(open));positionMenu();
 try{localStorage.setItem(seen,'1')}catch{}
}
window.addEventListener('resize',positionMenu);
document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!replay.contains(e.target))toggleMenu(false)},true);
window.addEventListener('keydown',e=>{if(!menu.hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();toggleMenu(false);replay.focus()}},true);

function language(){heading.textContent=t("教程目录","Tutorials");menu.setAttribute("aria-label",heading.textContent);menuLabels.forEach(([el,pair])=>el.textContent=t(...pair));positionMenu();resetSize.textContent=t("恢复默认","Reset to default");setting.querySelector("label").textContent=t("教程人物大小","Tutorial character size");render()}
applySize();language();new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
replay.onclick=()=>{if(card.hidden)toggleMenu(menu.hidden);else close()};
let welcomeStarted=false;
window.CG50TutorialWelcome=()=>{
 if(welcomeStarted)return;
 try{if(localStorage.getItem(seen))return}catch{}
 welcomeStarted=true;
 let remaining=5000,since=null,interacted=false,timer;
 const listeners=new AbortController();
 const options={capture:true,passive:true,signal:listeners.signal};
 // Only count time visible in the foreground after the download dialog closes.
 function update(){
  const now=performance.now();
  clearTimeout(timer);
  if(since!==null)remaining=Math.max(0,remaining-(now-since));
  since=null;
  if(interacted&&remaining===0){
   replay.classList.remove('lesson-invite');
   observer.disconnect();listeners.abort();return;
  }
  if(document.hidden||document.querySelector('dialog[open]'))return;
  if(!replay.classList.contains('lesson-invite')){
   replay.classList.add('lesson-invite');
   try{localStorage.setItem(seen,'1')}catch{}
  }
  if(remaining>0){
   since=now;timer=setTimeout(update,Math.ceil(remaining));
  }
 }
 function onInput(event){
  if(!event.isTrusted||interacted||!replay.classList.contains('lesson-invite'))return;
  interacted=true;update();
 }
 const observer=new MutationObserver(update);
 observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 for(const event of ['pointerdown','keydown','click','wheel'])window.addEventListener(event,onInput,options);
 document.addEventListener('visibilitychange',update,{signal:listeners.signal});
 update();
};
})();