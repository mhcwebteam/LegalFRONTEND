
const ApplyDateInput = ({ value, onChange, className }) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <input
      type="date"
         name="applyDate"
      value={value}
      onChange={onChange}
      className={className}
      max={today}    // 🔥 prevents selecting any future date
    />
  );
};

export default ApplyDateInput;
