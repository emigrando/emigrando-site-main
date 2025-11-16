const BASE_URL = "https://api.airtable.com/v0";
const AIRTABLE_BASE = process.env.AIRTABLE_BASE!;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const TBL = "Visits";

async function getVisits() {
  const res = await fetch(`${BASE_URL}/${AIRTABLE_BASE}/${encodeURIComponent(TBL)}?pageSize=100&sort[0][field]=Timestamp&sort[0][direction]=desc`, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    cache: "no-store"
  });
  const j = await res.json();
  return j.records || [];
}

export default async function Page() {
  const visits = await getVisits();
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Visitas recientes</h1>
      <div className="mt-4 overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Path</th>
              <th className="px-3 py-2 text-left">Referer</th>
              <th className="px-3 py-2 text-left">UA</th>
              <th className="px-3 py-2 text-left">IPHash</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((r:any)=>(
              <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2">{r.fields?.Timestamp}</td>
                <td className="px-3 py-2">{r.fields?.Path}</td>
                <td className="px-3 py-2 max-w-[360px] truncate">{r.fields?.Referer}</td>
                <td className="px-3 py-2 max-w-[420px] truncate">{r.fields?.UA}</td>
                <td className="px-3 py-2">{r.fields?.IPHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
