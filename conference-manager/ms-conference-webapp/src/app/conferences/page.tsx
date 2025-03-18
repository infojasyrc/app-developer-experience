// import { useEffect, useState } from "react";

export default function Conferences() {
//   const [conferences, setConferences] = useState<Conference[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchConferences();
//   }, []);

//   const fetchConferences = async () => {
//     try {
//       const response = await fetch("http://localhost:3000/v1/conferences");
//       const data = await response.json();
//       setConferences(data);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching conferences", error);
//     }
//   };

//   return (
//     <div>
//       <h1>Conferences</h1>
//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <ul>
//           {conferences.map((conference) => (
//             <li key={conference.id}>{conference.name}</li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
  return (
    <div><h1>Conferences</h1></div>
  );
}
