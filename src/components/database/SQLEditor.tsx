import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  database: string;
  height?: string;
}

interface DatabaseSchema {
  tables: string[];
  schema: Record<string, Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }>>;
}

const SQLEditor: React.FC<SQLEditorProps> = ({ 
  value, 
  onChange, 
  database, 
  height = '200px' 
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);

  // Fetch database schema for autocomplete
  useEffect(() => {
    console.log('SQLEditor: Database prop changed:', database);
    if (database) {
      fetchDatabaseSchema();
    }
  }, [database]);

  const fetchDatabaseSchema = async () => {
    try {
      console.log('SQLEditor: Fetching schema for database:', database);
      
      let response: Response | undefined;
      // Prefer name-based wrappers to avoid ID lookups
      if (database === 'DataMantri Primary Database') {
        response = await fetch('/api/database/primary/schema', { credentials: 'include' });
      } else if (database === 'Datamart') {
        response = await fetch('/api/database/Datamart/schema', { credentials: 'include' });
      } else {
        const encoded = encodeURIComponent(database);
        response = await fetch(`/api/database/${encoded}/schema`, { credentials: 'include' });
      }
      
      console.log('SQLEditor: Schema response status:', response?.status);
      
      if (response && response.ok) {
        const result = await response.json();
        console.log('SQLEditor: Schema result:', result);
        
        if (result.status === 'success') {
          if (database === 'DataMantri Primary Database') {
            // Primary database returns tables array with columns
            const schemaData: Record<string, any[]> = {};
            result.tables.forEach((table: any) => {
              schemaData[table.name] = table.columns.map((col: any) => ({
                column_name: col.name,
                data_type: col.type,
                is_nullable: col.nullable ? 'YES' : 'NO',
                column_default: col.default
              }));
            });
            
            setSchema({
              tables: result.tables.map((t: any) => t.name),
              schema: schemaData
            });
          } else {
            // External data sources return schema object
            setSchema({
              tables: Object.keys(result.schema),
              schema: result.schema
            });
          }
          const tableCount = database === 'DataMantri Primary Database' ? result.tables.length : Object.keys(result.schema).length;
          console.log('SQLEditor: Schema set successfully, tables:', tableCount);
          console.log('SQLEditor: Table names:', database === 'DataMantri Primary Database' ? result.tables.map((t: any) => t.name) : Object.keys(result.schema));
        } else {
          console.error('SQLEditor: Schema fetch failed:', result.message);
        }
      } else {
        console.error('SQLEditor: Schema response not ok:', response?.status);
      }
    } catch (error) {
      console.error('SQLEditor: Failed to fetch database schema:', error);
    }
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;

    // Register SQL completion provider with triggerCharacters
    const disposable = monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: [' ', '.', '\n'],
      provideCompletionItems: (model, position) => {
        const suggestions: monaco.languages.CompletionItem[] = [];

        if (!schema) {
          console.log('SQLEditor: No schema available for autocomplete');
          // Still provide basic SQL keywords even without schema
          const basicKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INSERT', 'UPDATE', 'DELETE'];
          basicKeywords.forEach(keyword => {
            suggestions.push({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: model.getWordUntilPosition(position).startColumn,
                endColumn: model.getWordUntilPosition(position).endColumn,
              }
            });
          });
          return { suggestions };
        }
        
        console.log('SQLEditor: Providing completions, schema has', schema.tables.length, 'tables');
        console.log('SQLEditor: Available tables:', schema.tables);

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Get current line text to understand context
        const lineText = model.getLineContent(position.lineNumber).toLowerCase();
        const textBeforeCursor = lineText.substring(0, position.column - 1);
        const allText = model.getValue().toLowerCase();

        // Detect context for smarter suggestions
        const isAfterSelect = /\bselect\s+$/i.test(textBeforeCursor);
        const isAfterFrom = /\bfrom\s+$/i.test(textBeforeCursor);
        const isAfterWhere = /\bwhere\s+/i.test(textBeforeCursor);
        const isAfterJoin = /\b(join|inner\s+join|left\s+join|right\s+join)\s+$/i.test(textBeforeCursor);
        const isAfterOn = /\bon\s+$/i.test(textBeforeCursor);
        const isInSelectClause = /\bselect\b/i.test(textBeforeCursor) && !/\bfrom\b/i.test(textBeforeCursor);

        console.log('SQLEditor: Current context - isAfterFrom:', isAfterFrom, 'isAfterJoin:', isAfterJoin);
        console.log('SQLEditor: Text before cursor:', textBeforeCursor);

        // SQL Keywords with context awareness
        const sqlKeywords = [
          'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
          'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE',
          'ALTER', 'DROP', 'INDEX', 'TABLE', 'DATABASE', 'AND', 'OR', 'NOT', 'NULL',
          'IS', 'IN', 'LIKE', 'BETWEEN', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE',
          'END', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'LIMIT',
          'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT', 'ON', 'USING'
        ];

        // Add SQL keywords
        sqlKeywords.forEach(keyword => {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range,
            detail: 'SQL Keyword'
          });
        });

        // Always add table suggestions (with context-aware priority)
        const tablePriority = (isAfterFrom || isAfterJoin) ? '0_' : '3_';
        console.log('SQLEditor: Adding table suggestions with priority:', tablePriority);
        
        schema.tables.forEach(tableName => {
          console.log('SQLEditor: Adding table suggestion:', tableName);
          suggestions.push({
            label: tableName,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: tableName,
            range: range,
            detail: 'Table',
            documentation: `Table: ${tableName}`,
            sortText: `${tablePriority}${tableName}`
          });
        });
        
        console.log('SQLEditor: Total table suggestions added:', schema.tables.length);

        // Context-aware column suggestions
        Object.entries(schema.schema).forEach(([tableName, columns]) => {
          columns.forEach(column => {
            // High priority for columns in SELECT clause
            if (isAfterSelect || isInSelectClause) {
              suggestions.push({
                label: column.column_name,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: column.column_name,
                range: range,
                detail: `Column (${column.data_type})`,
                documentation: `${tableName}.${column.column_name} - ${column.data_type}${column.is_nullable === 'YES' ? ' (nullable)' : ' (not null)'}`,
                sortText: `0_${column.column_name}`
              });

              // Also suggest table.column format
              suggestions.push({
                label: `${tableName}.${column.column_name}`,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: `${tableName}.${column.column_name}`,
                range: range,
                detail: `Column (${column.data_type})`,
                documentation: `${tableName}.${column.column_name} - ${column.data_type}${column.is_nullable === 'YES' ? ' (nullable)' : ' (not null)'}`,
                sortText: `1_${tableName}.${column.column_name}`
              });
            }
            
            // Medium priority for columns in WHERE, ON clauses
            else if (isAfterWhere || isAfterOn) {
              suggestions.push({
                label: column.column_name,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: column.column_name,
                range: range,
                detail: `Column (${column.data_type})`,
                documentation: `${tableName}.${column.column_name} - ${column.data_type}${column.is_nullable === 'YES' ? ' (nullable)' : ' (not null)'}`,
                sortText: `1_${column.column_name}`
              });

              suggestions.push({
                label: `${tableName}.${column.column_name}`,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: `${tableName}.${column.column_name}`,
                range: range,
                detail: `Column (${column.data_type})`,
                documentation: `${tableName}.${column.column_name} - ${column.data_type}${column.is_nullable === 'YES' ? ' (nullable)' : ' (not null)'}`,
                sortText: `1_${tableName}.${column.column_name}`
              });
            }
            
            // Lower priority for general column suggestions
            else {
              suggestions.push({
                label: column.column_name,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: column.column_name,
                range: range,
                detail: `Column (${column.data_type})`,
                documentation: `${tableName}.${column.column_name} - ${column.data_type}${column.is_nullable === 'YES' ? ' (nullable)' : ' (not null)'}`,
                sortText: `2_${column.column_name}`
              });
            }
          });
        });

        // PostgreSQL functions
        const pgFunctions = [
          'NOW()', 'CURRENT_TIMESTAMP', 'CURRENT_DATE', 'CURRENT_TIME',
          'EXTRACT()', 'DATE_TRUNC()', 'AGE()', 'COALESCE()', 'NULLIF()',
          'CONCAT()', 'LENGTH()', 'UPPER()', 'LOWER()', 'TRIM()', 'SUBSTRING()',
          'CAST()', 'ARRAY_AGG()', 'STRING_AGG()', 'ROW_NUMBER()', 'RANK()',
          'DENSE_RANK()', 'LAG()', 'LEAD()'
        ];

        pgFunctions.forEach(func => {
          suggestions.push({
            label: func,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: func,
            range: range,
            detail: 'PostgreSQL Function'
          });
        });

        // SQL Snippets for common patterns
        const sqlSnippets = [
          {
            label: 'SELECT * FROM table',
            insertText: 'SELECT * FROM ${1:table_name}',
            detail: 'Basic SELECT statement',
            kind: monaco.languages.CompletionItemKind.Snippet
          },
          {
            label: 'SELECT columns FROM table WHERE',
            insertText: 'SELECT ${1:column1}, ${2:column2}\nFROM ${3:table_name}\nWHERE ${4:condition}',
            detail: 'SELECT with WHERE clause',
            kind: monaco.languages.CompletionItemKind.Snippet
          },
          {
            label: 'JOIN tables',
            insertText: 'SELECT ${1:t1.column}, ${2:t2.column}\nFROM ${3:table1} t1\nJOIN ${4:table2} t2 ON t1.${5:id} = t2.${6:foreign_id}',
            detail: 'JOIN two tables',
            kind: monaco.languages.CompletionItemKind.Snippet
          },
          {
            label: 'GROUP BY with COUNT',
            insertText: 'SELECT ${1:column}, COUNT(*) as count\nFROM ${2:table_name}\nGROUP BY ${1:column}\nORDER BY count DESC',
            detail: 'GROUP BY with aggregation',
            kind: monaco.languages.CompletionItemKind.Snippet
          },
          {
            label: 'INSERT INTO',
            insertText: 'INSERT INTO ${1:table_name} (${2:column1}, ${3:column2})\nVALUES (${4:value1}, ${5:value2})',
            detail: 'INSERT statement',
            kind: monaco.languages.CompletionItemKind.Snippet
          },
          {
            label: 'UPDATE SET WHERE',
            insertText: 'UPDATE ${1:table_name}\nSET ${2:column} = ${3:value}\nWHERE ${4:condition}',
            detail: 'UPDATE statement',
            kind: monaco.languages.CompletionItemKind.Snippet
          }
        ];

        // Add snippets only when not in specific contexts
        if (!isAfterFrom && !isAfterJoin && !isAfterWhere) {
          sqlSnippets.forEach(snippet => {
            suggestions.push({
              label: snippet.label,
              kind: snippet.kind,
              insertText: snippet.insertText,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range,
              detail: snippet.detail,
              sortText: `4_${snippet.label}` // Lower priority than context-specific suggestions
            });
          });
        }

        console.log('SQLEditor: Final suggestions count:', suggestions.length);
        console.log('SQLEditor: Sample suggestions:', suggestions.slice(0, 5).map(s => s.label));
        
        return { suggestions };
      }
    });

    // Configure editor options for better autocomplete
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      automaticLayout: true,
      wordWrap: 'on',
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showClasses: true,
        showFields: true,
        insertMode: 'replace',
        filterGraceful: true,
        snippetsPreventQuickSuggestions: false,
        localityBonus: true
      },
      quickSuggestions: {
        other: 'on',
        comments: 'off',
        strings: 'off'
      },
      quickSuggestionsDelay: 100,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'off' // Disable word-based suggestions to prioritize our custom ones
    });

    // Manual trigger with Ctrl+Space
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
    });

    // Trigger on specific keys
    editor.onKeyDown((e) => {
      // Trigger on space, dot, or after typing a few characters
      if (e.keyCode === monaco.KeyCode.Space || e.keyCode === monaco.KeyCode.Period) {
        setTimeout(() => {
          editor.trigger('auto', 'editor.action.triggerSuggest', {});
        }, 50);
      }
    });

    // Auto-trigger as user types
    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (model) {
        const position = editor.getPosition();
        if (position) {
          const word = model.getWordUntilPosition(position);
          // Trigger after typing at least 1 character
          if (word.word.length >= 1) {
            setTimeout(() => {
              editor.trigger('auto', 'editor.action.triggerSuggest', {});
            }, 200);
          }
        }
      }
    });
  };

  return (
    <div className="space-y-2">
      {/* Debug info */}
      <div className="text-xs text-gray-500 px-2">
        Database: {database || 'None'} | Tables: {schema ? schema.tables.length : 0} | Press Ctrl+Space for suggestions
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Editor
          height={height}
          defaultLanguage="sql"
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showFunctions: true,
              showClasses: true,
              showFields: true,
              insertMode: 'replace',
              filterGraceful: true,
              snippetsPreventQuickSuggestions: false
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on'
          }}
        />
      </div>
    </div>
  );
};

export default SQLEditor;
