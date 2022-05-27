import { ListItemButton, ListItemText } from "@mui/material";
import { IssuedReportItem } from "./IssuedReport";

type IssuedReportItemListProps = {
  items?: IssuedReportItem[],
  onItemSelected: (item: IssuedReportItem) => void,
}

const IssuedReportItemList = (props: IssuedReportItemListProps) => {
  return (
    <>
      {
        props.items && props.items.map((item: IssuedReportItem) => {
          return (
            <IssuedReportItemListItem
              item={item}
              onItemSelected={props.onItemSelected}/>
          )
        })
      }
    </>
  )
}

type IssuedReportItemListItemProps = {
  item: IssuedReportItem,
  onItemSelected: (item: IssuedReportItem) => void,
}

const IssuedReportItemListItem = (props: IssuedReportItemListItemProps) => {
  const onHandleItemClick = () => props.onItemSelected(props.item)

  return (
    <ListItemButton
      key={props.item.stockNumber}
      onClick={onHandleItemClick}>
      <ListItemText
        primary={props.item.description}
        secondary={props.item.stockNumber}/>
    </ListItemButton>
  )
}

export default IssuedReportItemList;