/** Shared table styling for attendance day detail sections */
export const attendanceTableHeadSx = {
  bgcolor: (theme) => theme.palette.custom.attendance.tableHead,
  '& .MuiTableCell-root': {
    color: 'text.secondary',
    fontWeight: 600,
    typography: 'caption',
    whiteSpace: { xs: 'normal', md: 'nowrap' },
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
};

export const attendanceTableBodySx = {
  '& .MuiTableCell-root': {
    typography: 'body2',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
};
