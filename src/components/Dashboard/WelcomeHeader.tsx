import { useEffect, useState } from "react";
import { fetchUserById } from "../../api/authApi";

export default function WelcomeHeader() {
  const [name, setName] = useState("there");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserById(Number(userId)).then((user) => {
        setName(user.firstName || "there");
      }).catch(() => setName("there"));
    }
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mb-3">
      <h1 className="text-white text-2xl font-bold tracking-tight">
        {greeting}, {name}
      </h1>
    </div>
  );
}