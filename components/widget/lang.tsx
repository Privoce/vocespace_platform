import { langOptions, useI18n } from "@/lib/i18n/i18n";
import { Select } from "antd";
import { Languages } from "lucide-react";

export function LangSelect({ style }: { style?: React.CSSProperties }) {
  const { locale, changeLocale } = useI18n();
  return (
    <Select
      size="large"
      style={style}
      prefix={<Languages></Languages>}
      value={locale}
      options={langOptions}
      onChange={(value) => {
        changeLocale(value);
      }}
    ></Select>
  );
}
