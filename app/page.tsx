import { supabaseAdmin } from "@/lib/supabase";

export default function Home() {
  const setNewValue = async () => {
    const { data, error } = await supabaseAdmin
      .from('view')
      .insert({
        name: 'Seif'
      })
    if (data) {
      console.log('Data inserted successfully:', data);
    }
    if (error) {
      console.error('Error inserting data:', error);
    }
  }

  setNewValue();

  return (
    <div>hello</div>
  );
}
