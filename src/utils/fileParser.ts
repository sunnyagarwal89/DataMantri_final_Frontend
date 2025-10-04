import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedData {
  [tableName: string]: {
    headers: string[];
    data: any[][];
    rowCount: number;
    columnCount: number;
  };
}

export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'excel' | 'json';
  tables: ParsedData;
  uploadedAt: Date;
  fileName: string;
  fileSize: number;
}

export class FileParser {
  static async parseCSV(file: File): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const tableName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
          const data = results.data as string[][];

          if (data.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          const headers = data[0] || [];
          const rows = data.slice(1);

          resolve({
            [tableName]: {
              headers,
              data: rows,
              rowCount: rows.length,
              columnCount: headers.length
            }
          });
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  static async parseExcel(file: File): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const parsedData: ParsedData = {};

          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              defval: null
            }) as any[][];

            if (jsonData.length === 0) {
              return; // Skip empty sheets
            }

            const headers = jsonData[0]?.map(String) || [];
            const rows = jsonData.slice(1);

            parsedData[sheetName] = {
              headers,
              data: rows,
              rowCount: rows.length,
              columnCount: headers.length
            };
          });

          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Excel parsing error: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  static async parseFile(file: File): Promise<ParsedData> {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    switch (fileType) {
      case 'csv':
        return this.parseCSV(file);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}

export class DataSourceManager {
  private dataSources: DataSource[] = [];
  private nextId = 1;

  addDataSource(file: File, parsedData: ParsedData): DataSource {
    const dataSource: DataSource = {
      id: `ds_${this.nextId++}`,
      name: file.name,
      type: file.name.includes('.csv') ? 'csv' : 'excel',
      tables: parsedData,
      uploadedAt: new Date(),
      fileName: file.name,
      fileSize: file.size
    };

    this.dataSources.push(dataSource);
    return dataSource;
  }

  getDataSources(): DataSource[] {
    return this.dataSources;
  }

  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.find(ds => ds.id === id);
  }

  getTableData(dataSourceId: string, tableName: string): any[][] | null {
    const dataSource = this.getDataSource(dataSourceId);
    return dataSource?.tables[tableName]?.data || null;
  }

  getTableHeaders(dataSourceId: string, tableName: string): string[] | null {
    const dataSource = this.getDataSource(dataSourceId);
    return dataSource?.tables[tableName]?.headers || null;
  }

  removeDataSource(id: string): boolean {
    const index = this.dataSources.findIndex(ds => ds.id === id);
    if (index !== -1) {
      this.dataSources.splice(index, 1);
      return true;
    }
    return false;
  }

  getAllTableNames(): Array<{ dataSourceId: string; dataSourceName: string; tableName: string }> {
    const tables: Array<{ dataSourceId: string; dataSourceName: string; tableName: string }> = [];

    this.dataSources.forEach(ds => {
      Object.keys(ds.tables).forEach(tableName => {
        tables.push({
          dataSourceId: ds.id,
          dataSourceName: ds.name,
          tableName
        });
      });
    });

    return tables;
  }
}
