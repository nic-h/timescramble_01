// src/convertSvgToPng.ts
import * as fs from "fs";
import * as path from "path";
import puppeteer from "puppeteer";

export async function convertSvgToPng(
  svgString: string,
  outputName: string
): Promise<string> {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      body, html { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    ${svgString}
  </body>
</html>`;
  const tempHtmlPath = path.join(__dirname, "temp.html");
  fs.writeFileSync(tempHtmlPath, html, "utf8");

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(`file://${tempHtmlPath}`);

  const pngTempPath = path.join(__dirname, `${outputName}.png`);
  await page.screenshot({
    path: pngTempPath as `${string}.png`,
    omitBackground: true,
  });

  await browser.close();
  fs.unlinkSync(tempHtmlPath);
  return pngTempPath;
}
