/** Shared table styling for attendance day detail sections */
export const attendanceTableHeadSx = {
  bgcolor: '#f0f7ff',
  '& .MuiTableCell-root': {
    color: 'text.secondary',
    fontWeight: 600,
    fontSize: '0.75rem',
    whiteSpace: { xs: 'normal', md: 'nowrap' },
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
};

export const attendanceTableBodySx = {
  '& .MuiTableCell-root': {
    fontSize: '0.875rem',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
};
