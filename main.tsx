import { Hono } from "hono";
import type { FC } from "hono/jsx";
import puppeteer from "puppeteer";

const app = new Hono();

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

const Top: FC<{ messages: string[] }> = (props: { messages: string[] }) => {
  return (
    <Layout>
      <h1>Hello fdsjklfds!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li class="bg-red-500">{message}!!</li>;
        })}
      </ul>
    </Layout>
  );
};

app.post("/pdf", async (c) => {
  const { msg } = await c.req.query();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(`http://localhost:3000/report?msg=${msg}`, {
    waitUntil: "networkidle0", // Wait until the network is idle
  });

  // Generate PDF
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  // Close the browser
  await browser.close();

  // Set response headers for PDF
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", "attachment; filename=report.pdf");

  return c.body(pdf);
});

app.get("/report", (c) => {
  const { msg } = c.req.query();
  return c.html(<Top messages={["Hello", msg]} />);
});

export default app;
