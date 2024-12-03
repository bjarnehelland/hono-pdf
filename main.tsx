import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { chromium as playwright } from "playwright";

const app = new Hono();

const temporaryDataStore = new Map();

const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{props.children}</body>
    </html>
  );
};

const Top: FC<{ messages: string[]; incomes: Income[] }> = (props) => {
  return (
    <Layout>
      <h1>Hello fdsjklfds!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li class="bg-red-500">{message}!!</li>;
        })}
      </ul>
      <Incomes incomes={props.incomes} />
    </Layout>
  );
};

interface Income {
  owner: string;
  value: number;
  type: "SALARY" | "PENSION";
}

const Incomes: FC<{ incomes: Income[] }> = (props: { incomes: Income[] }) => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Incomes</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Owner</th>
            <th className="py-2">Type</th>
            <th className="py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {props.incomes.map((income) => (
            <tr className="hover:bg-gray-100">
              <td className="border px-4 py-2">{income.owner}</td>
              <td className="border px-4 py-2">{income.type}</td>
              <td className="border px-4 py-2">${income.value.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

app.post("/pdf", async (c) => {
  const { data, flowId } = await c.req.json();

  // TODO: should we validate input?
  temporaryDataStore.set(flowId, data);

  // TODO: maybe we should cleanup temporary storage after some time in case /report endpoint fails?

  const browser = await playwright.launch({
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`http://localhost:3000/report?id=${flowId}`, {
    waitUntil: "networkidle",
  });

  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  // Close the browser
  await browser.close();

  // Set response headers for PDF
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", "attachment; filename=report.pdf");

  // return new Response(pdfBuffer);
  return c.body(pdfBuffer);
});

app.get("/report", (c) => {
  const { id } = c.req.query();
  const data = temporaryDataStore.get(id);
  if (!data) {
    return c.text("Data not found", 404);
  }

  console.log(data);
  return c.html(<Top messages={["Hello", ""]} incomes={data.incomes || []} />);
});

export default app;
