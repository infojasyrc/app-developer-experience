import { ForwardedRef, forwardRef, PropsWithoutRef, ReactElement, RefObject } from "react"
import { FlatList, FlatListProps } from "react-native"
import { isRTL } from "@/i18n"
import { FlashList, FlashListProps, FlashListRef } from "@shopify/flash-list"

export type ListViewRef<T> = FlashListRef<T> | FlatList<T>

export type ListViewProps<T> = PropsWithoutRef<FlashListProps<T>>

const ListViewInner = forwardRef(function ListViewInner<T>(
  props: ListViewProps<T>,
  ref: ForwardedRef<ListViewRef<T>>,
) {
  if (isRTL) {
    return <FlatList {...(props as FlatListProps<T>)} ref={ref as ForwardedRef<FlatList<T>>} />
  }

  return <FlashList {...props} ref={ref as ForwardedRef<FlashListRef<T>>} />
})

ListViewInner.displayName = "ListView"

export const ListView = ListViewInner as <T>(
  props: ListViewProps<T> & {
    ref?: RefObject<ListViewRef<T> | null>
  },
) => ReactElement
