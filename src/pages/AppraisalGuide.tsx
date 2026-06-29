import { useState } from "react";
import AppraisalHeader from "../components/Appraisal/AppraisalHeader";
import WhatWentWell from "../components/Appraisal/WhatWentWell";
import WhatToImprove from "../components/Appraisal/WhatToImprove";
import KeyAchievements from "../components/Appraisal/KeyAchievements";
import SelfRating from "../components/Appraisal/SelfRating";
import SelfAssessmentForm from "../components/Appraisal/SelfAssessmentForm";

export default function AppraisalGuide() {
  const [activeTab, setActiveTab] = useState("Appraisal Guide");

  return (
    <div className="w-full">
      <AppraisalHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "Appraisal Guide" ? (
        <>
          <WhatWentWell />
          <WhatToImprove />
          <KeyAchievements />
          <SelfRating />
        </>
      ) : (
        <SelfAssessmentForm />
      )}
    </div>
  );
}