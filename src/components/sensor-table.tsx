import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowUpDown, ArrowUp, ArrowDown, Download, Database, Clock,
  ChevronLeft, ChevronRight, Search, Eye, Shield,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { type Threshold, type EvalResult, evaluate } from '@/data/thresholds';

type Row = Record<string, number>;

interface Props {
  data: Row[];
  selectedTimestamp: number | null;
  onRowSelect: (row: Row) => void;
  thresholds?: Threshold[];
}

type SortDir = 'asc' | 'desc';

interface Column {
  key: string;
  label: string;
  format: (v: number) => string;
  color: string;
}

const snakeCase = (s: string) =>
  s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');

const PAGE_SIZES = [20, 50, 100];

function deriveColumns(data: Row[]): Column[] {
  if (data.length === 0) return [];
  const sample = data[0];
  const colors = ['#64748b', '#06b6d4', '#f97316', '#eab308', '#22c55e', '#8b5cf6', '#3b82f6', '#ef4444', '#a855f7', '#f59e0b', '#22d3ee', '#fb923c', '#78716c', '#84cc16', '#ec4899'];
  return Object.keys(sample).map((key, i) => ({
    key,
    label: key === 'timestamp' ? 'timestamp' : snakeCase(key),
    format: key === 'timestamp'
      ? (v: number) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(2)),
    color: colors[i % colors.length],
  }));
}

const evalStyles: Record<EvalResult, { bg: string; text: string }> = {
  normal: { bg: 'bg-emerald-500/20', text: 'text-foreground' },
  warning: { bg: 'bg-amber-400/30', text: 'text-foreground font-semibold' },
  critical: { bg: 'bg-red-500/35', text: 'text-foreground font-bold' },
};

export function SensorTable({ data, selectedTimestamp, onRowSelect, thresholds = [] }: Props) {
  const columns = useMemo(() => deriveColumns(data), [data]);
  const [sortField, setSortField] = useState('timestamp');
  const [evalMode, setEvalMode] = useState(true);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);
  const [filterCol, setFilterCol] = useState('all');

  const thresholdMap = useMemo(() => {
    const m = new Map<string, Threshold>();
    thresholds.forEach((t) => m.set(t.key, t));
    return m;
  }, [thresholds]);

  const getCellEval = (key: string, value: number): EvalResult => {
    if (!evalMode || key === 'timestamp') return 'normal';
    const t = thresholdMap.get(key);
    if (!t) return 'normal';
    return evaluate(value, t);
  };

  const visibleColumns = useMemo(() => {
    if (filterCol === 'all') return columns;
    return columns.filter((c) => c.key === 'timestamp' || c.key === filterCol);
  }, [filterCol, columns]);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => sortDir === 'asc' ? Number(a[sortField]) - Number(b[sortField]) : Number(b[sortField]) - Number(a[sortField]));
    return copy;
  }, [data, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const handleExport = () => {
    const header = columns.map((c) => c.label).join(',');
    const rows = sorted.map((row) => columns.map((c) => c.format(row[c.key])).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor_data_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const count = data.length;
    const latest = data[data.length - 1];
    return {
      count,
      latestTs: new Date(latest.timestamp).toLocaleTimeString(),
      fields: columns.length,
    };
  }, [data, columns]);

  const sortLabel = columns.find((c) => c.key === sortField)?.label ?? sortField;
  const filterLabel = filterCol === 'all' ? '*' : `timestamp, ${columns.find((c) => c.key === filterCol)?.label ?? filterCol}`;

  return (
    <div className="space-y-3">
      {/* Query bar */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-muted-foreground font-mono">clickhouse-client</span>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">connected</Badge>
          </div>
          <div className="bg-background/80 rounded-md p-3 font-mono text-sm border border-border/50">
            <span className="text-emerald-400">SELECT</span>{' '}
            <span className="text-cyan-300">{filterLabel}</span>{' '}
            <span className="text-emerald-400">FROM</span>{' '}
            <span className="text-amber-300">equipment_sensors</span>{' '}
            <span className="text-emerald-400">ORDER BY</span>{' '}
            <span className="text-cyan-300">{sortLabel}</span>{' '}
            <span className="text-rose-400">{sortDir.toUpperCase()}</span>{' '}
            <span className="text-emerald-400">LIMIT</span>{' '}
            <span className="text-amber-300">{pageSize}</span>{' '}
            <span className="text-emerald-400">OFFSET</span>{' '}
            <span className="text-amber-300">{page * pageSize}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Rows', value: stats.count, icon: Database },
            { label: 'Latest', value: stats.latestTs, icon: Clock },
            { label: 'Fields', value: stats.fields, icon: Search },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2">
              <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-semibold font-mono">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Select value={filterCol} onValueChange={(v) => v && setFilterCol(v)}>
            <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue placeholder="Filter columns" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All columns</SelectItem>
              {columns.filter((c) => c.key !== 'timestamp').map((c) => (
                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(pageSize)} onValueChange={(v) => { if (v) { setPageSize(Number(v)); setPage(0); } }}>
            <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s} rows</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border border-border/50 rounded-md px-2 h-8">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Evaluate</span>
            <Switch checked={evalMode} onCheckedChange={setEvalMode} className="scale-75" />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-xs">
            <Download className="h-3 w-3 mr-1" /> Export CSV
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-2 font-mono">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[10px] text-muted-foreground font-mono w-8 px-2">#</TableHead>
                {visibleColumns.map((col) => (
                  <TableHead key={col.key} className="text-[10px] font-mono cursor-pointer hover:text-foreground transition-colors px-2" onClick={() => handleSort(col.key)}>
                    <div className="flex items-center gap-1">
                      <span style={{ color: col.color }}>{col.label}</span>
                      {sortField === col.key ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row, idx) => {
                const isSelected = row.timestamp === selectedTimestamp;
                return (
                  <TableRow key={`${row.timestamp}-${idx}`}
                    className={`border-border/30 font-mono text-xs cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/10 hover:bg-amber-500/15 border-l-2 border-l-amber-400' : 'hover:bg-muted/20'}`}
                    onClick={() => onRowSelect(row)}>
                    <TableCell className="text-[10px] text-muted-foreground/50 px-2 py-1.5">
                      <span className="flex items-center gap-1">
                        {isSelected && <Eye className="h-3 w-3 text-amber-400" />}
                        {page * pageSize + idx + 1}
                      </span>
                    </TableCell>
                    {visibleColumns.map((col) => {
                      const val = row[col.key];
                      const ev = getCellEval(col.key, val);
                      const showEval = evalMode && col.key !== 'timestamp' && thresholdMap.has(col.key);
                      const st = showEval ? evalStyles[ev] : { bg: '', text: '' };
                      return (
                        <TableCell
                          key={col.key}
                          className={`px-2 py-1.5 tabular-nums ${st.bg} ${st.text}`}
                          style={!showEval || ev === 'normal' ? { color: col.color } : undefined}
                        >
                          {col.format(val)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-1">
        <span>{sorted.length} rows in set. Elapsed: {(Math.random() * 0.05 + 0.001).toFixed(4)} sec.</span>
        <span>Displayed {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}</span>
      </div>
    </div>
  );
}
