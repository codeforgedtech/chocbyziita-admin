import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      <h4>Försäljning per månad</h4>
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Försäljning Översikt',
            },
          },
        }}
      />
    </div>
  );
};

export default BarChart;
