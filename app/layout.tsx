import "@/app/globals.css";
import {
  ColorSchemeScript,
  DEFAULT_THEME,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import { Inter } from "next/font/google";
import colors from "tailwindcss/colors";

const inter = Inter({ subsets: ["latin"] });

const blockListColors = [
  "black",
  "white",
  "inherit",
  "current",
  "transparent",
  "gray",
  "lightBlue",
  "warmGray",
  "trueGray",
  "coolGray",
  "blueGray",
];

const newColors: any = Object.keys(colors)
  .filter((c) => !blockListColors.includes(c))
  .reduce((all, c: string) => {
    return {
      ...all,
      // @ts-ignore
      [c]: Object.values(colors[c]),
    };
  }, {});

const theme = createTheme({
  ...DEFAULT_THEME,
  fontFamily: inter.style.fontFamily,
  headings: {
    ...DEFAULT_THEME.headings,
    fontFamily: inter.style.fontFamily,
  },
  colors: {
    ...DEFAULT_THEME.colors,
    ...newColors,
  },
  primaryColor: "blue",
  primaryShade: 6,
  defaultRadius: 6,
  cursorType: "pointer",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <link rel="icon" href="/image/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
