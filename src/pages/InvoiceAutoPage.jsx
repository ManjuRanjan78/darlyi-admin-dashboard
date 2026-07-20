import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import Invoice from "./Invoice";
import { BaseUrl } from "../BaseUrl";

export default function InvoiceAutoPage() {
  const { userId } = useParams();
  const invoiceRef = useRef();
  const [loading, setLoading] = useState(true);
  const [invData, setInvData] = useState("");
  const fetchGifts = async () => {
    try {
      const res = await axios.get( 
        `${BaseUrl.baseurl}/user/get-transaction-details/${userId}`,
      );

      const all = res.data?.data || [];
      setInvData(all);
    setLoading(false);
    } catch (err) {
      console.error("Fetch gifts error", err);
    } finally {
      //
    }
  };

  useEffect(() => {
    fetchGifts();
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      generateUploadAndDownload();
    }
  }, [loading]);

  const generateUploadAndDownload = async () => {
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 794,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.6);

      const pdf = new jsPDF("p", "mm", "a4", true);
      const pageWidth = 210;
      const pageHeight = 297;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let y = 0;

      let finalImgWidth = pageWidth; // ✅ always full width
      let finalImgHeight = imgHeight; // proportional height

      // 🔹 If too tall, scale HEIGHT only
      if (imgHeight > pageHeight) {
        const scaleRatio = pageHeight / imgHeight;
        finalImgHeight = pageHeight;
        finalImgWidth = pageWidth; // still full width
      }

      // 🔹 Full width, center vertically only
      const x = 0; // 👈 full width, no horizontal centering
      const yPos = (pageHeight - finalImgHeight) / 2;

      pdf.addImage(
        imgData,
        "JPEG",
        x,
        yPos,
        finalImgWidth,
        finalImgHeight,
        undefined,
        "FAST", // 🔹 compression hint
      );
      const blob = pdf.output("blob");
// pdf.save(`invoice-${userId}.pdf`);
      const formData = new FormData();
      formData.append("image", blob, `invoice-${userId}.pdf`);
      const res = await axios.post(
        `${BaseUrl.baseurl}/user/upload-invoice/${userId}`,
        formData,
      );
      const fileUrl = res.data?.data?.invoice;
      let invoiceDtaa = {
        type: "invoiceDone",
        file: fileUrl,
        fileName: `invoice-${userId}.pdf`,
      };
      console.log(JSON.stringify(invoiceDtaa));
    } catch (err) {
      console.error("Invoice generation failed", err);
    }
  };

  return (
    <div>
      {loading ? (
        <p className="text-center mt-10">Generating invoice...</p>
      ) : (
        <Invoice ref={invoiceRef} userId={userId} invData={invData}  app={"togilo"} />
      )}
    </div>
  );
}
