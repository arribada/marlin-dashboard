import L from "leaflet";
import { Ship, Anchor, AlertCircle, TriangleAlert } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

export function makeArrowIcon(course: number): L.DivIcon {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="14" viewBox="0 0 10 14"
      style="transform:rotate(${course}deg);transform-origin:center;display:block;">
      <polygon points="5,0 0,14 5,10 10,14" fill="#334155" opacity="0.65"/>
    </svg>`,
    className: "",
    iconSize: [10, 14],
    iconAnchor: [5, 7],
  });
}

export function makeStartIcon(): L.DivIcon {
  const svg = renderToStaticMarkup(<Ship fill="white"/>);
  return L.divIcon({
    html: `<div>${svg}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function makeEndIcon(): L.DivIcon {
  const svg = renderToStaticMarkup(<Anchor />);
  return L.divIcon({
    html: `<div>${svg}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function makeAlertIcon(type: string): L.DivIcon {
  const isBycatch = type === 'bycatch';

  const svg = renderToStaticMarkup(
    isBycatch ? (
      <AlertCircle className="text-destructive" fill="white" />
    ) : (
      <TriangleAlert color="var(--amber)" fill="white" strokeWidth={2} />
    )
  );

  return L.divIcon({
    html: `<div>${svg}</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}
