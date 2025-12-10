# Charts - Real-time Analytics Dashboard

React application for data visualization using D3.js. The project demonstrates various types of interactive charts with real-time data updates support.

## Technologies

- **React 19** - UI library
- **TypeScript** - type system
- **Vite** - build tool and dev server
- **D3.js** - data visualization library
- **SCSS** - styling with modules

## Chart Types

The project includes the following chart types:

### 1. Multi-Line Chart (SVG)

Multi-line chart on SVG with support for multiple data lines, updating every second.

### 2. Multi-Line Chart (Canvas)

Optimized version of multi-line chart on Canvas for better performance with large amounts of data.

### 3. Bar Chart

Animated bar chart displaying time series data.

### 4. Pie Chart

Pie chart with gradients, labels, and legend. Supports center hole (donut chart).

### 5. Scatter Chart

Scatter plot for displaying correlations between two variables with category support.

### 6. Gauge Chart

Interactive gauge meter with value input capability.

## Project Structure

```
src/
├── components/
│   └── basic/
│       ├── charts/          # Basic chart components
│       │   ├── bar-chart/
│       │   ├── pie-chart/
│       │   ├── scatter-chart/
│       │   ├── multi-line-chart/
│       │   └── multi-line-chart-canvas/
│       ├── chart-container/ # Chart container
│       └── typography/      # Typography
├── charts/
│   └── components/          # D3.js demo components with real-time data
│       ├── bar-chart-d3/
│       ├── pie-chart-d3/
│       ├── scatter-chart-d3/
│       ├── multiline-chart-d3/
│       ├── multiline-chart-d3-canvas/
│       └── gauge-chart-d3/
├── styles/
│   └── design-system/       # Design system (tokens, mixins, animations)
└── utils/                   # Utilities
```

## Installation and Running

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## Features

- ✅ **Real-time updates** - data updates every second
- ✅ **Memory optimization** - automatic data size limiting to prevent memory leaks
- ✅ **Visibility API** - pause updates when browser tab is hidden
- ✅ **Animations** - smooth transitions when updating data
- ✅ **Responsiveness** - support for various chart sizes
- ✅ **Themes** - support for design variants (normal, accent)
- ✅ **TypeScript** - full typing for all components
- ✅ **Modular architecture** - reusable components and utilities

## Components

### Basic Charts

All basic chart components are located in `src/components/basic/charts/`:

- `BarChart` - bar chart
- `PieChart` - pie chart
- `ScatterChart` - scatter chart
- `MultiLineChart` - multi-line chart (SVG)
- `MultiLineChartCanvas` - multi-line chart (Canvas)
- `GaugeChart` - gauge meter

### D3.js Demo Components

Demo components with real-time data in `src/charts/components/`:

- `BarChartD3` - bar chart with auto-update
- `PieChartD3` - pie chart
- `ScatterChartD3` - scatter chart
- `MultiLineChartD3` - multi-line chart (SVG)
- `MultiLineChartD3Canvas` - multi-line chart (Canvas)
- `GaugeChartD3` - interactive gauge meter

## Design System

The project uses a modular SCSS architecture with design tokens:

- Color variables
- Typography
- Animations
- Mixins and functions

## License

Private project for learning purposes.
