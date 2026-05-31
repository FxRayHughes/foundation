export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margin: ChartMargin;
}

export interface TooltipData {
  label: string;
  value: number;
  color?: string;
  x: number;
  y: number;
}

export interface LegendItem {
  label: string;
  color: string;
}

export interface ChartContainerProps {
  width?: number;
  height?: number;
}
