

import { useState } from "react";
import api from "../services/axiosClient";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import Invoice from "./Invoice";

import { createRoot } from "react-dom/client";

export default function BulkInvoiceDownload() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const generateSinglePdfBlob = async (userId, invData) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.left = "-99999px";
    tempDiv.style.top = "0";
    tempDiv.style.width = "794px";
    tempDiv.style.background = "#fff";
    document.body.appendChild(tempDiv);

    const root = createRoot(tempDiv);

    await new Promise((resolve) => {
      root.render(
        <Invoice
          ref={(node) => {
            if (node) resolve();
          }}
          userId={userId}
          invData={invData}
        />,
      );
    });

    await sleep(600);

    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.8);

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const blob = pdf.output("blob");

    root.unmount();
    document.body.removeChild(tempDiv);

    return blob;
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setProgress("Fetching transactions...");

      const res = await api.get("admin/transaction-invoice", {
  params: {
    fromDate,
    toDate,
  },
});

      const allData = res.data?.data || [];

      if (!allData.length) {
        alert("No data found");
        setLoading(false);
        return;
      }

      const zip = new JSZip();

      for (let i = 0; i < allData.length; i++) {
        const item = allData[i];

        setProgress(`Generating ${i + 1} / ${allData.length}`);

        const pdfBlob = await generateSinglePdfBlob(item.userId?._id, item);

        zip.file(
          `Invoice_${item.userId?.userId}_${item.userId?.name}_${i + 1}.pdf`,
          pdfBlob,
        );
      }

      setProgress("Creating ZIP file...");

      const zipBlob = await zip.generateAsync({ type: "blob" });

      saveAs(zipBlob, `Invoices_${fromDate}_to_${toDate}.zip`);

      setProgress("Completed");
    } catch (error) {
      console.error(error);
      alert("Failed to generate invoices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" text-white flex gap-2 lg:justify-end">
      <div className="bg-slate-900 rounded-xl px-6 py-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block mb-2 text-sm">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-slate-800 px-4 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-slate-800 px-4 py-2 rounded-lg"
          />
        </div>

        <button
          onClick={handleDownload}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold"
        >
          {loading ? "Please Wait..." : "Download All"}
        </button>
        {loading && (
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 px-6 py-2 rounded-lg font-semibold"
          >
            Stop
          </button>
        )}
      </div>

      {loading && (
        <div className=" bg-slate-800 rounded-lg p-4">
          <p className="text-sm">{progress}</p>

          <div className="w-full bg-slate-700 h-2 rounded mt-3 overflow-hidden">
            <div className="bg-green-500 h-2 animate-pulse w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}
