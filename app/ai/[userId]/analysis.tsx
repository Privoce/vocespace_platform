import { DatePicker, DatePickerProps } from "antd";

export function AIAnalysis() {
  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
  };

  return (
    <div>
      <DatePicker onChange={onChange} />
    </div>
  );
}
