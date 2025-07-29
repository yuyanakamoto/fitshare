// アイコンコンポーネント
const Icon = ({ name, className = "" }) => {
  const icons = {
    dumbbell:
      "M6.5 6.5L17.5 17.5M6.5 6.5L3 3M6.5 6.5L3 10M17.5 17.5L21 21M17.5 17.5L21 14M3 10V14L7 18L10 21H14L18 17L21 14V10L17 7L14 3H10L7 6L3 10Z",
    plus: "M12 5v14m-7-7h14",
    heart:
      "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    "message-circle":
      "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
    wifi: "M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
    "wifi-off":
      "M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01M5 12.55a11 11 0 0 1 14.08 0M1 1l22 22",
    trash:
      "M3 6h18m-2 0v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7m-1.5-6.5a2.12 2.12 0 0 0-3-3L7 13v3h3l8.5-8.5z",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18M6 6l12 12",
    "plus-circle":
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
    "minus-circle":
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z",
    "log-out": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9",
    camera:
      "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    "bar-chart": "M12 20V10M18 20V4M6 20v-6",
    calendar:
      "M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM8 2v4M16 2v4M3 10h18",
    trophy:
      "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M9 12l2 2 4-4",
    "chevron-down": "M6 9l6 6 6-6",
    "chevron-up": "M18 15l-6-6-6 6",
    "chevron-left": "M15 18l-6-6 6-6",
    "chevron-right": "M9 18l6-6-6-6",
    image:
      "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm12 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 8.5L6 8l4 4 2-2 3 3z",
  };

  return React.createElement(
    "svg",
    {
      className: `lucide-icon ${className}`,
      xmlns: "http://www.w3.org/2000/svg",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    React.createElement("path", { d: icons[name] || "" })
  );
};

// 個別アイコンコンポーネント
const Dumbbell = (props) => React.createElement(Icon, { name: "dumbbell", ...props });
const Plus = (props) => React.createElement(Icon, { name: "plus", ...props });
const Heart = (props) => React.createElement(Icon, { name: "heart", ...props });
const MessageCircle = (props) => React.createElement(Icon, { name: "message-circle", ...props });
const Wifi = (props) => React.createElement(Icon, { name: "wifi", ...props });
const WifiOff = (props) => React.createElement(Icon, { name: "wifi-off", ...props });
const Trash = (props) => React.createElement(Icon, { name: "trash", ...props });
const Edit = (props) => React.createElement(Icon, { name: "edit", ...props });
const Check = (props) => React.createElement(Icon, { name: "check", ...props });
const X = (props) => React.createElement(Icon, { name: "x", ...props });
const PlusCircle = (props) => React.createElement(Icon, { name: "plus-circle", ...props });
const MinusCircle = (props) => React.createElement(Icon, { name: "minus-circle", ...props });
const LogOut = (props) => React.createElement(Icon, { name: "log-out", ...props });
const Camera = (props) => React.createElement(Icon, { name: "camera", ...props });
const User = (props) => React.createElement(Icon, { name: "user", ...props });
const Home = (props) => React.createElement(Icon, { name: "home", ...props });
const BarChart = (props) => React.createElement(Icon, { name: "bar-chart", ...props });
const Calendar = (props) => React.createElement(Icon, { name: "calendar", ...props });
const Trophy = (props) => React.createElement(Icon, { name: "trophy", ...props });
const ChevronDown = (props) => React.createElement(Icon, { name: "chevron-down", ...props });
const ChevronUp = (props) => React.createElement(Icon, { name: "chevron-up", ...props });
const ChevronLeft = (props) => React.createElement(Icon, { name: "chevron-left", ...props });
const ChevronRight = (props) => React.createElement(Icon, { name: "chevron-right", ...props });
const Image = (props) => React.createElement(Icon, { name: "image", ...props });