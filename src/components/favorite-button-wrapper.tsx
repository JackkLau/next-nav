"use client";
import FavoriteButton from "./favorite-button";
import { NavigationItem } from "@/data/navigation";

export default function FavoriteButtonWrapper(props: { item: NavigationItem }) {
  return <FavoriteButton id={props.item.id} />;
} 