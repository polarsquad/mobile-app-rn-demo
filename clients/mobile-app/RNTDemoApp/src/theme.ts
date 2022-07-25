interface ColorTheme {
  primary: string;
  onPrimary: string;
  surface: string;
  onSurface: string;
  background: string;
}

export const COLOR: ColorTheme = {
  primary: '#000000',
  onPrimary: '#fff',
  surface: '#fff',
  onSurface: '#000',
  background: '#000000',
};

interface SpacingTheme {
  base: number;
  double: number;
}

export const SPACING: SpacingTheme = {
  base: 8,
  double: 16,
};
