import { Product, Category, Conversation, Message } from "./types";

export const categories: Category[] = [
  { id: "old-money", label: "Old Money" },
  { id: "vintage-tv", label: "Vintage TV" },
  { id: "denim", label: "Denim" },
  { id: "vinyl", label: "Vinyl Records" },
  { id: "furniture", label: "Furniture" },
  { id: "cameras", label: "Cameras" },
  { id: "watches", label: "Watches" },
];

export const products: Product[] = [
  { id: "1", title: "Tweed Blazer, Tailored Fit", price: 3200, category: "Old Money", condition: "Like New", location: "Mumbai" },
  { id: "2", title: "Sony Trinitron CRT TV", price: 5500, category: "Vintage TV", condition: "Good", location: "Delhi" },
  { id: "3", title: "1970s Leather Armchair", price: 8900, category: "Furniture", condition: "Fair", location: "Bengaluru" },
  { id: "4", title: "Pearl Button-Down Shirt", price: 1400, category: "Old Money", condition: "Like New", location: "Pune" },
  { id: "5", title: "Panasonic Portable TV", price: 2600, category: "Vintage TV", condition: "Good", location: "Kolkata" },
  { id: "6", title: "Levi's 501 Raw Denim", price: 1900, category: "Denim", location: "Chennai", condition: "Good" },
  { id: "7", title: "Pentax K1000 Film Camera", price: 6700, category: "Cameras", condition: "Good", location: "Hyderabad" },
  { id: "8", title: "Seiko 5 Automatic Watch", price: 4200, category: "Watches", condition: "Like New", location: "Mumbai" },
];

export const conversations: Conversation[] = [
  { id: "c1", name: "Ananya R.", lastMessage: "Is the blazer still available?", timestamp: "9:41 AM", unread: 2, productTitle: "Tweed Blazer, Tailored Fit" },
  { id: "c2", name: "Rahul K.", lastMessage: "Can you do ₹5,000 for the TV?", timestamp: "Yesterday", productTitle: "Sony Trinitron CRT TV" },
  { id: "c3", name: "Meera S.", lastMessage: "Great, see you at 6!", timestamp: "Mon", productTitle: "1970s Leather Armchair" },
];

export const messagesByConversation: Record<string, Message[]> = {
  c1: [
    { id: "m1", fromMe: false, text: "Hey! Is the tweed blazer still available?", timestamp: "9:32 AM" },
    { id: "m2", fromMe: true, text: "Yes, it is! Size 40, barely worn.", timestamp: "9:35 AM" },
    { id: "m3", fromMe: false, text: "Perfect. Is the price negotiable?", timestamp: "9:41 AM" },
  ],
  c2: [
    { id: "m1", fromMe: false, text: "Can you do ₹5,000 for the TV?", timestamp: "Yesterday" },
  ],
  c3: [
    { id: "m1", fromMe: false, text: "Great, see you at 6!", timestamp: "Mon" },
  ],
};