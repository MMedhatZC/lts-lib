/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import React, { useMemo, useState, useRef } from "react";
import {GridColDef, GridRowId, GridToolbarContainer, GridToolbarExport, GridToolbarDensitySelector} from "@mui/x-data-grid";
import { GridDensity, GridToolbarColumnsButton, GridValueGetterParams, GridRowParams,  DataGrid } from "@mui/x-data-grid";
import { GridCallbackDetails, GridCellParams, GridEditCellProps } from "@mui/x-data-grid";
import { GridApi, GridEditCellValueParams, GridSortModel, GridRowSelectionModel} from "@mui/x-data-grid";
import { Badge, Box, Button, TextField, Typography, Grid, Container, useMediaQuery } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";


const styles = {
  animated: { transition: "all 0.5s ease-out", display: "flex", gap: "1rem", marginBottom: "0.5rem"},
  hidden: {display: "none"},
  shown: {height: "auto",display: "flex"},
};  

interface customTableProps {
  columns: GridColDef[];
  rows: any[];
  autoHeight?: boolean;
	checkboxSelection?: boolean;
  disableExport?: boolean;
  density?: GridDensity | undefined;
  tableHeader?: string;
  getRowId?: ((params: GridRowParams<any>) => GridRowId) | undefined;
  isRowSelectable?: ((params: GridRowParams<any>) => boolean) | undefined;
  columnVisibilityModel?: { [id: string]: boolean };
  onSelectionModelChange?: (newSelectionModel: GridRowId[]) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  showMoreActions?: boolean;
  selectionModel?: GridRowSelectionModel;
  hiddenFields?: string[];
  ActionBarComponent?: React.ComponentType<any> | undefined;
  // hideFooter?: boolean;
  // disableColumnReorder?: boolean;
  // disableColumnResize?: boolean;
  // disableColumnFilter?: boolean;
  // disableMultipleColumnsFiltering?: boolean;
  // disableMultipleSelection?: boolean;
  // hideFooterPagination?: boolean;
  // hideFooterRowCount?: boolean;
  // hideFooterSelectedRowCount?: boolean;
  // pageSize?: number;
  // // onPageChange?: (params: GridPageChangeParams) => void;
  // onSelectionChange?: (selectionModel: GridRowSelectionModel) => void;
  // onSortModelChange?: (model: GridSortModel) => void;

	// onStateChange?: (state: any) => void;
  // onCellClick?: (
  //   params: GridCellParams,
  //   event: React.MouseEvent<HTMLDivElement, MouseEvent>
  // ) => void;
  // onCellDoubleClick?: (
  //   params: GridCellParams,
  //   event: React.MouseEvent<HTMLDivElement, MouseEvent>
  // ) => void;
  // onCellFocus?: (params: GridCellParams) => void;
  // onCellBlur?: (params: GridCellParams) => void;
  // onColumnResize?: (params: GridCallbackDetails) => void;
  // onColumnOrderChange?: (params: GridCallbackDetails) => void;
  // onRowClick?: (
  //   params: GridRowParams,
  //   event: React.MouseEvent<HTMLDivElement, MouseEvent>
  // ) => void;
  // onRowDoubleClick?: (
  //   params: GridRowParams,
  //   event: React.MouseEvent<HTMLDivElement, MouseEvent>
  // ) => void;
  // onRowSelected?: (
  //   params: GridRowParams,
  //   event: React.MouseEvent<HTMLDivElement, MouseEvent>
  // ) => void;
  // onRowsScrollEnd?: (params: any) => void;
  // onEditCellPropsChange?: (
  //   params: GridEditCellProps,
  //   event: React.SyntheticEvent
  // ) => void;
  // onEditCellValueChange?: (
  //   params: GridEditCellValueParams,
  //   event: React.SyntheticEvent
  // ) => void;
}

function CustomTable(props: customTableProps) {
  const isSmallScreen = useMediaQuery('(max-width: 425px)');

  let {
    columns,
    rows,
    autoHeight = true,
		checkboxSelection = true,
    disableExport,
    density = "compact",
    tableHeader,
    getRowId = (params: GridRowParams) => params.id,
    isRowSelectable,
    columnVisibilityModel,
    onSelectionModelChange,
    pageSize,
    onPageSizeChange,
    selectionModel = [],
    showMoreActions,
    hiddenFields= [],
    ActionBarComponent,
    // hideFooter,
    // disableColumnReorder = false,
    // disableColumnResize = false,
    // disableColumnFilter = false,
    // disableMultipleColumnsFiltering = false,
    // disableMultipleSelection = false,
    // hideFooterPagination = false,
    // hideFooterRowCount = false,
    // hideFooterSelectedRowCount = false,
    // pageSize,
    // onPageChange,
    // onSelectionChange,
    // onSortModelChange,
    // onFilterModelChange,
    // onStateChange,
    // onCellClick,
    // onCellDoubleClick,
    // onCellFocus,
    // onCellBlur,
    // onColumnResize,
    // onColumnOrderChange,
    // onRowClick,
    // onRowDoubleClick,
    // onRowSelected,
    // onRowsScrollEnd,
    // onEditCellPropsChange,
    // onEditCellValueChange,
  } = props;
  
  interface RowsProp {
    id: number;
  }
  
  function addIdToObjects(objects: Omit<RowsProp, 'id'>[]): RowsProp[] {
    let count = 0;
  
    return objects.map((obj) => {
      const newObj: RowsProp = {
        ...obj,
        id: count,
      };
      count++;
      return newObj;
    });
  }
  const [filterModel, setFilterModel] = useState<{ [key: string]: string }>({});
  const [isShown, setIsShown] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const resetFilters = () => {
    setFilterModel({});
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const toggleDiv = () => {
    setIsShown(!isShown);
  };
  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    column: string,
  ) => {
    const value = event.target.value.trim().toLowerCase();
    setFilterModel((prevFilterModel) => ({
      ...prevFilterModel,
      [column]: value,
    }));
  };

  const filteredRows = useMemo(() => {
    rows=addIdToObjects(rows);
    return rows.filter((row) =>
      // Use the `every` method to check if all filters for `row` are true.
      Object.entries(filterModel).every(([column, filterValue]) => {
        const rowValue = String(row[column]).toLowerCase();
        return rowValue.includes(filterValue);
      }),
    );
  }, [rows, filterModel]);

  const updatedColumns = columns.map((column) => ({
    ...column,
    hide: hiddenFields.includes(column.field),
  }));

  const handleIsRowSelectable = (params: GridRowParams<any>) => {
    if (typeof isRowSelectable === "function") {
      return isRowSelectable(params);
    }
    return true;
  };

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ padding: "10px", fontSize: '0.25rem' }}>
    {!isSmallScreen && 
    <Grid container spacing={2}>
      {/* <Grid item xs={8}></Grid> */}
      <Grid item xs={0} md={12} lg={6}>{showMoreActions && ActionBarComponent && (<ActionBarComponent selectionData={selectionModel} />)}</Grid>
      <Grid item xs={0} md={12} lg={6} sx={{ display: 'flex', justifyContent: 'flex-end'}}>
      <Badge badgeContent={rows.length === filteredRows.length ? null : filteredRows.length} color="primary">
        <Button variant="text" color="primary" aria-label="Show filters" startIcon={<FilterListIcon />} onClick={toggleDiv}>
          Advanced Filter
        </Button>
      </Badge>
      <GridToolbarDensitySelector />
      <GridToolbarColumnsButton />
        {!disableExport && <GridToolbarExport />}
      </Grid>
      </Grid>
    }
      </GridToolbarContainer>

   
  );

  return (
    <div style={{width:'100%'}}>
      <div>
        <Typography variant="h6" color="text.primary" component='h6'>{tableHeader}</Typography>
        <form
          ref={formRef}
          noValidate
          autoComplete="off"
          style={{ ...styles.animated, ...(isShown ? styles.shown : styles.hidden), }}>
          <Grid container spacing={1} direction="row" justifyContent="space-between" alignItems="flex-end">
            {columns.map((column) => (
              !hiddenFields.includes(column.field) && (
                  <Grid item xs={12} sm={2} key={column.field}>
                  <TextField
                    size="small"
                    color="primary"
                    id="outlined-basic"
                    label={`${column.headerName}`}
                    variant="outlined"
                    type={column.type || "string"}
                    // sx={{ flex: `${column.flex}` }}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange(event, column.field)
                    }
                  />
              </Grid>
                )
              ))}
              <Grid item xs={12}  sm={2}>
              <Button variant="contained" color="primary" type="reset" onClick={resetFilters}>
                Reset
              </Button>
              </Grid>
          </Grid>
        </form>
      </div>
      <DataGrid
        sx={{ boxShadow: 2 }}
        components={{ Toolbar: CustomToolbar }}
        columns={columns}
        rows={filteredRows}
        autoHeight={autoHeight}
        getRowHeight={() => "auto"}
        checkboxSelection={checkboxSelection}
        density={density}
        getRowId={getRowId}
        isRowSelectable={handleIsRowSelectable}
        columnVisibilityModel={columnVisibilityModel}
        onRowSelectionModelChange={onSelectionModelChange}
        // pageSize={pageSize}
        // onPageSizeChange={onPageSizeChange}
        pagination={true}
      />
    </div>
  );
}

export default CustomTable;
