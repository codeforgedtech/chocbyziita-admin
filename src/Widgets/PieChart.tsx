import React from 'react';
import { Pie } from 'react-chartjs-2';

const PieChart: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div>
      <h4>Försäljningsfördelning</h4>
      <Pie
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom' as const,
            },
            title: {
              display: true,
              text: 'Försäljnings Fördelning',
            },
          },
        }}
      />
    </div>
  );
};

export default PieChart;
