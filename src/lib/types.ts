export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: "Like New" | "Good" | "Fair";
  location: string;
}

export interface Category {
  id: string;
  label: string;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  productTitle: string;
}

export interface Message {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: string;
}