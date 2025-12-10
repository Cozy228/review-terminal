# Executive Dashboard Chart Enhancement Plan

## Overview
Add retro-styled charts (scatter, line/area, bar, radial gauge) to the ExecutiveDataPage, focusing on targeted improvements to Delivery and Quality sections while maintaining the ASCII terminal aesthetic.

## User Requirements
- Cards grouped by similar value types (3-4 per row)
- Vendor benchmarks: Velocity vs Lead Time scatter/quadrant chart
- Monthly trends: Line/Area chart for delivery metrics
- Quality distribution: Bar chart replacing ASCII bars
- Performance scores: Radial gauge charts
- Maintain retro/ASCII style with clear topic separation

## Implementation Phases

### Phase 1: Install Dependencies & Setup

**1.1 Install recharts**
```bash
pnpm add recharts
```
、、
**1.2 Create chart components directory**
- Create `/src/components/charts/` for all chart components

**1.3 Create chart styles**
- Create `/src/styles/executive-charts.css` with retro theme overrides for recharts

---

### Phase 2: Create Chart Components

All components in `/src/components/charts/`

#### 2.1 VendorQuadrantChart.tsx
**Purpose:** Scatter plot showing Velocity (x-axis) vs Lead Time (y-axis) for vendor comparison

**Props:**
```typescript
interface VendorQuadrantData {
  name: string;
  velocity: number;
  leadTime: number;
  isInternal: boolean;
}

interface VendorQuadrantChartProps {
  data: VendorQuadrantData[];
  industryAvg: { velocity: number; leadTime: number };
}
```

**Features:**
- 4 quadrants divided by industry average (crosshair reference lines)
- Internal vendors: green dots, Contractors: gold/orange/pink dots
- Custom tooltip with retro card styling
- Dashed grid lines
- Monospace font for labels

#### 2.2 MonthlyTrendChart.tsx
**Purpose:** Line/Area chart for velocity and lead time trends over 12 months

**Props:**
```typescript
interface MonthlyTrendChartProps {
  data: Array<{ month: string; [key: string]: string | number }>;
  metrics: Array<{
    key: string;
    label: string;
    color: string;
    yAxisId?: 'left' | 'right';
  }>;
  height?: number;
}
```

**Features:**
- Dual Y-axes (velocity on left, lead time on right)
- Area chart with gradient fills
- Dashed grid lines
- Retro legend
- Custom tooltip

#### 2.3 BarComparisonChart.tsx
**Purpose:** Horizontal bar chart for code quality distribution (A/B/C/D grades)

**Props:**
```typescript
interface BarComparisonChartProps {
  data: Array<{
    label: string;
    value: number;
    tone: 'green' | 'blue' | 'gold' | 'red' | 'purple' | 'pink';
  }>;
  orientation?: 'horizontal' | 'vertical';
  height?: number;
}
```

**Features:**
- Colored bars by tone
- Value labels inside bars
- Percentage on the right
- Monospace font

#### 2.4 RadialGaugeChart.tsx
**Purpose:** Semicircular gauge for performance scores (SLA, PR success rate)

**Props:**
```typescript
interface RadialGaugeProps {
  value: number;  // 0-100
  target?: number;
  label: string;
  tone: 'green' | 'gold' | 'red';
}
```

**Features:**
- 180-degree semicircle
- Large center value display
- Target marker line
- Tone-based coloring

---

### Phase 3: Update Type Definitions

**File:** `/src/types/executive.ts`

Add new chart data interfaces:
```typescript
export interface VendorQuadrantData {
  name: string;
  velocity: number;
  leadTime: number;
  isInternal: boolean;
}

export interface MonthlyTrendChartData {
  month: string;
  velocity?: number;
  leadTime?: number;
  prSuccessRate?: number;
}
```

Verify existing types:
- `TeamDeliveryData` (already exists)
- `TeamQualityData` (already exists)
- `MonthlyTrend` (already exists)

---

### Phase 4: Extend Adapters

**File:** `/src/adapters/ExecutiveAdapter.ts`

#### 4.1 DeliveryAdapter additions

Add methods:
```typescript
// Transform vendorBenchmarks to quadrant format
static toVendorQuadrantData(
  vendorBenchmarks: DepartmentEntity['vendorBenchmarks']
): VendorQuadrantData[]

// Transform monthlyTrends for delivery charts
static toMonthlyTrendData(
  monthlyTrends: MonthlyTrend[]
): MonthlyTrendChartData[]

// Generate trend narrative
static toTrendNarrative(monthlyTrends: MonthlyTrend[]): string
```

#### 4.2 QualityAdapter additions

Add methods:
```typescript
// Quality overview cards (3 cards: A/B%, SLA, PR Success)
static toQualityCards(data: TeamQualityData): StatCard[]

// Enhance existing toCodeQualityBars to return proper format for BarComparisonChart
```

---

### Phase 5: Update DeliverySection

**File:** `/src/components/exec/DeliverySection.tsx`

**Changes:**
1. Keep existing primary cards (3 columns)
2. Keep existing secondary cards (3 columns)
3. Replace vendor ASCII bars section with TWO new chart sections:

**New Section 1: Monthly Trends**
```tsx
<div className="retro-card is-blue mb-4">
  <div className="retro-card-title">VELOCITY & LEAD TIME TRENDS (12 MONTHS)</div>
  <MonthlyTrendChart
    data={monthlyTrendsData}
    metrics={[
      { key: 'velocity', label: 'Velocity (SP)', color: 'var(--retro-primary)', yAxisId: 'left' },
      { key: 'leadTime', label: 'Lead Time (days)', color: 'var(--retro-gold)', yAxisId: 'right' }
    ]}
    height={280}
  />
  <TypewriterText className="retro-card-note mt-2" initialText={trendNarrative} />
</div>
```

**New Section 2: Vendor Quadrant**
```tsx
<div className="retro-card is-gold">
  <div className="retro-card-title">VENDOR PERFORMANCE COMPARISON</div>
  <VendorQuadrantChart
    data={vendorQuadrantData}
    industryAvg={industryAvgPoint}
  />
  <TypewriterText className="retro-card-note mt-2" initialText={vendorNarrative} />
</div>
```

**Data transformations:**
```typescript
const monthlyTrendsData = useMemo(() =>
  DeliveryAdapter.toMonthlyTrendData(data.monthlyTrends),
  [data.monthlyTrends]
);

const vendorQuadrantData = useMemo(() =>
  DeliveryAdapter.toVendorQuadrantData(data.vendorBenchmarks),
  [data.vendorBenchmarks]
);

const trendNarrative = useMemo(() =>
  DeliveryAdapter.toTrendNarrative(data.monthlyTrends),
  [data.monthlyTrends]
);
```

**Props update:**
Ensure `TeamDeliveryData` includes:
- `vendorBenchmarks` (from DepartmentEntity)
- `monthlyTrends` (from DepartmentEntity)

---

### Phase 6: Update QualitySection

**File:** `/src/components/exec/QualitySection.tsx`

**Changes:**
1. Add quality overview cards section at the top (3 cards in a row)
2. Replace code quality ASCII bars with BarComparisonChart
3. Replace SLA and PR ASCII bars with dual RadialGaugeChart

**New Layout:**
```tsx
{/* Quality Overview Cards */}
<div className="mb-4">
  <div className="retro-card-title mb-2" style={{ fontSize: '0.75rem', color: 'var(--accent-info)' }}>
    QUALITY OVERVIEW
  </div>
  <DataCardGroup items={qualityCards} columns={3} />
</div>

{/* Code Quality Distribution - Bar Chart */}
<div className="retro-card is-blue mb-4">
  <div className="retro-card-title">CODE QUALITY DISTRIBUTION</div>
  <BarComparisonChart
    data={codeQualityBars}
    orientation="horizontal"
    height={200}
  />
  <TypewriterText className="retro-card-note mt-2" initialText={narrative} />
</div>

{/* SLA & PR Success - Dual Radial Gauges */}
<div className="grid grid-two gap-4">
  <div className="retro-card is-gold">
    <div className="retro-card-title">SLA ACHIEVEMENT</div>
    <RadialGaugeChart
      value={data.slaRate}
      target={data.slaTarget}
      label="SLA Rate"
      tone={data.slaRate >= data.slaTarget ? 'green' : 'gold'}
    />
    <div className="retro-card-note mt-2">Target: {data.slaTarget}%</div>
  </div>

  <div className="retro-card is-purple">
    <div className="retro-card-title">PR SUCCESS RATE</div>
    <RadialGaugeChart
      value={data.prSuccessRate}
      target={data.prTarget}
      label="PR Success"
      tone={data.prSuccessRate >= data.prTarget ? 'green' : 'gold'}
    />
    <div className="retro-card-note mt-2">Target: {data.prTarget}%</div>
  </div>
</div>
```

**Data transformations:**
```typescript
const qualityCards = useMemo(() => QualityAdapter.toQualityCards(data), [data]);
const codeQualityBars = useMemo(() => QualityAdapter.toCodeQualityBars(data), [data]);
```

---

### Phase 7: Update Mock Data

**File:** `/src/data/executiveMock.ts`

Ensure `teamSummary` export includes:
```typescript
export const teamSummary = {
  // ... existing fields
  delivery: {
    primary: [...], // existing
    secondary: [...], // existing
    vendor: {...}, // existing
    vendorBenchmarks: executiveMock.vendorBenchmarks,
    monthlyTrends: executiveMock.monthlyTrends
  },
  quality: {
    codeQuality: [...],
    slaRate: 93,
    slaTarget: 95,
    prSuccessRate: 92.5,
    prTarget: 95
  },
  // ... rest
};
```

---

### Phase 8: Create Retro Chart Styles

**File:** `/src/styles/executive-charts.css`

Key styles:
- Override recharts grid lines with dashed style
- Monospace fonts for all axis labels
- Custom tooltip styling (retro card with border)
- Tone-based color mapping
- Reference line styling (quadrant dividers)
- Radial gauge styling
- Legend styling

Import in `ExecutiveDataPage.tsx` or `App.tsx`

---

## Critical Files to Modify

1. **package.json** - Add recharts dependency
2. **/src/components/charts/** - Create 4 new chart components
3. **/src/components/exec/DeliverySection.tsx** - Add MonthlyTrendChart and VendorQuadrantChart
4. **/src/components/exec/QualitySection.tsx** - Add BarComparisonChart and RadialGaugeChart
5. **/src/adapters/ExecutiveAdapter.ts** - Add chart data transformation methods
6. **/src/data/executiveMock.ts** - Ensure teamSummary includes vendorBenchmarks and monthlyTrends
7. **/src/types/executive.ts** - Add VendorQuadrantData and MonthlyTrendChartData interfaces
8. **/src/styles/executive-charts.css** - Create retro theme overrides for recharts

---

## Design Principles

- **Retro Aesthetic:** Monospace fonts, dashed grid lines, scanline effects, double borders
- **Color Consistency:** Use existing tone system (green/gold/blue/red/purple/pink)
- **Data Hierarchy:** 3-4 cards per row, charts below for detailed visualization
- **Separation:** Each chart in its own retro-card with clear title
- **Responsive:** Ensure charts are readable on different screen sizes
- **Type Safety:** Strong TypeScript types throughout

---

## Testing Checklist

- [ ] Charts render correctly with mock data
- [ ] Retro styling matches existing components
- [ ] Tooltips display properly
- [ ] TypeScript compiles without errors
- [ ] Responsive layout works on mobile
- [ ] Colors match tone system
- [ ] Narratives display correctly
- [ ] MonthlyTrends data flows properly
- [ ] VendorBenchmarks data flows properly

---

## Notes

- Keep existing ASCII bars for other sections (Basics, CI/CD, Jira) to maintain variety
- The targeted approach focuses on Delivery and Quality sections only
- All data transformations happen in adapters to keep components clean
- Use useMemo for performance optimization
