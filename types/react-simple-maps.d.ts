declare module "react-simple-maps" {
  import type { CSSProperties, ReactNode } from "react";

  interface GeographyFeature {
    rsmKey: string;
    id: string;
    properties: Record<string, unknown> & { name?: string };
  }

  interface ProjectionConfig {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
    parallels?: [number, number];
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }
  export const ComposableMap: (p: ComposableMapProps) => JSX.Element;

  export interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: GeographyFeature[]; projection: unknown }) => ReactNode;
  }
  export const Geographies: (p: GeographiesProps) => JSX.Element;

  type StateStyles = {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  };

  export interface GeographyProps extends Omit<React.SVGProps<SVGPathElement>, "style"> {
    geography: GeographyFeature;
    style?: StateStyles;
  }
  export const Geography: (p: GeographyProps) => JSX.Element;

  export interface SphereProps {
    id?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  }
  export const Sphere: (p: SphereProps) => JSX.Element;

  export interface GraticuleProps {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    step?: [number, number];
  }
  export const Graticule: (p: GraticuleProps) => JSX.Element;
}
