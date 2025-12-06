import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChatMessage } from '../../shared/models/chat.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSignal = signal<ChatMessage[]>([]);
  private loadingSignal = signal<boolean>(false);
  
  readonly messages = this.messagesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  private readonly STORAGE_KEY = 'fitness_chat_history';
  
  private readonly systemPrompt = `You are FitBot Pro, an elite AI fitness coach and certified nutritionist. You provide world-class, personalized fitness and nutrition guidance.

YOUR EXPERTISE:
• Personalized workout programming & periodization
• Evidence-based nutrition & meal planning
• Exercise biomechanics & injury prevention
• Sports psychology & motivation
• Supplement science & recovery optimization

═══════════════════════════════════════════════════════════
PROFESSIONAL FORMATTING STANDARDS - FOLLOW EXACTLY:
═══════════════════════════════════════════════════════════

1. START WITH PROFILE CARD:
┌─────────────────────────────────────┐
│ 🎯 YOUR PERSONALIZED PLAN          │
├─────────────────────────────────────┤
│ Goal: [Specific goal]              │
│ Current: [Stats]                   │
│ Target: [Clear target]             │
│ Timeline: [Realistic timeframe]    │
└─────────────────────────────────────┘

2. USE CLEAN SECTION HEADERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SECTION NAME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. ORGANIZE WITH VISUAL HIERARCHY:
▸ Main points with arrows
  • Sub-points with bullets
  ◦ Details with circles

4. USE TIME BLOCKS FOR SCHEDULES:
⏰ 08:00 — BREAKFAST
⏰ 12:00 — LUNCH
⏰ 18:00 — DINNER

5. PROVIDE OPTIONS IN CARDS:
┌ OPTION A ─────────────────────┐
│ [Details]                     │
└───────────────────────────────┘

6. HIGHLIGHT KEY METRICS:
╔═══════════════════════════════╗
║ 🔥 Daily Calories: 1,600 kcal ║
║ 💪 Protein: 120g              ║
║ 🌾 Carbs: 150g                ║
║ 🥑 Fats: 50g                  ║
╚═══════════════════════════════╝

7. WARNINGS & RESTRICTIONS:
⚠️ AVOID: [items to avoid]
✅ INCLUDE: [items to include]

8. END WITH PROGRESS TRACKER:
📈 EXPECTED RESULTS
├── Week 1-2: [milestone]
├── Week 3-4: [milestone]  
└── Month 1: [final result]

═══════════════════════════════════════════════════════════
EXAMPLE - DIET PLAN FORMAT:
═══════════════════════════════════════════════════════════

┌─────────────────────────────────────┐
│ 🎯 YOUR PERSONALIZED PLAN          │
├─────────────────────────────────────┤
│ Goal: Weight Loss                  │
│ Current: 98 kg                     │
│ Target: Lose 4 kg/month            │
│ Diet Type: Vegetarian              │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DAILY NUTRITION TARGETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔═══════════════════════════════╗
║ 🔥 Calories: 1,600-1,800 kcal ║
║ 💪 Protein: 100-120g          ║
║ 🌾 Carbs: 150-180g            ║
║ 🥑 Fats: 45-55g               ║
╚═══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍽️ DAILY MEAL SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ 08:00 — BREAKFAST (~350 kcal)

┌ OPTION A ─────────────────────┐
│ • Vegetable Upma (1 bowl)     │
│ • Green Tea                   │
│ • 10 Almonds                  │
└───────────────────────────────┘

┌ OPTION B ─────────────────────┐
│ • Oats with Skim Milk         │
│ • 1 Banana                    │
│ • Black Coffee                │
└───────────────────────────────┘

⏰ 11:00 — MID-MORNING SNACK (~100 kcal)
▸ 1 Apple or Orange
▸ OR Handful of mixed nuts

⏰ 13:00 — LUNCH (~450 kcal)

The Balanced Plate Method:
┌─────────────────────────────────┐
│  🥗 50% Vegetables & Salad     │
│  🍗 25% Protein (Dal/Paneer)   │
│  🍚 25% Complex Carbs (Roti)   │
└─────────────────────────────────┘

⏰ 17:00 — EVENING SNACK (~100 kcal)
▸ Green tea + Roasted chana
▸ OR Sprouts with lemon

⏰ 19:30 — DINNER (~400 kcal)
▸ Keep it LIGHT & protein-rich
▸ Dal + Sabzi + 1 Roti
▸ OR Paneer stir-fry + Soup

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RESTRICTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Rice after 6 PM
❌ Sugary drinks & sweets
❌ Fried & processed foods
❌ Alcohol

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💧 HYDRATION PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ Daily Target: 3.0 - 3.5 Liters
▸ Morning: 2 glasses warm water
▸ Before meals: 1 glass (30 min prior)
▸ Benefits: Boosts metabolism by 25%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏋️ EXERCISE PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Weekly Schedule:
┌────────┬─────────────────────────┐
│ MON    │ 45 min Brisk Walk       │
│ TUE    │ Strength Training       │
│ WED    │ 45 min Walk + Yoga      │
│ THU    │ Strength Training       │
│ FRI    │ 45 min Brisk Walk       │
│ SAT    │ HIIT (20 min)           │
│ SUN    │ Active Rest / Stretch   │
└────────┴─────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 PROJECTED RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

├── Week 1: -0.8 to 1.0 kg
├── Week 2: -1.8 to 2.2 kg (total)
├── Week 3: -2.8 to 3.2 kg (total)
└── Week 4: -3.5 to 4.5 kg (total) ✓

💡 PRO TIP: Consistency beats perfection.
Follow 80% of the plan and you'll see results!

═══════════════════════════════════════════════════════════

TONE & STYLE:
• Professional yet approachable
• Data-driven with specific numbers
• Actionable and practical
• Encouraging without being cheesy
• Use metric units (kg, cm, liters)
• Personalize based on user's context (Indian/Western food, veg/non-veg, age, lifestyle)

Always ask clarifying questions if user hasn't provided: current weight, height, age, diet preference, activity level, or specific goals.`;

  constructor(private http: HttpClient) {
    this.loadHistory();
  }

  private loadHistory(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const messages = JSON.parse(stored);
        this.messagesSignal.set(messages);
      } catch {
        this.messagesSignal.set([]);
      }
    }
  }

  private saveHistory(): void {
    const messages = this.messagesSignal().slice(-50);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
  }

  private generateId(): string {
    return 'msg_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async sendMessage(userMessage: string): Promise<void> {
    if (!userMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.messagesSignal.update(msgs => [...msgs, userMsg]);

    this.loadingSignal.set(true);

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      
      const response = await this.getResponse(userMessage);
      
      const assistantMsg: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      this.messagesSignal.update(msgs => [...msgs, assistantMsg]);
      this.saveHistory();
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMsg: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: this.getErrorResponse(),
        timestamp: new Date()
      };
      this.messagesSignal.update(msgs => [...msgs, fallbackMsg]);
      this.saveHistory();
    } finally {
      this.loadingSignal.set(false);
    }
    
  }

  private async getResponse(userMessage: string): Promise<string> {
    const apiKey = environment.groqApiKey;
    
    // If no API key, use smart fallback responses
    if (!apiKey) {
      return this.getSmartResponse(userMessage);
    }

    // Use Groq API (OpenAI-compatible endpoint)
    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      });

      const recentMessages = this.messagesSignal().slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const body = {
        model: 'llama-3.3-70b-versatile', // Groq's fast LLaMA model
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...recentMessages,
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      };

      const response = await this.http.post<any>(
        'https://api.groq.com/openai/v1/chat/completions',
        body,
        { headers }
      ).toPromise();

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Groq API error:', error);
      // Fallback to smart responses if API fails
      return this.getSmartResponse(userMessage);
    }
  }

  private getSmartResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Diet and meal plans
    if (lowerMessage.includes('diet') || lowerMessage.includes('meal plan') || lowerMessage.includes('eat')) {
      if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight') || lowerMessage.includes('fat loss')) {
        return this.getWeightLossDietPlan();
      }
      if (lowerMessage.includes('1200') || lowerMessage.includes('1200-calorie') || lowerMessage.includes('1200 calorie')) {
        return this.get1200CaloriePlan();
      }
      if (lowerMessage.includes('muscle') || lowerMessage.includes('bulk') || lowerMessage.includes('gain')) {
        return this.getMuscleGainDiet();
      }
      if (lowerMessage.includes('before workout') || lowerMessage.includes('pre workout') || lowerMessage.includes('pre-workout')) {
        return this.getPreWorkoutNutrition();
      }
      if (lowerMessage.includes('after workout') || lowerMessage.includes('post workout') || lowerMessage.includes('post-workout')) {
        return this.getPostWorkoutNutrition();
      }
      return this.getGeneralNutritionTips();
    }
    
    // Workout routines
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('routine') || lowerMessage.includes('training')) {
      if (lowerMessage.includes('chest')) {
        return this.getChestWorkout();
      }
      if (lowerMessage.includes('back')) {
        return this.getBackWorkout();
      }
      if (lowerMessage.includes('leg') || lowerMessage.includes('lower body')) {
        return this.getLegWorkout();
      }
      if (lowerMessage.includes('arm') || lowerMessage.includes('bicep') || lowerMessage.includes('tricep')) {
        return this.getArmWorkout();
      }
      if (lowerMessage.includes('shoulder')) {
        return this.getShoulderWorkout();
      }
      if (lowerMessage.includes('ab') || lowerMessage.includes('core') || lowerMessage.includes('stomach')) {
        return this.getAbWorkout();
      }
      if (lowerMessage.includes('beginner')) {
        return this.getBeginnerWorkout();
      }
      if (lowerMessage.includes('full body') || lowerMessage.includes('full-body')) {
        return this.getFullBodyWorkout();
      }
      if (lowerMessage.includes('fat') || lowerMessage.includes('burn') || lowerMessage.includes('cardio')) {
        return this.getFatBurningWorkout();
      }
      return this.getGeneralWorkoutPlan();
    }

    // Specific topics
    if (lowerMessage.includes('protein')) {
      return this.getProteinInfo();
    }
    if (lowerMessage.includes('supplement')) {
      return this.getSupplementInfo();
    }
    if (lowerMessage.includes('sleep') || lowerMessage.includes('rest') || lowerMessage.includes('recovery')) {
      return this.getRecoveryTips();
    }
    if (lowerMessage.includes('motivation') || lowerMessage.includes('stay consistent') || lowerMessage.includes('motivated')) {
      return this.getMotivationTips();
    }

    // Default welcome response
    return this.getWelcomeResponse();
  }

  private getWeightLossDietPlan(): string {
    return `┌─────────────────────────────────────┐
│ 🎯 YOUR PERSONALIZED PLAN          │
├─────────────────────────────────────┤
│ Goal: Sustainable Weight Loss      │
│ Target: ~1 kg per week             │
│ Method: Calorie Deficit + Exercise │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DAILY NUTRITION TARGETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔═══════════════════════════════╗
║ 🔥 Calories: 1,500-1,800 kcal ║
║ 💪 Protein: 100-130g          ║
║ 🌾 Carbs: 120-150g            ║
║ 🥑 Fats: 45-60g               ║
╚═══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍽️ DAILY MEAL SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ 08:00 — BREAKFAST (~350 kcal)

┌ OPTION A ─────────────────────┐
│ • 2 Scrambled Eggs + Spinach  │
│ • 1 Whole Grain Toast         │
│ • Green Tea                   │
└───────────────────────────────┘

┌ OPTION B ─────────────────────┐
│ • Oatmeal with Berries        │
│ • 1 Boiled Egg                │
│ • Black Coffee                │
└───────────────────────────────┘

┌ OPTION C ─────────────────────┐
│ • Greek Yogurt Parfait        │
│ • Mixed Nuts (10-12)          │
│ • 1 Banana                    │
└───────────────────────────────┘

⏰ 11:00 — MID-MORNING SNACK (~100 kcal)

▸ 1 Apple or Orange
▸ OR 10-12 Almonds
▸ OR 1 Small Protein Bar

⏰ 13:00 — LUNCH (~450 kcal)

The Balanced Plate Method:
┌─────────────────────────────────┐
│  🥗 50% Vegetables & Salad     │
│  🍗 25% Protein                │
│  🍚 25% Complex Carbs          │
└─────────────────────────────────┘

▸ Protein: Grilled chicken/fish (150g) OR Dal + Paneer
▸ Carbs: ½ cup brown rice OR 2 rotis
▸ Vegetables: Large salad + 1 bowl sabzi
▸ Fat: 1 tbsp olive oil dressing

⏰ 17:00 — EVENING SNACK (~100 kcal)

▸ Green Tea + Roasted Chana
▸ OR Sprouts Salad with Lemon
▸ OR Cucumber + Hummus

⏰ 19:30 — DINNER (~400 kcal)

┌ OPTION A ─────────────────────┐
│ • Grilled Fish/Chicken        │
│ • Steamed Vegetables          │
│ • Small Salad                 │
└───────────────────────────────┘

┌ OPTION B ─────────────────────┐
│ • 1 Bowl Dal                  │
│ • 1 Roti + Sabzi              │
│ • Fresh Salad                 │
└───────────────────────────────┘

🌙 BEFORE BED (Optional)
▸ Warm water OR Turmeric milk (small cup)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RESTRICTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Rice after 6 PM
❌ Sugary drinks & sweets
❌ Fried & processed foods
❌ Alcohol
❌ Late night snacking

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💧 HYDRATION PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ Daily Target: 3.0 - 3.5 Liters
▸ Morning: 2 glasses warm water (empty stomach)
▸ Before meals: 1 glass (30 min prior)
▸ Benefit: Boosts metabolism by up to 25%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏋️ EXERCISE PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Weekly Schedule:
┌────────┬─────────────────────────┐
│ MON    │ 45 min Brisk Walking    │
│ TUE    │ Strength Training       │
│ WED    │ 45 min Walk + Stretching│
│ THU    │ Strength Training       │
│ FRI    │ 45 min Brisk Walking    │
│ SAT    │ HIIT Session (20 min)   │
│ SUN    │ Active Rest / Yoga      │
└────────┴─────────────────────────┘

🔥 Daily Burn Target: 300-400 kcal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 PROJECTED RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

├── Week 1: -0.8 to 1.2 kg
├── Week 2: -1.8 to 2.4 kg (total)
├── Week 3: -2.8 to 3.5 kg (total)
└── Week 4: -3.5 to 4.5 kg (total) ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 PRO TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Eat protein with every meal
✓ Fill half your plate with vegetables
✓ Never skip meals - slows metabolism
✓ Sleep 7-8 hours for optimal results
✓ Track your progress weekly

Would you like me to customize this plan for vegetarian/non-veg or specific cuisine preferences? Share your current weight and I'll make it more precise! 💪`;
  }

  private get1200CaloriePlan(): string {
    return `## 📊 1200-Calorie Meal Plan

⚠️ **Note:** 1200 calories is quite restrictive. This works best for shorter individuals or as a short-term plan. Consider consulting a nutritionist.

### Daily Breakdown

**🌅 Breakfast (250 cal)**
- 1 egg + 2 egg whites scrambled
- 1/2 cup oatmeal with cinnamon
- 1/2 banana

**🍏 Mid-Morning Snack (100 cal)**
- 1 small apple
- 1 tbsp almond butter

**🥗 Lunch (350 cal)**
- Large salad with:
  - 4 oz grilled chicken
  - Mixed greens, tomatoes, cucumber
  - 1 tbsp olive oil dressing

**🥕 Afternoon Snack (100 cal)**
- 1 cup raw veggies (carrots, celery)
- 2 tbsp hummus

**🍽️ Dinner (350 cal)**
- 4 oz baked white fish (tilapia/cod)
- 1 cup steamed broccoli
- 1/2 cup brown rice

**🌙 Evening (50 cal)**
- Herbal tea
- 5 almonds

### Macros Breakdown
- **Protein:** ~100g
- **Carbs:** ~100g
- **Fat:** ~40g

### Important Tips
- 💊 Take a multivitamin
- 💧 Drink lots of water (can help with hunger)
- 🏃 Limit intense exercise on this plan
- ⏰ Don't stay on 1200 cal for more than 4-6 weeks`;
  }

  private getMuscleGainDiet(): string {
    return `## 💪 Muscle Building Diet Plan

### Daily Targets
- **Calories:** TDEE + 300-500 surplus
- **Protein:** 1g per lb body weight
- **Carbs:** 2-2.5g per lb body weight
- **Fat:** 0.4g per lb body weight

### Sample Meal Plan (2800-3000 cal)

**🌅 Breakfast**
- 4 whole eggs scrambled
- 2 slices whole grain toast
- 1 cup oatmeal with banana
- Glass of milk

**🍗 Lunch**
- 8 oz chicken breast
- 1.5 cups brown rice
- Steamed vegetables
- 1 tbsp olive oil

**💪 Pre-Workout (1-2 hrs before)**
- Banana + 1 scoop whey protein
- 1/2 cup oats

**🥤 Post-Workout**
- Protein shake (40g protein)
- Fast carbs (banana or white rice)

**🍽️ Dinner**
- 8 oz lean steak or salmon
- Large baked potato
- Mixed vegetables
- Side salad

**🌙 Before Bed**
- Greek yogurt or cottage cheese
- Handful of nuts

### Key Principles
- 🥩 Protein every 3-4 hours
- 🍚 Don't fear carbs - they fuel muscle growth
- 💧 Stay hydrated (1 gallon water daily)
- 😴 Sleep 7-9 hours for recovery`;
  }

  private getPreWorkoutNutrition(): string {
    return `## ⚡ Pre-Workout Nutrition Guide

### Timing Matters

**2-3 Hours Before (Full Meal)**
- Complex carbs + lean protein
- Examples:
  - Oatmeal with banana and protein powder
  - Chicken with rice and vegetables
  - Whole grain toast with eggs

**30-60 Minutes Before (Light Snack)**
- Quick-digesting carbs + small protein
- Examples:
  - Banana + small protein shake
  - Rice cake with peanut butter
  - Greek yogurt with berries
  - Apple slices with almond butter

### What to Avoid
- ❌ High-fat foods (slow digestion)
- ❌ High-fiber foods (may cause discomfort)
- ❌ New foods you haven't tried
- ❌ Large portions close to workout

### Hydration
- 💧 16-20 oz water 2-3 hours before
- 💧 8 oz water 30 min before
- 💧 Sip during workout

### Pre-Workout Supplements (Optional)
- ☕ Caffeine (150-300mg)
- 🔥 Beta-alanine
- 💪 Creatine (5g daily)
- 🚀 Citrulline malate

**Pro Tip:** Test what works for you during lighter workouts before using it for intense training!`;
  }

  private getPostWorkoutNutrition(): string {
    return `## 🥤 Post-Workout Nutrition Guide

### The Anabolic Window
Eat within **30-60 minutes** after training for optimal recovery.

### What Your Body Needs

**Protein (20-40g)**
- Repairs and builds muscle
- Fast-absorbing is ideal
- Options: Whey protein, eggs, chicken, fish

**Carbohydrates (30-60g)**
- Replenishes glycogen stores
- Faster-digesting post-workout is fine
- Options: Rice, potatoes, fruits, oats

### Ideal Post-Workout Meals

**Quick Options:**
- Protein shake + banana
- Chocolate milk (surprisingly effective!)
- Greek yogurt with fruit and granola

**Full Meals (1-2 hours after):**
- Grilled chicken + white rice + vegetables
- Salmon + sweet potato + salad
- Lean beef stir-fry with rice
- Eggs + toast + avocado

### What to Avoid Post-Workout
- ❌ High-fat meals (slows absorption)
- ❌ Alcohol (impairs recovery)
- ❌ Skipping the meal entirely

### Recovery Extras
- 💧 Rehydrate: 16-24 oz water
- 🧂 Replace electrolytes if heavy sweating
- 😴 Quality sleep that night

**Remember:** Total daily protein matters more than perfect timing!`;
  }

  private getChestWorkout(): string {
    return `## 💪 Complete Chest Workout

### Warm-up (5-10 min)
- Light cardio + arm circles
- Push-ups: 2 sets of 10

### Main Workout

**1. Barbell Bench Press**
- 4 sets × 8-10 reps
- Rest: 90 seconds
- Focus on controlled descent

**2. Incline Dumbbell Press**
- 3 sets × 10-12 reps
- Rest: 75 seconds
- 30-45 degree incline

**3. Cable Flyes (or Dumbbell Flyes)**
- 3 sets × 12-15 reps
- Rest: 60 seconds
- Squeeze at the center

**4. Decline Bench Press**
- 3 sets × 10-12 reps
- Rest: 75 seconds

**5. Push-ups (Burnout)**
- 3 sets × to failure
- Rest: 60 seconds
- Vary hand width

**6. Dips (Chest Focus)**
- 3 sets × 10-12 reps
- Rest: 60 seconds
- Lean forward slightly

### Cool-down
- Chest stretches: 30 sec each
- Shoulder stretches
- Light walking

### Pro Tips
- 🎯 Train chest 1-2× per week
- 📈 Progressive overload is key
- 🔄 Full range of motion always
- 💭 Mind-muscle connection

Want a specific variation or different difficulty?`;
  }

  private getBackWorkout(): string {
    return `## 🔙 Complete Back Workout

### Warm-up (5-10 min)
- Light rowing or band pull-aparts
- Cat-cow stretches

### Main Workout

**1. Pull-ups / Lat Pulldown**
- 4 sets × 8-10 reps
- Rest: 90 seconds

**2. Barbell Rows**
- 4 sets × 8-10 reps
- Rest: 90 seconds
- Keep back flat

**3. Single-Arm Dumbbell Rows**
- 3 sets × 10-12 each arm
- Rest: 60 seconds

**4. Seated Cable Rows**
- 3 sets × 10-12 reps
- Rest: 60 seconds
- Squeeze shoulder blades

**5. Face Pulls**
- 3 sets × 15 reps
- Rest: 45 seconds
- Great for rear delts

**6. Straight-Arm Pulldowns**
- 3 sets × 12-15 reps
- Rest: 45 seconds

**7. Back Extensions**
- 3 sets × 15 reps
- Rest: 45 seconds

### Key Points
- 🎯 Focus on squeezing your back
- 📐 Don't use momentum
- 💪 Grip strength matters
- 🔄 Full stretch at bottom`;
  }

  private getLegWorkout(): string {
    return `## 🦵 Complete Leg Workout

### Warm-up (5-10 min)
- 5 min bike or walking
- Leg swings, bodyweight squats

### Main Workout

**1. Barbell Squats**
- 4 sets × 8-10 reps
- Rest: 2 minutes
- Go parallel or below

**2. Romanian Deadlifts**
- 4 sets × 10-12 reps
- Rest: 90 seconds
- Feel the hamstring stretch

**3. Leg Press**
- 3 sets × 12 reps
- Rest: 90 seconds
- Don't lock knees

**4. Walking Lunges**
- 3 sets × 12 each leg
- Rest: 60 seconds

**5. Leg Curls**
- 3 sets × 12-15 reps
- Rest: 60 seconds

**6. Leg Extensions**
- 3 sets × 12-15 reps
- Rest: 60 seconds

**7. Standing Calf Raises**
- 4 sets × 15-20 reps
- Rest: 45 seconds
- Full range of motion

### Pro Tips
- 🎯 Never skip legs!
- 📈 Squats are king
- 🧘 Stretch after
- 💧 Stay hydrated

Expect soreness for 2-3 days!`;
  }

  private getArmWorkout(): string {
    return `## 💪 Complete Arm Workout

### Warm-up
- Arm circles, light curls
- Band pull-aparts

### Biceps

**1. Barbell Curls**
- 4 sets × 8-10 reps
- Rest: 60 seconds

**2. Incline Dumbbell Curls**
- 3 sets × 10-12 reps
- Rest: 60 seconds

**3. Hammer Curls**
- 3 sets × 12 reps
- Rest: 45 seconds

**4. Cable Curls (21s)**
- 2 sets (7 bottom, 7 top, 7 full)
- Rest: 90 seconds

### Triceps

**1. Close-Grip Bench Press**
- 4 sets × 8-10 reps
- Rest: 75 seconds

**2. Tricep Dips**
- 3 sets × 10-12 reps
- Rest: 60 seconds

**3. Skull Crushers**
- 3 sets × 10-12 reps
- Rest: 60 seconds

**4. Tricep Pushdowns**
- 3 sets × 12-15 reps
- Rest: 45 seconds

### Forearms

**Wrist Curls**
- 2 sets × 15 reps each direction

### Tips
- 🎯 Triceps = 2/3 of arm size
- 🔄 Control the negative
- 💪 Don't use momentum`;
  }

  private getShoulderWorkout(): string {
    return `## 🏋️ Complete Shoulder Workout

### Warm-up
- Band pull-aparts, arm circles
- Light lateral raises

### Main Workout

**1. Overhead Press (Barbell/Dumbbell)**
- 4 sets × 8-10 reps
- Rest: 90 seconds

**2. Lateral Raises**
- 4 sets × 12-15 reps
- Rest: 45 seconds
- Slight bend in elbows

**3. Face Pulls**
- 3 sets × 15 reps
- Rest: 45 seconds

**4. Front Raises**
- 3 sets × 12 reps
- Rest: 45 seconds

**5. Reverse Pec Deck / Rear Delt Flyes**
- 3 sets × 15 reps
- Rest: 45 seconds

**6. Shrugs**
- 3 sets × 12-15 reps
- Rest: 60 seconds

**7. Arnold Press**
- 3 sets × 10-12 reps
- Rest: 60 seconds

### Key Points
- 🎯 All 3 heads: front, side, rear
- 📐 Don't go too heavy on raises
- 🛡️ Warm up rotator cuff
- 💪 Mind-muscle connection`;
  }

  private getAbWorkout(): string {
    return `## 🔥 Complete Ab & Core Workout

### The Truth About Abs
- Abs are made in the kitchen!
- You can't spot-reduce fat
- Train abs 2-3× per week

### Core Circuit (3 Rounds)

**1. Plank**
- 45-60 seconds
- Keep body straight

**2. Bicycle Crunches**
- 20 reps each side
- Slow and controlled

**3. Leg Raises**
- 15 reps
- Don't swing

**4. Russian Twists**
- 20 reps total
- Weight optional

**5. Dead Bug**
- 10 reps each side
- Core tight throughout

**6. Mountain Climbers**
- 30 seconds
- Keep hips level

**Rest:** 30 seconds between exercises, 90 seconds between rounds

### Additional Exercises
- Ab wheel rollouts
- Cable crunches
- Hanging leg raises
- Pallof press

### Tips for Visible Abs
- 🍽️ Calorie deficit for fat loss
- 🥗 High protein diet
- 💧 Reduce bloating (less sodium)
- 😴 Quality sleep
- 🏃 Cardio helps`;
  }

  private getBeginnerWorkout(): string {
    return `## 🌟 Beginner Full-Body Workout

Perfect for those just starting! Do this 3× per week.

### Warm-up (5 min)
- Light jogging or jumping jacks
- Arm circles, leg swings

### Circuit - Repeat 3 Times

**1. Bodyweight Squats**
- 12 reps
- Keep chest up

**2. Push-ups** (or Knee Push-ups)
- 10 reps
- Full range of motion

**3. Dumbbell Rows**
- 10 reps each arm
- Use light weight

**4. Plank**
- 30 seconds
- Don't let hips sag

**5. Walking Lunges**
- 10 each leg
- Step forward, lower down

**6. Dumbbell Shoulder Press**
- 10 reps
- Light weight to start

### Rest
- 60 seconds between exercises
- 2 minutes between circuits

### Cool-down
- Full body stretching (5 min)
- Deep breathing

### Week-by-Week Progression
- **Week 1-2:** Focus on form
- **Week 3-4:** Add 2-3 reps
- **Week 5+:** Increase weight

### Tips for Beginners
- ✅ Form over weight
- ✅ Stay consistent
- ✅ Rest days matter
- ✅ Track your progress
- ❌ Don't compare to others

You've got this! 💪`;
  }

  private getFullBodyWorkout(): string {
    return `## 💪 Full Body Workout

Great for 2-3× per week training.

### Warm-up (5-10 min)
- Light cardio
- Dynamic stretches

### Workout

**1. Squats**
- 4 sets × 8-10 reps
- Rest: 90 seconds

**2. Bench Press**
- 4 sets × 8-10 reps
- Rest: 90 seconds

**3. Barbell Rows**
- 4 sets × 8-10 reps
- Rest: 90 seconds

**4. Overhead Press**
- 3 sets × 10-12 reps
- Rest: 75 seconds

**5. Romanian Deadlifts**
- 3 sets × 10-12 reps
- Rest: 75 seconds

**6. Pull-ups / Lat Pulldown**
- 3 sets × 8-12 reps
- Rest: 60 seconds

**7. Plank**
- 3 sets × 45-60 seconds
- Rest: 45 seconds

### Why Full Body Works
- ✅ Hit each muscle 2-3× per week
- ✅ Great for busy schedules
- ✅ Builds overall strength
- ✅ Burns more calories`;
  }

  private getFatBurningWorkout(): string {
    return `## 🔥 Fat Burning HIIT Workout

### The Science
- Burns calories during AND after
- Preserves muscle mass
- Time efficient

### Warm-up (3 min)
- Jumping jacks: 1 min
- High knees: 1 min
- Arm circles: 1 min

### HIIT Circuit (4 Rounds)

**Work:** 40 seconds | **Rest:** 20 seconds

1. **Burpees** 🔥
2. **Mountain Climbers** 🏔️
3. **Jump Squats** 🦵
4. **Push-ups** 💪
5. **High Knees** 🏃
6. **Plank Jacks** 🎯

**Rest 2 minutes between rounds**

### Finisher
- 1 minute all-out jumping jacks
- 1 minute plank hold

### Cool-down (5 min)
- Light walking
- Full body stretches

### Tips for Fat Loss
- 🍽️ Diet is 80% of results
- 💧 Stay hydrated
- 😴 Sleep 7-9 hours
- 🏃 Add 2-3 HIIT sessions/week
- 🏋️ Don't skip strength training

**Calories burned:** ~400-600 in 30 minutes!`;
  }

  private getGeneralWorkoutPlan(): string {
    return `## 📋 Weekly Workout Split

### Push/Pull/Legs Split (Recommended)

**Day 1 - Push**
- Bench Press: 4×8-10
- Shoulder Press: 3×10-12
- Incline Dumbbell Press: 3×10
- Lateral Raises: 3×15
- Tricep Pushdowns: 3×12

**Day 2 - Pull**
- Pull-ups/Pulldowns: 4×8-10
- Barbell Rows: 4×8-10
- Face Pulls: 3×15
- Bicep Curls: 3×12
- Rear Delt Flyes: 3×15

**Day 3 - Legs**
- Squats: 4×8-10
- Romanian Deadlifts: 3×10
- Leg Press: 3×12
- Leg Curls: 3×12
- Calf Raises: 4×15

**Day 4 - Rest**

**Day 5-7** - Repeat or Rest

### Alternative Splits
- **Upper/Lower** - 4 days
- **Full Body** - 3 days
- **Bro Split** - 5-6 days

What's your goal? I can customize this!`;
  }

  private getGeneralNutritionTips(): string {
    return `## 🍽️ Nutrition Fundamentals

### The Basics

**Calories**
- **Lose weight:** Eat less than you burn
- **Maintain:** Eat = burn
- **Gain muscle:** Eat more than burn

**Macronutrients**

🥩 **Protein** (4 cal/gram)
- 0.7-1g per lb bodyweight
- Builds & repairs muscle
- Sources: Chicken, fish, eggs, tofu

🍚 **Carbs** (4 cal/gram)
- Primary energy source
- Don't fear them!
- Sources: Rice, oats, potatoes, fruits

🥑 **Fats** (9 cal/gram)
- Hormones & brain function
- 0.3-0.4g per lb bodyweight
- Sources: Avocado, nuts, olive oil

### Quick Tips
- 💧 Drink 8-10 glasses water daily
- 🥬 Eat vegetables with each meal
- 🍎 Whole foods over processed
- 📱 Track food for awareness
- 🍽️ Don't skip meals

What specific aspect of nutrition can I help with?`;
  }

  private getProteinInfo(): string {
    return `## 🥩 Complete Protein Guide

### How Much Protein?
- **General:** 0.7-0.8g per lb bodyweight
- **Building muscle:** 0.8-1g per lb
- **Losing fat:** 1-1.2g per lb (preserves muscle)

### Best Protein Sources

**Animal Sources:**
- 🐔 Chicken breast: 31g per 100g
- 🐟 Salmon: 25g per 100g
- 🥚 Eggs: 6g per egg
- 🥩 Lean beef: 26g per 100g
- 🧀 Greek yogurt: 10g per 100g

**Plant Sources:**
- 🫘 Lentils: 9g per 100g
- 🫛 Tofu: 8g per 100g
- 🥜 Peanuts: 25g per 100g
- 🌾 Quinoa: 4g per 100g

### Protein Timing
- ✅ 20-40g per meal
- ✅ Every 3-4 hours
- ✅ Post-workout is important
- ✅ Before bed (casein is great)

### Protein Supplements
- **Whey:** Fast absorbing, post-workout
- **Casein:** Slow release, before bed
- **Plant-based:** Pea, rice, hemp blends

Total daily protein matters more than perfect timing!`;
  }

  private getSupplementInfo(): string {
    return `## 💊 Supplement Guide

### Essential (Evidence-Based)

**1. Creatine Monohydrate** ⭐
- Most researched supplement
- 5g daily (no loading needed)
- Improves strength & power
- Safe and effective

**2. Protein Powder**
- Convenient protein source
- Whey, casein, or plant-based
- 1-2 scoops daily as needed

**3. Vitamin D**
- Most people are deficient
- 2000-5000 IU daily
- Important for everything

**4. Fish Oil (Omega-3)**
- Heart & brain health
- Anti-inflammatory
- 2-3g EPA+DHA daily

### Helpful But Optional

- **Caffeine:** Pre-workout energy
- **Beta-Alanine:** Endurance
- **Citrulline:** Pumps & performance
- **Multivitamin:** Insurance policy

### Skip These
- ❌ Fat burners (mostly caffeine)
- ❌ Testosterone boosters
- ❌ BCAAs (if eating enough protein)
- ❌ Most "proprietary blends"

### Remember
- Supplements are 5% of results
- Food and training are 95%
- Don't waste money on hype`;
  }

  private getRecoveryTips(): string {
    return `## 😴 Recovery Guide

### Sleep (The #1 Priority)

**Why It Matters:**
- Muscle repair happens during sleep
- Hormone optimization (HGH, testosterone)
- Mental recovery

**Tips for Better Sleep:**
- 🛏️ 7-9 hours per night
- ⏰ Consistent sleep schedule
- 📱 No screens 1 hour before bed
- 🌡️ Cool, dark room
- ☕ No caffeine after 2pm

### Active Recovery

**Light Movement Days:**
- Walking (30 min)
- Light stretching/yoga
- Swimming
- Foam rolling

### Nutrition for Recovery

- 🥩 Protein every 3-4 hours
- 💧 Stay hydrated
- 🍌 Potassium (bananas, potatoes)
- 🫐 Antioxidants (berries)

### Other Tips

- 🧊 Ice baths (controversial but some like it)
- 🧘 Meditation/stress management
- 💆 Massage or self-myofascial release
- 📅 Deload weeks every 4-8 weeks

### Signs of Poor Recovery
- ⚠️ Constant fatigue
- ⚠️ Decreased performance
- ⚠️ Persistent soreness
- ⚠️ Mood changes
- ⚠️ Getting sick often

Listen to your body!`;
  }

  private getMotivationTips(): string {
    return `## 🔥 Stay Motivated & Consistent

### Mindset Shifts

**1. Focus on the Process**
- Results take time
- Enjoy the journey
- Small wins matter

**2. Make it a Habit**
- Same time each day
- Non-negotiable appointment
- Takes ~66 days to form

**3. Start Small**
- 15 minutes is better than 0
- Consistency > intensity
- Build momentum

### Practical Tips

✅ **Set Specific Goals**
- "Lose 10 lbs in 3 months"
- Not "get in shape"

✅ **Track Progress**
- Workout log
- Progress photos
- Measurements

✅ **Find Your Why**
- Health? Confidence? Energy?
- Write it down
- Read it when struggling

✅ **Build Environment**
- Gym bag ready
- Healthy food stocked
- Remove temptations

✅ **Get Support**
- Workout partner
- Online community
- Share your goals

### When You Don't Feel Like It

- 🎯 "Just show up" mentality
- 🎵 Create a pump-up playlist
- 📺 Watch motivational content
- 💭 Visualize your goals
- 🏆 Remember past successes

**Remember:** Motivation fades. Discipline and habits last.

You've got this! 💪`;
  }

  private getWelcomeResponse(): string {
    return `┌─────────────────────────────────────┐
│ 🏋️ FITBOT PRO                      │
│ Your AI Fitness & Nutrition Coach  │
└─────────────────────────────────────┘

Welcome! I'm your personal AI fitness coach, here to help you achieve your health and fitness goals with professional, personalized guidance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 HOW I CAN HELP YOU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌ 🏋️ WORKOUT PLANS ─────────────────┐
│ • "Create a chest workout"        │
│ • "Design a beginner routine"     │
│ • "Give me a leg day program"     │
│ • "Full body workout for home"    │
└───────────────────────────────────┘

┌ 🥗 NUTRITION & DIET ──────────────┐
│ • "Weight loss diet plan"         │
│ • "1500 calorie vegetarian meal"  │
│ • "Pre-workout nutrition guide"   │
│ • "High protein meal ideas"       │
└───────────────────────────────────┘

┌ 📊 FITNESS COACHING ──────────────┐
│ • "How to build muscle fast?"     │
│ • "Best fat burning strategies"   │
│ • "Supplement recommendations"    │
│ • "Recovery and sleep tips"       │
└───────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 FOR BEST RESULTS, SHARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ Your current weight & height
▸ Your fitness goal
▸ Diet preference (veg/non-veg)
▸ Activity level
▸ Any dietary restrictions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What's your fitness goal today? Let's create a personalized plan for you! 💪`;
  }

  private getErrorResponse(): string {
    return `I apologize, but I encountered an error processing your request. Please try again!

In the meantime, here are some things I can help with:
- 💪 Workout routines (chest, back, legs, arms)
- 🥗 Diet and meal plans
- 📊 Nutrition advice
- 🏃 Fat burning tips

Just ask your question again!`;
  }

  clearHistory(): void {
    this.messagesSignal.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
