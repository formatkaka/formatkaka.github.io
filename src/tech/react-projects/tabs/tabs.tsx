import type { TReactBaseProps } from "@/types/react"
import React, { useId, useLayoutEffect, useState } from "react";
import { RootContext, useRootContext } from "./context";

export const Tabs = (props: TTabsProps) => {
  const { children } = props;
  const [index, setIndex] = useState(0);
  const id = useId();

  return (
    <RootContext value={{onClick: setIndex, index, id}}>
      {children}
    </RootContext>
  )

}

export const TabsList = (props: TTriggersProps) => {
  const { children } = props;
  const { onClick } = useRootContext()

  return React.Children.map(children, (child, index) => {
    return (
      <div
        role="tab"
        onClick={() => {
          onClick(index)
        }}
      >
        {child}
      </div>
    )
  })
}

export const TabItem = (props: TReactBaseProps) => {
  const { children } = props;
  return <>{children}</>
}

export const Item = (props: TReactBaseProps) => {
  const { children } = props;
  const { index, id } = useRootContext();
  

  const className = `tab-item-${id}`;

  useLayoutEffect(() => {
    const items = document.querySelectorAll(`.${className}`);
    items.forEach((item, arrIndex) => {
      if(arrIndex === index) {
        item.classList.remove("hidden")
        item.classList.add("block");
      }else {
        item.classList.add("hidden");
        item.classList.remove("block")
      }
    })
  }, [index])

  return <div className={className}>{children}</div>
}

type TTabsProps = TReactBaseProps

type TTriggersProps = TReactBaseProps;
/**
 * Tabs -> 
 * 
 *    <Tabs>
 *        <Tabs.Trigger>
 *            <button>1</button>
 *            <button>2</button>
 *            <button>3</button>
 *        </Tabs.Trigger>
 * 
 *        <Tabs.Item>
 *            1
 *        </Tabs.Item>
 * 
 *        <Tabs.Item>
 *            2
 *        </Tabs.Item> 
 *    <Tabs>
 * 
 */