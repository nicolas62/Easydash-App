import React from 'react';
import { WidgetConfig } from '../../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartWidgetProps {
  widget: WidgetConfig;
  chartData: { time: number; value: number }[];
  isColorized: boolean;
}

const axisColor = (isColorized: boolean) => isColorized ? 'rgba(255,255,255,0.5)' : '#94a3b8';

const tickFormatter = (time: number, aggregation?: string) => {
  const date = new Date(time);
  return aggregation && aggregation !== 'none'
    ? date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const sharedTooltipStyle = {
  contentStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' },
  itemStyle: { color: '#38bdf8' },
  labelFormatter: (label: number) => new Date(label).toLocaleString(),
};

const sharedXAxis = (isColorized: boolean, aggregation?: string) => ({
  dataKey: 'time' as const,
  tickFormatter: (t: number) => tickFormatter(t, aggregation),
  stroke: axisColor(isColorized),
  tick: { fontSize: 10 },
  tickLine: false,
  axisLine: false,
  minTickGap: 30,
});

const sharedYAxis = (isColorized: boolean) => ({
  stroke: axisColor(isColorized),
  tick: { fontSize: 10 },
  tickLine: false,
  axisLine: false,
});

const ChartWidget: React.FC<ChartWidgetProps> = ({ widget, chartData, isColorized }) => {
  const color = isColorized ? '#ffffff' : '#0ea5e9';
  const margin = { top: 5, right: 5, left: -20, bottom: 0 };

  return (
    <div className="flex flex-col h-full w-full relative z-10 p-2">
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {widget.chartType === 'bar' ? (
            <BarChart data={chartData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis {...sharedXAxis(isColorized, widget.chartAggregation)} />
              <YAxis {...sharedYAxis(isColorized)} />
              <Tooltip {...sharedTooltipStyle} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis {...sharedXAxis(isColorized, widget.chartAggregation)} />
              <YAxis {...sharedYAxis(isColorized)} domain={['auto', 'auto']} />
              <Tooltip {...sharedTooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={!!(widget.chartAggregation && widget.chartAggregation !== 'none')}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <h3 className={`text-center text-xs font-medium truncate mt-1 ${isColorized ? 'text-white' : 'text-content-secondary'}`}>
        {widget.name}
      </h3>
    </div>
  );
};

export default ChartWidget;
