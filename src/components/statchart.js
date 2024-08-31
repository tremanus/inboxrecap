import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
);

export const createChartData = (stats) => ({
  labels: ['Marked as Read', 'Summarized', 'Sent to Trash'],
  datasets: [
    {
      data: [
        stats?.emails_marked_as_read || 0,
        stats?.emails_summarized || 0,
        stats?.emails_sent_to_trash || 0,
      ],
      borderColor: '#36A2EB',
      backgroundColor: [
        '#1041bd',
        '#109148',
        '#c42a1f',
      ],
      borderWidth: 2,
      pointBackgroundColor: [
        '#1041bd',
        '#109148',
        '#c42a1f',
      ],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      tension: 0.1,
    },
  ],
});

export const chartOptions = {
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: (tooltipItem) => {
          return `${tooltipItem.label}: ${tooltipItem.raw}`;
        },
      },
      titleFont: {
        family: "'Poppins', sans-serif",
        size: 16,
        weight: '600',
      },
      bodyFont: {
        family: "'Poppins', sans-serif",
        size: 14,
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'Poppins', sans-serif",
          size: 12,
          weight: '600',
        },
      },
    },
    y: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'Poppins', sans-serif",
          size: 12,
          weight: '600',
        },
        beginAtZero: true,
      },
    },
  },
  layout: {
    padding: {
      top: 30,
      right: 0,
      bottom: 20,
      left: 0,
    },
  },
};
