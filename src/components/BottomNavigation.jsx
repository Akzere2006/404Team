import React from "react";
import {
  Home,
  Map,
  Compass,
  Users,
  MessageCircle,
  User,
} from "lucide-react";

function BottomNavigation({ activeTab, setActiveTab }) {
  const items = [
    {
      id: "home",
      icon: Home,
      label: "Главная",
    },
    {
      id: "places",
      icon: Map,
      label: "Места",
    },
    {
      id: "trip",
      icon: Compass,
      label: "Поездка",
    },
    {
      id: "groups",
      icon: Users,
      label: "Группы",
    },
    {
      id: "chats",
      icon: MessageCircle,
      label: "Чаты",
    },
    {
      id: "profile",
      icon: User,
      label: "Профиль",
    },
  ];

  return (
    <nav className="bottom-navigation">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            className={`nav-item ${
              activeTab === item.id ? "active" : ""
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">
              <Icon
                size={21}
                strokeWidth={2}
              />
            </span>

            <span className="nav-label">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;