import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, TextField, InputAdornment, Chip, Button,
  TablePagination, CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PrintSignatures from '../../components/common/PrintSignatures';
import { formatDateTime } from '../../utils/dateUtils';
import { useData } from '../../context/DataContext';

export default function AuditLogsPage() {
  const { fetchAuditLogs } = useData();

  const [logsList, setLogsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      if (res && res.data) {
        setLogsList(res.data);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  }, [fetchAuditLogs, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  return (
    <Box>
      <PageHeader
        title="સિસ્ટમ ઓડિટ લૉગ્સ (Audit Trail)"
        subtitle="સોફ્ટવેરમાં થયેલ તમામ એન્ટ્રી, ફેરફાર અને લૉગિન પ્રવૃત્તિઓની સંપૂર્ણ વિગતવાર નોંધ"
        showPrint={true}
      />

      <Paper sx={{ p: 2, mb: 3 }} className="no-print">
        <TextField
          placeholder="વપરાશકર્તા, મોડ્યુલ, ક્રિયા અથવા વિગત શોધો..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell width={180}>તારીખ અને સમય</TableCell>
                <TableCell width={120}>વપરાશકર્તા</TableCell>
                <TableCell width={160}>મોડ્યુલ</TableCell>
                <TableCell width={160}>ક્રિયા (Action)</TableCell>
                <TableCell>વિગતવાર વર્ણન (Details)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : logsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    કોઈ ઓડિટ લૉગ મળ્યો નથી.
                  </TableCell>
                </TableRow>
              ) : (
                logsList.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {log.created_at ? formatDateTime(log.created_at) : (log.timestamp || '-')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {log.username}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={log.module} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="પ્રતિ પેજ લૉગ્સ:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / કુલ: ${count !== -1 ? count : 'વધુ'}`}
          className="no-print"
        />
      </Paper>

      <Box sx={{ mt: 4 }} className="print-only">
        <PrintSignatures />
      </Box>
    </Box>
  );
}
