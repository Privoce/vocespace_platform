import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "@/styles/globals.css";
import { I18nProvider } from "@/lib/i18n/i18n";
import { ConfigProvider } from "antd";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Voce Space | Self-hosted conference app",
    template: "%s",
  },
  description:
    "Voce space is WebRTC project that gives you everything needed to build scalable and real-time audio and/or video experiences in your applications.",
  icons: {
    icon: {
      rel: "icon",
      url: "/favicon.ico",
    },
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${geistSans.className} antialiased`}>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           {children}
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

export const viewport: Viewport = {
  themeColor: '#101828',
};

const brand = {
  primary: '#06AED4',
  primaryHover: '#22CCEE',
  primaryActive: '#22CCEE',
  primaryText: '#aaa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#22CCEE',
          borderRadius: 4,
          colorText: brand.primaryText,
          colorTextDisabled: '#333',
        },
        components: {
          Button: {
            defaultColor: '#8c8c8c',
          },
          Dropdown: {
            colorBgElevated: '#1E1E1E',
            controlItemBgHover: '#333',
            colorTextDisabled: '#8c8c8c',
            colorTextDescription: '#8c8c8c',
            colorText: '#fff',
          },
          Spin: {
            dotSize: 32,
          },
          Radio: {
            buttonBg: '#1E1E1E',
            colorBorder: '#1E1E1E',
            buttonCheckedBg: '#1E1E1E',
          },
          Input: {
            colorBgBase: '#1E1E1E',
            activeBg: '#1E1E1E',
            colorBgContainer: '#1E1E1E',
            colorBorder: '#22CCEE',
            colorTextPlaceholder: '#8c8c8c',
            paddingBlockLG: 8,
            colorBorderSecondary: '#1E1E1E',
            colorText: '#ffffff',
          },
          InputNumber: {
            colorBgBase: '#1E1E1E',
            activeBg: '#1E1E1E',
            colorBgContainer: '#1E1E1E',
            colorBorder: '#22CCEE',
            colorTextPlaceholder: '#8c8c8c',
            paddingBlockLG: 8,
            colorText: '#ffffff',
            handleBg: '#22CCEE',
            handleWidth: 32,
            handleVisible: true,
            handleHoverColor: '#fff',
          },
          Timeline: {
            dotBg: 'transparent',
            tailColor: '#22CCEE',
          },
          DatePicker: {
            colorBgContainer: '#1E1E1E',
            colorTextPlaceholder: '#8c8c8c',
            colorText: '#ffffff',
            colorBorder: '#1E1E1E',
            colorBgBase: '#1E1E1E',
            colorIcon: '#ffffff',
            colorBgElevated: '#1E1E1E',
            cellActiveWithRangeBg: '#22CCEE',
            cellHoverBg: '#333',
            cellBgDisabled: '#1E1E1E',
            colorTextDisabled: '#8c8c8c',
          },
          Slider: {
            railHoverBg: '#888',
          },
          Select: {
            selectorBg: '#1E1E1E',
            activeBorderColor: '#22CCEE',
            activeOutlineColor: '#1E1E1E',
            colorTextPlaceholder: '#ffffff',
            colorText: '#ffffff',
            colorIcon: '#ffffff',
            colorIconHover: '#ffffff',
            hoverBorderColor: '#22CCEE',
            optionSelectedBg: '#22CCEE',
            optionSelectedColor: '#fff',
            optionActiveBg: '#333',
            colorBgBase: '#1E1E1E',
            multipleItemBg: '#1E1E1E',
            colorBgLayout: '#1E1E1E',
            colorBgElevated: '#1E1E1E',
            colorBorder: '#22CCEE',
          },
          Popover: {
            colorBgElevated: '#1E1E1E',
          },
          Modal: {
            contentBg: '#1E1E1E',
            headerBg: '#1E1E1E',
            footerBg: '#1E1E1E',
            titleColor: '#ffffff',
          },
          Avatar: {
            groupBorderColor: '#22CCEE',
          },
          List: {
            itemPadding: '4px 0',
            metaMarginBottom: '4px',
            colorSplit: '#8c8c8c',
          },
          Card: {
            colorBgContainer: '#1E1E1E',
            colorBorder: '#1E1E1E',
            colorBorderBg: '#1E1E1E',
            colorBorderSecondary: '#1E1E1E',
            colorText: brand.primaryText,
          },
          Statistic: {
            colorText: brand.primaryText,
            colorTextDescription: brand.primaryText,
          },
          Table: {
            bodySortBg: '#1E1E1E',
            headerBg: '#2c2c2c',
            footerBg: '#1E1E1E',
            colorBgContainer: '#1E1E1E',
          },
          Menu: {
            itemActiveBg: '#22CCEE',
            itemBg: '#1E1E1E',
            itemSelectedBg: '#22CCEE',
            itemSelectedColor: '#fff',
          },
          Collapse: {
            contentPadding: 4,
            headerPadding: 4,
          },
          Badge: {
            colorBorderBg: 'transparent',
          },
          Empty: {
            colorTextDescription: '#22CCEE',
          },
          Checkbox: {
            colorBgContainer: '#1E1E1E',
            colorBorder: '#333',
            colorTextDisabled: '#888',
          },
          Tree: {
            colorBgContainer: '#1e1e1e',
            colorBorder: '#878787',
            colorBorderBg: '#1E1E1E',
            nodeSelectedBg: '#1E1E1E',
          },
        },
      }}
    >
      <html lang="en">
        <body>
          <I18nProvider initialLocale="en">{children}</I18nProvider>
        </body>
      </html>
    </ConfigProvider>
  );
}
