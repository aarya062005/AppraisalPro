import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AppraisalHeaderProps {
  employee?: string;
  manager?: string;
  department?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = ["Appraisal Guide", "Sample Appraisal Form"];

export default function AppraisalHeader({
  employee = "Alex Johnson",
  manager = "Sarah Chen",
  department = "Engineering",
  activeTab = "Appraisal Guide",
  onTabChange,
}: AppraisalHeaderProps) {
  const [selected, setSelected] = useState(activeTab);
  const navigate = useNavigate();

  const handleTab = (tab: string) => {
    setSelected(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            My Appraisal 
          </h1>
          <p className="text-[#6b7280] text-sm mt-1">
            Q2 Appraisal · Closes Jul 15, 2025
          </p>
        </div>
        <button
          onClick={() => navigate("/my-appraisal")}
          className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
        >
          My Appraisals →
        </button>
      </div>

      <div className="flex gap-8 mt-5 mb-5 px-5 py-4 bg-[#1e2029] border border-white/[0.06] rounded-xl">
        <div>
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Employee</p>
          <p className="text-white text-sm font-medium">{employee}</p>
        </div>
        <div>
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Manager</p>
          <p className="text-white text-sm font-medium">{manager}</p>
        </div>
        <div>
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Department</p>
          <p className="text-white text-sm font-medium">{department}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              selected === tab
                ? "text-white border-purple-500"
                : "text-[#6b7280] border-transparent hover:text-[#9ca3af]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}