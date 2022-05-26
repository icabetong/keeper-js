import { useState } from "react";
import { IssuedReport, IssuedReportItem } from "./IssuedReport";
import { useTranslation } from "react-i18next";
import {
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import { issuedCollection, issuedReportId } from "../../shared/const";
import IssuedReportItemPickerList from "./IssuedReportItemPickerList";
import { usePermissions } from "../auth/AuthProvider";
import { IssuedReportEmptyState } from "./IssuedReportEmptyState";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { InstantSearch } from "react-instantsearch-dom";
import Client from "../search/Client";
import { DialogSearchTitle } from "../../components/dialog/DialogSearchTitle";
import IssuedReportItemSearchList from "./IssuedReportItemSearchList";
import { usePagination } from "use-pagination-firestore";
import { PaginationController } from "../../components/data/PaginationController";

type IssuedReportPickerProps = {
  isOpen: boolean,
  onItemSelected: (item: IssuedReportItem[]) => void,
  onDismiss: () => void,
}

const IssuedReportItemPicker = (props: IssuedReportPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { canRead } = usePermissions();
  const [searchMode, setSearchMode] = useState(false);

  const onItemSelected = (item: IssuedReportItem[]) => {
    props.onItemSelected(item);
    props.onDismiss();
  }

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<IssuedReport>(
    query(collection(firestore, issuedCollection), orderBy(issuedReportId, "asc")), { limit: 25 }
  )

  return (
    <InstantSearch searchClient={Client} indexName="issued">
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
          {t("dialog.select_issued_report")}
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
            ? <IssuedReportItemSearchList onItemSelect={onItemSelected}/>
            : !isLoading
                ? items.length > 0
                  ? <IssuedReportItemPickerList
                      reports={items}
                      limit={25}
                      onItemSelect={onItemSelected}/>
                  : <IssuedReportEmptyState/>
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
    </InstantSearch>
  )
}

export default IssuedReportItemPicker;