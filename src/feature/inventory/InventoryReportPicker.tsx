import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InventoryReport } from "./InventoryReport";
import {
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { InstantSearch } from "react-instantsearch-dom";
import { collection, orderBy, query } from "firebase/firestore";
import { usePagination } from "use-pagination-firestore";
import { firestore } from "../../index";
import { inventoryCollection, inventoryReportId } from "../../shared/const";
import { usePermissions } from "../auth/AuthProvider";
import { DialogSearchTitle } from "../../components/dialog/DialogSearchTitle";
import { PaginationController } from "../../components/data/PaginationController";
import { InventoryReportEmptyState } from "./InventoryReportEmptyState";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import InventoryReportPickerList from "./InventoryReportPickerList";
import InventoryReportViewer from "./InventoryReportViewer";
import InventoryReportSearchList from "./InventoryReportSearchList";
import Client from "../search/Client";

type InventoryReportPickerProps = {
  isOpen: boolean,
  stockNumber?: string,
  onItemSelected: (report: InventoryReport) => void,
  onDismiss: () => void,
}
const InventoryReportPicker = (props: InventoryReportPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { canRead } = usePermissions();
  const [searchMode, setSearchMode] = useState(false);
  const [report, setReport] = useState<InventoryReport | null>(null);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<InventoryReport>(
    query(collection(firestore, inventoryCollection), orderBy(inventoryReportId, "asc")), { limit: 25 }
  );

  return (
    <InstantSearch searchClient={Client} indexName="inventories">
      <Dialog
        fullWidth
        fullScreen={smBreakpoint}
        maxWidth="xs"
        open={props.isOpen}
        PaperProps={{ sx: { minHeight: '60vh' }}}
        onClose={props.onDismiss}>
        <DialogSearchTitle
          hasSearchFocus={searchMode}
          onSearchFocusChanged={setSearchMode}>
          {t("dialog.select_inventory_report")}
        </DialogSearchTitle>
        <DialogContent
          dividers={true}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            paddingX: 0,
            '& .MuiList-padding': { padding: 0 }
          }}>
          { canRead
            ? searchMode
              ? <InventoryReportSearchList
                  onItemSelect={props.onItemSelected}/>
              : !isLoading
                ? items.length > 0
                  ? <InventoryReportPickerList
                      reports={items}
                      onItemSelect={props.onItemSelected}
                      onItemView={setReport}/>
                  : <InventoryReportEmptyState/>
                : <LinearProgress/>
            : <ErrorNoPermissionState/>
          }
        </DialogContent>
        <DialogActions>
          <Collapse in={!searchMode}>
            <PaginationController canBack={isStart} canForward={isEnd} onBackward={getPrev} onForward={getNext}/>
          </Collapse>
        </DialogActions>
      </Dialog>
      <InventoryReportViewer
        isOpen={Boolean(report)}
        report={report}
        onDismiss={() => setReport(null)}/>
    </InstantSearch>
  )
}

export default InventoryReportPicker;