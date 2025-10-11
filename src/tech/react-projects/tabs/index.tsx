import { Item, TabItem, Tabs, TabsList } from "./tabs"

export const TabComponentV1 = () => {
  return (
    <Tabs>
    <TabsList>
      <TabItem><button>1</button></TabItem>
      <TabItem><button>2</button></TabItem>
      <TabItem><button>3</button></TabItem>
    </TabsList>
    <Item>
      Content in 1
    </Item>
    <Item>
      Content in 2
    </Item>
    <Item>
      Content in 3
    </Item>
  </Tabs>
  )
}