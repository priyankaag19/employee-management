// components/Avatar.jsx
export default function Avatar({ name = "", src }) {
  if (src) return <img src={src} alt="avatar" className="avatar" />;
  const initials = name.split(" ").map(n => n[0]).join("");
  return <div className="avatar-initials">{initials}</div>;
}
