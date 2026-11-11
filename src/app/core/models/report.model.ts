export interface PieChartData {
  labels: string[];
  values: number[];
  percentages?: number[];
  colors?: string[];
  total?: number;
}

export interface LineChartData {
  labels: string[];
  values: number[];
}

export interface BarChartData {
  labels: string[];
  values: number[];
  totalZones?: number;
}

export interface AreaChartSeries {
  name: string;
  data: number[];
  color: string;
}

export interface AreaChartData {
  labels: string[];
  series: AreaChartSeries[];
}

