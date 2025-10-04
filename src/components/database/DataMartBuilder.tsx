import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Boxes, Plus, FileText, LayoutGrid, Trash2, Pencil, Database, Layers, Table, Zap, Clock, Activity, Code } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

const UiBuilder = ({ onCancel, dataMartId }: { onCancel: () => void, dataMartId?: number | null }) => {
  const { toast } = useToast();
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<{ [key: string]: string[] }>({});
      const [joins, setJoins] = useState<{ leftTable: string; leftColumn: string; rightTable: string; rightColumn: string; type: string; }[]>([]);
  const [unions, setUnions] = useState<{ tables: string[] }[]>([]);
      const [dataMartName, setDataMartName] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [columnSearchTerms, setColumnSearchTerms] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch('/api/data-sources', { credentials: 'include' })
      .then(res => res.json())
      .then(setDataSources)
      .catch(err => console.error('Failed to fetch data sources:', err));

    if (dataMartId) {
      setIsEditMode(true);
      fetch(`/api/data-marts/${dataMartId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setDataMartName(data.name);
          setSelectedSource(data.data_source_id.toString());
          // Definition will be set in the schema useEffect
        });
    }
  }, [dataMartId]);

  useEffect(() => {
    if (selectedSource) {
      setIsLoadingSchema(true);
      if (!isEditMode || (isEditMode && selectedSource !== dataMartId?.toString())) {
        setSchema(null);
        setSelectedTables([]);
        setSelectedColumns({});
        setJoins([]);
      }
      fetch(`/api/data-sources/${selectedSource}/schema`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.schema) {
            setSchema(data.schema);
            if (isEditMode) {
              // Now that schema is loaded, set the rest of the definition
              fetch(`/api/data-marts/${dataMartId}`, { credentials: 'include' })
                .then(res => res.json())
                .then(dm => {
                  setSelectedTables(dm.definition.tables || []);
                  setSelectedColumns(dm.definition.columns || {});
                  setJoins(dm.definition.joins || []);
                  setUnions(dm.definition.unions || []);
                });
            }
          }
        })
        .catch(() => setSchema(null))
        .finally(() => setIsLoadingSchema(false));
    }
  }, [selectedSource]);

  const handleTableSelect = (tableName: string) => {
    setSelectedTables(prev =>
      prev.includes(tableName)
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

    const handleColumnSearchChange = (tableName: string, searchTerm: string) => {
    setColumnSearchTerms(prev => ({ ...prev, [tableName]: searchTerm }));
  };

  const handleSelectAllColumns = (tableName: string, filteredColumns: any[]) => {
    const allColumnNames = filteredColumns.map(c => c.name);
    const currentSelected = selectedColumns[tableName] || [];
    const allSelected = allColumnNames.length > 0 && allColumnNames.every(name => currentSelected.includes(name));

    setSelectedColumns(prev => {
      const newSelected = { ...prev };
      if (allSelected) {
        newSelected[tableName] = currentSelected.filter(c => !allColumnNames.includes(c));
      } else {
        newSelected[tableName] = [...new Set([...currentSelected, ...allColumnNames])];
      }
      return newSelected;
    });
  };

  const handleColumnSelect = (tableName: string, columnName: string) => {
    setSelectedColumns(prev => {
      const tableColumns = prev[tableName] || [];
      const newTableColumns = tableColumns.includes(columnName)
        ? tableColumns.filter(c => c !== columnName)
        : [...tableColumns, columnName];
      return { ...prev, [tableName]: newTableColumns };
    });
  };

  const addJoin = () => {
    setJoins(prev => [...prev, { leftTable: '', leftColumn: '', rightTable: '', rightColumn: '', type: 'INNER' }]);
  };

  const updateJoin = (index: number, field: string, value: string) => {
    const newJoins = [...joins];
    const currentJoin = { ...newJoins[index], [field]: value };
    if (field === 'leftTable') currentJoin.leftColumn = '';
    if (field === 'rightTable') currentJoin.rightColumn = '';
    newJoins[index] = currentJoin;
    setJoins(newJoins);
  };

      const removeJoin = (index: number) => {
    setJoins(prev => prev.filter((_, i) => i !== index));
  };

    const addUnion = () => {
    setUnions(prev => [...prev, { tables: [] }]);
  };

  const updateUnion = (index: number, table: string) => {
    const newUnions = [...unions];
    const currentUnion = newUnions[index];
    if (currentUnion.tables.includes(table)) {
      currentUnion.tables = currentUnion.tables.filter(t => t !== table);
    } else {
      currentUnion.tables.push(table);
    }
    setUnions(newUnions);
  };

  const removeUnion = (index: number) => {
    setUnions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDataMart = async () => {
    if (isEditMode) {
      await handleUpdateDataMart();
    } else {
      await handleCreateDataMart();
    }
  };

  const handleCreateDataMart = async () => {
    if (!dataMartName.trim()) {
      toast({ title: 'Error', description: 'Data mart name is required.', variant: 'destructive' });
      return;
    }

        const payload = {
      name: dataMartName,
      data_source_id: selectedSource,
      definition: {
        tables: selectedTables,
        columns: selectedColumns,
        joins: joins,
        unions: unions,
      },
    };

    try {
      const response = await fetch('/api/data-marts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        toast({ title: 'Success!', description: 'Data mart created successfully.' });
        onCancel();
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to create data mart.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  const handleUpdateDataMart = async () => {
    if (!dataMartName.trim()) {
      toast({ title: 'Error', description: 'Data mart name is required.', variant: 'destructive' });
      return;
    }

        const payload = {
      name: dataMartName,
      definition: {
        tables: selectedTables,
        columns: selectedColumns,
        joins: joins,
        unions: unions,
      },
    };

    try {
      const response = await fetch(`/api/data-marts/${dataMartId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        toast({ title: 'Success!', description: 'Data mart updated successfully.' });
        onCancel();
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to update data mart.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Beautiful Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-600"></div>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl text-white shadow-lg">
              <LayoutGrid className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Data Mart UI Builder
              </CardTitle>
              <p className="text-gray-600 text-sm mt-1">Build your data mart visually with our intuitive interface</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card className="border-2">
        <CardContent className="space-y-6 pt-6">
          {/* Data Mart Name */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-100">
            <label className="block text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Data Mart Name
            </label>
            <Input 
              placeholder="Enter a descriptive name for your data mart..."
              value={dataMartName}
              onChange={(e) => setDataMartName(e.target.value)}
              className="border-2 border-blue-200 focus:border-blue-400 bg-white"
            />
          </div>

          {/* Step 1: Data Source Selection */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-100">
            <label className="block text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Step 1: Select a Data Source
            </label>
            <Select onValueChange={setSelectedSource} value={selectedSource || ''}>
              <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400 bg-white">
                <SelectValue placeholder="Choose a data source..." />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map(ds => (
                  <SelectItem key={ds.id} value={ds.id.toString()}>{ds.name} ({ds.type})</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>

        {selectedSource && isLoadingSchema && <p>Loading schema...</p>}
        {schema && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">2. Select Tables and Columns</label>
            <Accordion type="multiple" className="w-full">
              {Object.keys(schema).map(tableName => (
                <AccordionItem value={tableName} key={tableName}>
                  <AccordionTrigger>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={tableName}
                        checked={selectedTables.includes(tableName)}
                        onCheckedChange={() => handleTableSelect(tableName)}
                      />
                      <label htmlFor={tableName} className="font-medium">{tableName}</label>
                    </div>
                  </AccordionTrigger>
                                    <AccordionContent className="pl-10 space-y-4">
                    <Input
                      placeholder="Search columns..."
                      value={columnSearchTerms[tableName] || ''}
                      onChange={(e) => handleColumnSearchChange(tableName, e.target.value)}
                      className="mb-2"
                    />
                    {(() => {
                      const searchTerm = (columnSearchTerms[tableName] || '').toLowerCase();
                      const tableColumns = schema[tableName]?.columns || schema[tableName] || [];
                      const filteredColumns = tableColumns.filter((c: any) => c.name.toLowerCase().includes(searchTerm));
                      const allSelected = filteredColumns.length > 0 && filteredColumns.every((c: any) => selectedColumns[tableName]?.includes(c.name));

                      return (
                        <>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`select-all-${tableName}`}
                              checked={allSelected}
                              onCheckedChange={() => handleSelectAllColumns(tableName, filteredColumns)}
                            />
                            <label htmlFor={`select-all-${tableName}`} className="text-sm font-medium">Select All</label>
                          </div>
                          <div className="space-y-2">
                            {filteredColumns.map((column: any) => (
                      <div key={column.name} className="flex items-center space-x-3">
                        <Checkbox
                          id={`${tableName}-${column.name}`}
                          checked={selectedColumns[tableName]?.includes(column.name)}
                          onCheckedChange={() => handleColumnSelect(tableName, column.name)}
                        />
                        <label htmlFor={`${tableName}-${column.name}`} className="text-sm font-medium">
                          {column.name} <span className="text-gray-400">({column.type})</span>
                        </label>
                      </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {selectedTables.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">3. Define Joins</label>
            <div className="space-y-4 p-4 border rounded-md">
              {joins.map((join, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto,1fr,1fr,auto] gap-2 items-center">
                  <Select onValueChange={(v) => updateJoin(index, 'leftTable', v)} value={join.leftTable}><SelectTrigger><SelectValue placeholder="Left Table" /></SelectTrigger><SelectContent>{selectedTables.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                  <Select onValueChange={(v) => updateJoin(index, 'leftColumn', v)} value={join.leftColumn} disabled={!join.leftTable}><SelectTrigger><SelectValue placeholder="Left Column" /></SelectTrigger><SelectContent>{join.leftTable && schema[join.leftTable]?.map((c: any) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>
                  <Select onValueChange={(v) => updateJoin(index, 'type', v)} value={join.type}><SelectTrigger className="w-[120px] mx-auto"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="INNER">Inner</SelectItem><SelectItem value="LEFT">Left</SelectItem><SelectItem value="RIGHT">Right</SelectItem></SelectContent></Select>
                  <Select onValueChange={(v) => updateJoin(index, 'rightTable', v)} value={join.rightTable}><SelectTrigger><SelectValue placeholder="Right Table" /></SelectTrigger><SelectContent>{selectedTables.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                  <Select onValueChange={(v) => updateJoin(index, 'rightColumn', v)} value={join.rightColumn} disabled={!join.rightTable}><SelectTrigger><SelectValue placeholder="Right Column" /></SelectTrigger><SelectContent>{join.rightTable && schema[join.rightTable]?.map((c: any) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>
                  <Button variant="ghost" size="icon" onClick={() => removeJoin(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              ))}
              <Button onClick={addJoin} variant="secondary" size="sm">+ Add Join</Button>
            </div>
          </div>
        )}

        {selectedTables.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">4. Define Unions</label>
            <div className="space-y-4 p-4 border rounded-md">
              {unions.map((union, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Union #{index + 1}</h4>
                    <Button variant="ghost" size="icon" onClick={() => removeUnion(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedTables.map(table => (
                      <div key={table} className="flex items-center space-x-2">
                        <Checkbox
                          id={`union-${index}-${table}`}
                          checked={union.tables.includes(table)}
                          onCheckedChange={() => updateUnion(index, table)}
                        />
                        <label htmlFor={`union-${index}-${table}`}>{table}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button onClick={addUnion} variant="secondary" size="sm">+ Add Union</Button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button onClick={onCancel} variant="outline">Cancel</Button>
          <Button onClick={handleSaveDataMart}>{isEditMode ? 'Update Data Mart' : 'Save Data Mart'}</Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

const QueryEditor = ({ onCancel }: { onCancel: () => void }) => {
  const { toast } = useToast();
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [dataMartName, setDataMartName] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/data-sources', { credentials: 'include' })
      .then(res => res.json())
      .then(setDataSources)
      .catch(err => console.error('Failed to fetch data sources:', err));
  }, []);

  const executeQuery = async () => {
    if (!selectedSource || !sqlQuery.trim()) {
      toast({ title: 'Error', description: 'Please select a data source and enter a query.', variant: 'destructive' });
      return;
    }

    setIsExecuting(true);
    try {
      const response = await fetch('/api/data-marts/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          data_source_id: selectedSource,
          query: sqlQuery
        })
      });

      const result = await response.json();
      if (response.ok) {
        setQueryResult(result);
        toast({ title: 'Success', description: 'Query executed successfully.' });
      } else {
        toast({ title: 'Error', description: result.message || 'Query execution failed.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to execute query.', variant: 'destructive' });
    } finally {
      setIsExecuting(false);
    }
  };

  const saveDataMart = async () => {
    if (!dataMartName.trim() || !selectedSource || !sqlQuery.trim()) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/data-marts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: dataMartName,
          data_source_id: selectedSource,
          query: sqlQuery,
          type: 'query'
        })
      });

      const result = await response.json();
      if (response.ok) {
        toast({ title: 'Success', description: 'Data mart created successfully.' });
        onCancel();
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to create data mart.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save data mart.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Beautiful Header */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl text-white shadow-lg">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Data Mart Query Editor
              </CardTitle>
              <p className="text-gray-600 text-sm mt-1">Write custom SQL queries to create advanced data marts</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card className="border-2">
        <CardContent className="space-y-6 pt-6">
          {/* Data Mart Name */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-100">
            <label className="block text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Data Mart Name
            </label>
            <Input 
              placeholder="Enter a descriptive name for your data mart..."
              value={dataMartName}
              onChange={(e) => setDataMartName(e.target.value)}
              className="border-2 border-green-200 focus:border-green-400 bg-white"
            />
          </div>

          {/* Data Source Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-100">
            <label className="block text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Source
            </label>
            <Select onValueChange={setSelectedSource} value={selectedSource}>
              <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 bg-white">
                <SelectValue placeholder="Choose a data source..." />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map(ds => (
                  <SelectItem key={ds.id} value={ds.id.toString()}>
                    {ds.name} ({ds.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SQL Query Editor */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
            <label className="block text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
              <Code className="h-4 w-4" />
              SQL Query
            </label>
            <textarea
              className="w-full h-64 p-4 border-2 border-purple-200 focus:border-purple-400 rounded-lg font-mono text-sm bg-white shadow-inner"
              placeholder="Enter your SQL query here...\n\nExample:\nSELECT \n  customer_id,\n  SUM(order_amount) as total_spent,\n  COUNT(*) as order_count\nFROM orders \nWHERE order_date >= '2024-01-01'\nGROUP BY customer_id\nORDER BY total_spent DESC"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
            />
            <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Write your SQL query to transform and aggregate data
            </p>
          </div>

          {/* Test Query Button */}
          <div className="flex gap-3">
            <Button 
              onClick={executeQuery} 
              disabled={isExecuting || !selectedSource || !sqlQuery.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              {isExecuting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Executing Query...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Test Query
                </>
              )}
            </Button>
          </div>

        {queryResult && (
          <div>
            <h3 className="text-lg font-medium mb-2">Query Results</h3>
            <div className="border rounded-md p-4 bg-gray-50 max-h-64 overflow-auto">
              <p className="text-sm text-gray-600 mb-2">
                Rows returned: {queryResult.rows?.length || 0}
              </p>
              {queryResult.rows && queryResult.rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(queryResult.rows[0]).map(col => (
                          <th key={col} className="text-left p-2 font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.slice(0, 10).map((row: any, idx: number) => (
                        <tr key={idx} className="border-b">
                          {Object.values(row).map((val: any, colIdx: number) => (
                            <td key={colIdx} className="p-2">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {queryResult.rows.length > 10 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Showing first 10 rows of {queryResult.rows.length} total rows
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button onClick={onCancel} variant="outline">Cancel</Button>
          <Button 
            onClick={saveDataMart} 
            disabled={isSaving || !dataMartName.trim() || !selectedSource || !sqlQuery.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Data Mart'}
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

const DataMartBuilder: React.FC<{ connectionStatus?: string }> = ({ connectionStatus }) => {
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'select' | 'ui-builder' | 'query-editor'>('list');
    const [dataMarts, setDataMarts] = useState<any[]>([]);
  const [editingDataMartId, setEditingDataMartId] = useState<number | null>(null);

  useEffect(() => {
    if (view === 'list') {
      fetch('/api/data-marts', { credentials: 'include' })
        .then(res => res.json())
        .then(setDataMarts)
        .catch(err => console.error('Failed to fetch data marts:', err));
    }
  }, [view]);

  const handleEdit = (id: number) => {
    setEditingDataMartId(id);
    setView('ui-builder');
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/data-marts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setDataMarts(dataMarts.filter(dm => dm.id !== id));
        toast({ title: 'Success', description: 'Data mart deleted successfully.' });
      } else {
        const errorData = await response.json();
        toast({ title: 'Error', description: errorData.message || 'Failed to delete data mart.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'select':
        return (
          <div className="max-w-5xl mx-auto">
            {/* Hero Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-6">
                <Boxes className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                How would you like to build your Data Mart?
              </h2>
              <p className="text-gray-600 text-lg">Choose your preferred method to create a powerful data mart</p>
            </div>

            {/* Builder Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* UI Builder Card */}
              <Card 
                className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-400 cursor-pointer overflow-hidden"
                onClick={() => setView('ui-builder')}
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-600"></div>
                <CardHeader className="pb-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                      <LayoutGrid className="h-12 w-12 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      UI Builder
                    </CardTitle>
                    <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-200">Visual Interface</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-center text-gray-600 text-base">
                    Build your data mart visually by selecting tables, columns, and defining relationships with an intuitive drag-and-drop interface.
                  </CardDescription>
                  
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">✓</span>
                      </div>
                      <span>Select tables & columns visually</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">✓</span>
                      </div>
                      <span>Define joins & relationships</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">✓</span>
                      </div>
                      <span>No SQL knowledge required</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    onClick={() => setView('ui-builder')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Start with UI Builder
                  </Button>
                </CardContent>
              </Card>

              {/* Query Editor Card */}
              <Card 
                className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-400 cursor-pointer overflow-hidden"
                onClick={() => setView('query-editor')}
              >
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                <CardHeader className="pb-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                      Query Editor
                    </CardTitle>
                    <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">SQL Power</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-center text-gray-600 text-base">
                    Write custom SQL queries to build advanced data marts with full control over your data transformations and logic.
                  </CardDescription>
                  
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold">✓</span>
                      </div>
                      <span>Write custom SQL queries</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold">✓</span>
                      </div>
                      <span>Advanced transformations & logic</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold">✓</span>
                      </div>
                      <span>Full SQL control & flexibility</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => setView('query-editor')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Start with Query Editor
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Cancel Button */}
            <div className="text-center">
              <Button 
                onClick={() => setView('list')} 
                variant="outline" 
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        );
            case 'ui-builder':
        return <UiBuilder onCancel={() => { setView('list'); setEditingDataMartId(null); }} dataMartId={editingDataMartId} />;
      case 'query-editor':
        return <QueryEditor onCancel={() => setView('list')} />;
      case 'list':
      default:
        const getMartTypeIcon = (dm: any) => {
          // Determine icon based on mart type/definition
          if (dm.definition?.joins && dm.definition.joins.length > 0) return <Layers className="h-4 w-4" />;
          if (dm.definition?.unions && dm.definition.unions.length > 0) return <Activity className="h-4 w-4" />;
          return <Table className="h-4 w-4" />;
        };

        const getMartColor = (index: number) => {
          const colors = [
            'from-green-500 to-emerald-600',
            'from-blue-500 to-cyan-600',
            'from-purple-500 to-pink-600',
            'from-orange-500 to-red-600',
            'from-indigo-500 to-blue-600',
            'from-teal-500 to-green-600'
          ];
          return colors[index % colors.length];
        };

        return (
          <div>
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    Data Marts
                  </h1>
                  <p className="text-gray-600">Build and manage your analytical data marts</p>
                </div>
                <Button 
                  onClick={() => setView('select')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Data Mart
                </Button>
              </div>
              
              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-green-100/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Marts</p>
                      <p className="text-2xl font-bold text-green-700">{dataMarts.length}</p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-xl">
                      <Boxes className="h-6 w-6 text-green-700" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">With Joins</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {dataMarts.filter(dm => dm.definition?.joins && dm.definition.joins.length > 0).length}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-xl">
                      <Layers className="h-6 w-6 text-blue-700" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Data Sources</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {new Set(dataMarts.map(dm => dm.data_source_id)).size}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-200 rounded-xl">
                      <Database className="h-6 w-6 text-purple-700" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">Recently Updated</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {dataMarts.filter(dm => {
                          const daysSinceUpdate = (Date.now() - new Date(dm.updated_at).getTime()) / (1000 * 60 * 60 * 24);
                          return daysSinceUpdate < 7;
                        }).length}
                      </p>
                    </div>
                    <div className="p-3 bg-amber-200 rounded-xl">
                      <Clock className="h-6 w-6 text-amber-700" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Data Marts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataMarts.map((dm, index) => (
                <Card 
                  key={dm.id} 
                  className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-300 overflow-hidden"
                >
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${getMartColor(index)}`}></div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 bg-gradient-to-br ${getMartColor(index)} rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          <Boxes className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                            {dm.name}
                          </CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            {getMartTypeIcon(dm)}
                            <Badge variant="outline" className="text-xs">
                              {dm.definition?.joins?.length > 0 ? 'Joined' : 
                               dm.definition?.unions?.length > 0 ? 'Unioned' : 'Simple'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Mart Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Table className="h-4 w-4" />
                        <span>{dm.definition?.tables?.length || 0} table(s)</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Updated {new Date(dm.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleEdit(dm.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete the "{dm.name}" data mart.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button variant="destructive" onClick={() => handleDelete(dm.id)}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {dataMarts.length === 0 && (
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
                    <Boxes className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Marts Yet</h3>
                  <p className="text-gray-500 mb-6 text-center max-w-md">
                    Start building your analytical data marts by combining tables, creating joins, and unions from your data sources!
                  </p>
                  <Button 
                    onClick={() => setView('select')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Data Mart
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );
    }
  };

  return <div className="p-6">{renderContent()}</div>;
};

export default DataMartBuilder;
