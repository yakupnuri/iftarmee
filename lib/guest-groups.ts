export const GUEST_GROUPS = [
  {
    name: "Muaz Ailesi",
    count: 5,
    isDelivery: false,
    color: "bg-violet-100 border-violet-300 text-violet-800 hover:ring-violet-400"
  },
  {
    name: "Erhan Ailesi",
    count: 6,
    isDelivery: false,
    color: "bg-amber-100 border-amber-300 text-amber-800 hover:ring-amber-400"
  },
  {
    name: "Erkek Öğrenci Evi",
    count: 8,
    isDelivery: false,
    color: "bg-blue-100 border-blue-300 text-blue-800 hover:ring-blue-400"
  },
  {
    name: "Yalnız Muhacir Erkek Arkadaşlar",
    count: 5,
    isDelivery: false,
    color: "bg-orange-100 border-orange-300 text-orange-800 hover:ring-orange-400"
  },
  {
    name: "Kız Öğrenci Evi",
    count: 6,
    isDelivery: true,
    deliveryMessage: "Kız öğrencilerin evine yemek gidecek, iftar gidecek.",
    color: "bg-pink-100 border-pink-300 text-pink-800 hover:ring-pink-400"
  },
] as const;

export type GuestGroup = (typeof GUEST_GROUPS)[number];
export type GuestGroupName = GuestGroup["name"];

export function getGuestGroupByName(name: string) {
  return GUEST_GROUPS.find((group) => group.name === name);
}
