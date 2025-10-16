import type { TReactBaseProps } from '@/types/react';
import React, { useId, useRef, useState, type KeyboardEvent } from 'react';
import { RootContext, TabContext, useRootContext, useTabContext } from './context';

export const Root = (props: TTabsProps) => {
  const { children } = props;
  const [index, setIndex] = useState(0);
  const id = useId();

  const childrenArray = React.Children.toArray(children);
  const [tabsList, ...panels] = childrenArray;

  return (
    <RootContext
      value={{
        onClick: setIndex,
        index,
        id,
        panelData: {
          role: 'tabpanel',
          id: `${id}-${index}`,
          'aria-labelledby': `${id}-${index}`,
        },
      }}
    >
      <div className="w-full space-y-4 border-1 p-4">
        {tabsList}
        {panels[index]}
      </div>
    </RootContext>
  );
};

export const List = (props: TTriggersProps) => {
  const { children } = props;
  const { onClick, index: activeIndex, id: tabsId } = useRootContext();

  const numOfTabs = React.Children.count(children);
  const ref = useRef<HTMLDivElement | null>(null);

  const onSelect = (index: number) => {
    if (!ref.current) {
      throw new Error('ref does not exist');
    }

    const selectedTab = ref?.current?.querySelector(`[id=${tabsId}-${index}]`) as HTMLDivElement;
    selectedTab.focus();
    onClick(index);
  };

  const onKeyDown = (evt: KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === 'ArrowRight') {
      onSelect(activeIndex === numOfTabs - 1 ? activeIndex : activeIndex + 1);
    }

    if (evt.key === 'ArrowLeft') {
      onSelect(activeIndex === 0 ? activeIndex : activeIndex - 1);
    }
  };

  return (
    <div role="tablist" className="flex gap-1" ref={ref}>
      {React.Children.map(children, (child, index) => {
        const isActive = activeIndex === index;
        return (
          <TabContext
            value={{
              key: `${tabsId}-${index}`,
              id: `${tabsId}-${index}`,
              role: 'tab',
              'aria-setsize': React.Children.count(children),
              'aria-posinset': index + 1,
              'aria-selected': isActive,
              'aria-controls': `${tabsId}-${index}-tab`,
              // managing focussability
              tabIndex: isActive ? 0 : -1,
              onClick: () => onSelect(index),
              onKeyDown: (evt: KeyboardEvent<HTMLDivElement>) => onKeyDown(evt),
              isActive,
            }}
          >
            {child}
          </TabContext>
        );
      })}
    </div>
  );
};

export const Trigger = (props: TReactBaseProps) => {
  const { children } = props;
  const { isActive, ...rest } = useTabContext();

  return (
    <div
      {...rest}
      className={`box-border w-[100px] h-[50px] flex justify-center items-center cursor-pointer ${isActive ? 'border-b-4' : 'pb-1'}`}
    >
      {children}
    </div>
  );
};

export const Panel = (props: TReactBaseProps) => {
  const { children } = props;

  const { panelData } = useRootContext();

  return <div {...panelData}>{children}</div>;
};

type TTabsProps = TReactBaseProps;

type TTriggersProps = TReactBaseProps;

export const Tabs = {
  Root,
  Trigger,
  List,
  Panel,
};
