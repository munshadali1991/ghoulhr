import { useState } from 'react';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export function IpAddressInput({ value = [], onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleAddIp = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIp();
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="e.g. 192.168.1.0/24 or 203.0.113.10"
          label="IP or CIDR"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant="contained" onClick={handleAddIp} startIcon={<AddIcon />} sx={{ flexShrink: 0 }}>
          Add
        </Button>
      </Stack>
      {value.length > 0 ? (
        <TableContainer sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={56}>#</TableCell>
                <TableCell>Allowed address</TableCell>
                <TableCell align="right" width={72}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {value.map((ip, index) => (
                <TableRow key={`${ip}-${index}`} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {ip}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onChange(value.filter((_, i) => i !== index))}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <List dense disablePadding sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <ListItem>
            <ListItemText
              primary="No allowlisted addresses yet"
              secondary="Add at least one IP or CIDR when using IP-based check-in."
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </ListItem>
        </List>
      )}
    </Stack>
  );
}
