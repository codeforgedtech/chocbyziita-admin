import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify'; // Importera toast
import 'react-toastify/dist/ReactToastify.css'; // Importera CSS för toast

const ProtectedRouter: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser(); // Får user-objektet från Supabase
  
      if (user) {
        // Endast om user finns kan vi komma åt user.id
        const { data: profile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id) // user.id är tillgänglig här efter kontrollen
          .single();
  
        if (error || profile?.role !== 'admin') {
          setIsAdmin(false);
          toast.error('Ingen administratörsbehörighet!'); // Visa fel toast
        } else {
          setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
        toast.error('Ej inloggad! Vänligen logga in.'); // Visa fel toast om användaren inte är inloggad
      }
    };
  
    checkAdmin();
  }, []);

  if (isAdmin === null) {
    toast.info('Kontrollerar behörighet...'); // Visa info toast medan vi kontrollerar
    return <div>Kontrollerar behörighet...</div>;
  }

  return isAdmin ? children : <Navigate to="/login" />;
};

export default ProtectedRouter;
