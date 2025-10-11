# Embedding Insights Dashboard

## Overzicht

Een transparante UI voor users en analytics voor admins om style embeddings te visualiseren, vergelijken en begrijpen. Users zien wat hun recommendations drijft, admins krijgen aggregaat inzichten.

## User-Facing: EmbeddingInsights Component

### Features

**1. Top 3 Archetypes Breakdown**
- Visual bar charts met percentages
- Ranked display (1, 2, 3)
- Animated progress bars
- "Jouw stijl in 3 woorden" summary

**2. Influence Breakdown (Details Toggle)**
- Quiz: 40% (blue bar)
- Swipes: 35% (purple bar)
- Calibration: 25% (green bar)
- Lock timestamp

**3. Re-calibration Trigger**
- Auto-detect: 6+ months since lock
- Amber alert card met "Tijd voor een update?"
- Call-to-action button
- Clear reasoning (stijl verandert over tijd)

### UI States

#### Locked Profiel
```tsx
<EmbeddingInsights
  userId={userId}
  onRecalibrate={() => navigate('/quiz/calibration')}
/>
```

Display:
- Top 3 archetypes met scores
- Version number
- Summary: "classic, scandi en minimal"
- Toggle details → influence breakdown
- Re-calibration prompt (if needed)

#### No Profiel
```
[Sparkles icon]
"Voltooi de stijlquiz om je profiel te ontgrendelen"
```

### Design Patterns

**Colors:**
- Rank 1: Primary-700 (strongest)
- Rank 2: Primary-500
- Rank 3: Primary-400

**Influence Bars:**
- Quiz: Blue (#3B82F6)
- Swipes: Purple (#A855F7)
- Calibration: Green (#10B981)

**Re-calibration Alert:**
- Amber background (amber-50)
- Amber border (amber-200)
- Amber icon (amber-600)
- Clear CTA button

## Admin-Facing: EmbeddingAnalytics Component

### Features

**1. Stats Overview (3 Cards)**
- Total Locked Profiles (Users icon, blue)
- Avg Time to Lock in minutes (Target icon, purple)
- Avg Archetypes per User (BarChart icon, green)

**2. Top 10 Archetypes Chart**
- Horizontal bars
- User count per archetype
- Avg score per archetype
- Sorted by user count
- Relative bar widths

**3. Preference Stability Distribution**
- Very Stable (≥90%): Green bar
- Moderately Stable (70-90%): Amber bar
- Volatile (<70%): Red bar
- Percentages + user counts
- Definitions tooltip

### SQL Functions (Analytics)

#### get_archetype_distribution()
```sql
SELECT * FROM get_archetype_distribution();
→ archetype | user_count | avg_score
  'classic'  | 1240       | 78.5
  'minimal'  | 980        | 72.3
  ...
```

Aggregates across all locked profiles.

#### get_stability_distribution()
```sql
SELECT * FROM get_stability_distribution();
→ category          | user_count
  'Very Stable'     | 1580
  'Moderately ...'  | 420
  'Volatile'        | 120
```

Categorizes users by preference stability.

#### get_embedding_stats()
```sql
SELECT * FROM get_embedding_stats();
→ total_locked | avg_time_to_lock | avg_archetypes_per_user
  2120         | 12.5 min         | 4.2
```

General metrics for dashboard.

## User History: EmbeddingTimeline Component

### Features

**1. Version Timeline**
- All snapshots listed (v1, v2, v3...)
- Trigger labels (Quiz voltooid, Swipes voltooid, Calibratie voltooid)
- Timestamps (formatted in NL)
- "Huidig" badge on latest
- Click to select version

**2. Version Comparison**
- Select 2 versions (primary + compare)
- Visual diff:
  - New archetypes (Plus icon, green)
  - Removed archetypes (Minus icon, red)
  - Increased (TrendingUp, green, +delta)
  - Decreased (TrendingDown, red, -delta)
  - Stable (hidden by default)

**3. Selected Version Details**
- Top 5 archetypes bar chart
- Changes since previous (if exists)
- Delta indicators (±X points)

### SQL Functions (Timeline)

#### get_user_embedding_timeline()
```sql
SELECT * FROM get_user_embedding_timeline(user_id);
→ version | embedding | snapshot_trigger | created_at | changes
  1       | {...}     | quiz_complete    | 2025-01-15 | null
  2       | {...}     | swipes_complete  | 2025-01-15 | {...}
  3       | {...}     | calibration_...  | 2025-01-15 | {...}
```

Returns complete history with automatic change detection.

#### compare_embedding_versions()
```sql
SELECT * FROM compare_embedding_versions(user_id, v1, v2);
→ archetype | v1_score | v2_score | delta | change_type
  'minimal' | 60       | 75       | +15   | 'increased'
  'classic' | 80       | 80       | 0     | 'stable'
  'bohemian'| 0        | 45       | +45   | 'new'
```

Detailed diff between two versions.

## Use Cases

### User: "Waarom krijg ik deze outfits?"

**Before:**
- Geen transparantie
- "Trust the algorithm"
- Users frustrated door mystery recommendations

**After:**
```
[EmbeddingInsights]
Top 3 Archetypes:
1. Classic (35%)
2. Scandi Minimal (30%)
3. Minimal (20%)

Details →
40% Quiz | 35% Swipes | 25% Outfit Feedback
Vastgelegd op 15 januari 2025
```

User begrijpt exact waarom ze classic/minimal outfits zien.

### User: "Mijn smaak is veranderd"

**Before:**
- Geen mechanisme om profiel te updaten
- Stuck met oude preferences

**After:**
```
[Re-calibration Prompt]
"Je profiel is 8 maanden oud. Stijl verandert — 
 misschien tijd om opnieuw te calibreren?"

[Opnieuw calibreren] button
```

Clear path naar profile update.

### Admin: "Welke archetypes zijn populair?"

**Before:**
- Geen aggregaat data
- Handmatige queries

**After:**
```
[EmbeddingAnalytics]
Top 10 Archetypes:
1. Classic (1240 users, avg 78.5)
2. Minimal (980 users, avg 72.3)
3. Scandi Minimal (850 users, avg 81.2)
...

Preference Stability:
74% Very Stable (1580 users)
20% Moderately Stable (420 users)
6% Volatile (120 users)
```

Clear product insights voor roadmap decisions.

### Admin: "Are users stable or changing?"

**Before:**
- Unknown preference drift
- No retention metrics

**After:**
```
[Stability Distribution]
74% Very Stable → High retention
20% Moderate → Some evolution (healthy)
6% Volatile → Check for UX issues
```

Actionable stability metrics.

## Integration Examples

### Profile Page
```tsx
<ProfilePage>
  <EmbeddingInsights
    userId={user.id}
    onRecalibrate={() => {
      // Navigate to calibration flow
      navigate('/quiz/calibration');
    }}
  />
  
  <EmbeddingTimeline userId={user.id} />
</ProfilePage>
```

### Dashboard Widget
```tsx
<Dashboard>
  <QuickStats />
  
  <EmbeddingInsights
    userId={user.id}
    onRecalibrate={handleRecalibrate}
  />
  
  <RecommendedOutfits />
</Dashboard>
```

### Admin Analytics
```tsx
<AdminDashboard>
  <EmbeddingAnalytics />
</AdminDashboard>
```

## Benefits

### For Users
1. **Transparency** - See exactly what drives recommendations
2. **Control** - Clear when/why to recalibrate
3. **Trust** - Explainable AI builds confidence
4. **Understanding** - Learn their own style preferences

### For Product
1. **Retention** - Re-calibration prompts prevent churn
2. **Quality** - Users validate embedding accuracy
3. **Premium** - Advanced insights = paid tier upsell
4. **Support** - Self-service explanations reduce tickets

### For Business
1. **Analytics** - Data-driven archetype decisions
2. **Trends** - Track stability over time
3. **Targeting** - Segment by archetype for marketing
4. **Optimization** - A/B test with stable baseline

## A/B Testing Potential

### Variant A: No Re-calibration Prompts
- Baseline retention
- Track stale profile impact

### Variant B: Aggressive Prompts (3 months)
- Higher re-calibration rate
- Measure quality improvement

### Variant C: Contextual Prompts
- Trigger after X outfit dislikes
- Adaptive timing based on feedback

### Metrics to Track
1. Re-calibration click-through rate
2. Time between v1 → v2 lock
3. Stability score distribution
4. Satisfaction before/after update

## Future Extensions

### User-Facing

**1. Archetype Explanations**
```tsx
<ArchetypeTooltip archetype="scandi_minimal">
  "Scandi Minimal: strakke lijnen, neutrale tinten,
   comfort-first met sophistication"
</ArchetypeTooltip>
```

**2. Style Journey**
Visual timeline met mood boards:
- V1: Classic corporate
- V2: Classic + minimal (evolution)
- V3: Minimal + scandi (transformation)

**3. Influence Slider**
Let users adjust weights:
```
Quiz: [====    ] 40% → 30%
Swipes: [======  ] 35% → 45%
```
Re-lock with custom weights.

**4. Export Profile**
```
[Download Style Profile PDF]
→ Top archetypes, influence breakdown, outfit gallery
```

### Admin-Facing

**1. Cohort Analysis**
```
Users who locked in Jan 2025:
- 80% still v1 after 6 months
- Top archetype: Classic (45%)
- Avg stability: 0.88
```

**2. Archetype Correlations**
```
Classic + Minimal: 68% co-occurrence
Bohemian + Street: 12% co-occurrence
→ Informs capsule wardrobe curation
```

**3. Embedding Drift Alerts**
```
Alert: 15% of users show <0.7 stability
Action: Review recent calibration changes
```

**4. A/B Test Dashboard**
```
Test: New Swipe Algorithm
- Control (v1): Stability 0.85
- Variant (v2): Stability 0.79 ← Red flag
```

## Files

### Components
- `/src/components/profile/EmbeddingInsights.tsx` (270 lines)
  - User-facing archetype breakdown
  - Influence visualization
  - Re-calibration trigger

- `/src/components/admin/EmbeddingAnalytics.tsx` (230 lines)
  - Admin dashboard
  - Archetype distribution
  - Stability metrics

- `/src/components/profile/EmbeddingTimeline.tsx` (370 lines)
  - Version history
  - Comparison tool
  - Change visualization

### Database
- `/supabase/migrations/20251011_embedding_analytics.sql` (180 lines)
  - get_archetype_distribution()
  - get_stability_distribution()
  - get_embedding_stats()
  - get_user_embedding_timeline()
  - compare_embedding_versions()

## Testing

### User Flow
```bash
# 1. Complete quiz + swipes + calibration
# Lock embedding (v1)

# 2. View profile
# Navigate to /profile
# See EmbeddingInsights component
# Verify top 3 archetypes displayed

# 3. Toggle details
# Click "Details" button
# Verify influence breakdown (40/35/25)

# 4. Wait 6+ months (or mock date)
# See re-calibration prompt
# Click "Opnieuw calibreren"
# Complete calibration flow
# Lock embedding (v2)

# 5. View timeline
# Navigate to timeline section
# See v1 and v2 listed
# Click v1, click "Vergelijk" on v2
# See diff: changed/new/removed archetypes
```

### Admin Flow
```bash
# 1. Navigate to /admin/analytics
# See EmbeddingAnalytics dashboard

# 2. Verify stats
# Total locked > 0
# Avg time to lock reasonable
# Avg archetypes 3-6 range

# 3. Check archetype distribution
# Top 10 displayed
# Bar widths relative
# User counts visible

# 4. Review stability
# 3 categories present
# Percentages sum to 100%
# Colors match (green/amber/red)

# 5. Refresh data
# Click "Ververs" button
# Verify updated counts
```

## Metrics to Track

### User Engagement
1. **Details Toggle Rate** - % who click "Details"
2. **Timeline View Rate** - % who view version history
3. **Comparison Usage** - % who compare versions
4. **Re-calibration CTR** - % who click recalibrate button

### Product Quality
1. **Stability Distribution** - Track over time
2. **Re-calibration Frequency** - How often users update
3. **Version Count** - Avg versions per user
4. **Time Between Versions** - Recalibration cadence

### Business Impact
1. **Premium Conversion** - Do insights drive upgrades?
2. **Retention** - Does transparency improve retention?
3. **Support Tickets** - Reduction in "why this outfit?" tickets
4. **Satisfaction** - NPS before/after insights launch

## Conclusie

Embedding Insights Dashboard maakt de "black box" van AI recommendations **transparent en actionable**:

- **Users** begrijpen hun profiel en kunnen updaten
- **Admins** krijgen product insights en quality metrics
- **Business** krijgt retention tools en premium features

Resultaat: **Trust door transparantie, quality door feedback, retention door control.**
