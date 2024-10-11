import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { supabase } from '../supabaseClient'; // Importera Supabase-klienten

// Registrera nödvändiga komponenter
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SaleChart: React.FC = () => {
  const [monthlySales, setMonthlySales] = useState<number[]>(Array(12).fill(0)); // Försäljningsdata per månad
  const [loading, setLoading] = useState<boolean>(true); // Laddningstillstånd
  const [error, setError] = useState<string | null>(null); // Felhantering

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const { data, error } = await supabase
          .from('orders') // Tabellnamn
          .select('total_price, created_at'); // Kolumner att hämta

        if (error) {
          setError(error.message); // Spara felmeddelandet i state
          console.error('Error fetching sales data:', error.message); // Logga till konsolen
          return; // Avsluta funktionen vid fel
        }

        // Gruppér försäljningen efter månad
        const salesByMonth = Array(12).fill(0); // Array för att lagra månatliga försäljningar

        data.forEach((order: { total_price: number; created_at: string }) => {
          const orderDate = new Date(order.created_at); // Konvertera till ett datumobjekt
          const month = orderDate.getMonth(); // Få månaden från orderdatumet
          salesByMonth[month] += order.total_price; // Lägg till beloppet i rätt månad
        });

        setMonthlySales(salesByMonth); // Spara de beräknade försäljningsbeloppen
      } catch (error) {
        console.error('Error fetching sales data:', error); // Logga eventuella fel
        setError('Något gick fel vid hämtning av försäljningsdata.');
      } finally {
        setLoading(false); // Oavsett om det gick bra eller dåligt, sätt loading till false
      }
    };

    fetchSalesData(); // Anropa funktionen för att hämta data
  }, []); // Tom array som beroende innebär att den körs en gång vid mount

  // Diagramdata
  const data = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
    ], // Månader
    datasets: [
      {
        label: 'Försäljning (SEK)', // Namn på datasetet
        data: monthlySales, // Försäljningsdata
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Bakgrundsfärg för staplar
        borderColor: 'rgba(75, 192, 192, 1)', // Kantfärg för staplar
        borderWidth: 1, // Kantens tjocklek
      },
    ],
  };

  if (loading) return <div>Laddar försäljningsdata...</div>; // Visa laddningstext under hämtning
  if (error) return <div className="alert alert-danger">{error}</div>; // Visa felmeddelande om det finns ett

  // Visa enbart "Inga sålda produkter" om försäljningen för alla månader är 0
  const hasSales = monthlySales.some(sale => sale > 0); // Kontrollera om det finns någon försäljning

  return (
    <div>
      <h2>Försäljning per månad</h2>
      {hasSales ? (
        <Bar data={data} options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top', // Placering av legenden
            },
            title: {
              display: true,
              text: 'Månatlig Försäljning', // Titel på diagrammet
            },
          },
        }} />
      ) : (
        <p>Inget sålt.</p> // Visa meddelande om inga produkter såldes
      )}
    </div>
  );
};

export default SaleChart;

