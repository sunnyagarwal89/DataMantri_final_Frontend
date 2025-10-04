import React from 'react';

const sourceTypes = [
  {
    name: 'PostgreSQL',
    logo: 'https://cdn.icon-icons.com/icons2/2415/PNG/512/postgresql_plain_wordmark_logo_icon_146390.png',
    type: 'postgres',
  },
  {
    name: 'MongoDB',
    logo: 'https://cdn.icon-icons.com/icons2/2415/PNG/512/mongodb_original_wordmark_logo_icon_146425.png',
    type: 'mongodb',
  },
  {
    name: 'Google BigQuery',
    logo: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/google_bigquery_logo_icon_169050.png',
    type: 'bigquery',
  },
];

interface DataSourceSelectorProps {
  onSelect: (type: string) => void;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ onSelect }) => {
  return (
    <div>
      <h2 className="text-center text-2xl font-bold mb-6">Choose a Data Source</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sourceTypes.map((source) => (
          <div
            key={source.type}
            onClick={() => onSelect(source.type)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center"
          >
            <img src={source.logo} alt={`${source.name} logo`} className="h-20 mb-4" />
            <h3 className="text-lg font-semibold">{source.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSourceSelector;
